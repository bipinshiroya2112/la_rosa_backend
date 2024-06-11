const mongoose = require("mongoose");
var ObjectId = require("mongoose").Types.ObjectId;
const HTTP = require("../../constants/responseCode.constant");
const { genSaltSync, hashSync, compareSync } = require("bcrypt");
const UserSession = require("../models/userSession.model");
var bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const {
  formateUserData,
  createSessionAndJwtToken,
  sendEmail,
  sendEmailOTP,
  sendForgotPasswordLink,
  sendContactusemail,
} = require("../../public/partials/utils");
const Register = require("../models/register");
const admin_agent = require("../models/admin.agent");
const saveSearch = require("../models/savesearch.model");
const userSession = require("../models/userSession.model");
var bcrypt = require("bcryptjs");
var randomstring = require("randomstring");
const jwt = require("jsonwebtoken");
const cron = require("node-cron");
const Otp = require("../models/otp.model");
const { log } = require("handlebars");
const property_listing = require("../models/property_listing");
const contact = require("../models/contactusmodel");
const { request } = require("http");
// const serviceID = "VAe2e2e9000916b9296ac0a737e822b587"
// const accountsID = "ACa15e8faf0a240436169630f2712e47b3"
// const authToken = "85302ad861c5fff587d6ab6dc07c381e"
// const client = require('twilio')(accountsID, authToken)

async function dashboard(req, res) {
  try {
    const findsold = await property_listing.find({ status: "Sold" });
    const findsell = await property_listing.find({ status: "Active" });
    const allagent = await admin_agent.find();
    return res.status(HTTP.SUCCESS).send({
      status: true,
      code: HTTP.SUCCESS,
      message: "Please check your email.",
      data: {
        allsold: findsold.length,
        allsell: findsell.length,
        allagent: allagent.length,
      },
    });
  } catch (error) {
    console.log(error);
    return res.status(HTTP.SUCCESS).send({
      status: false,
      code: HTTP.INTERNAL_SERVER_ERROR,
      message: "Something went wrong!",
      data: {},
    });
  }
}

async function signup(req, res) {
  let {
    email,
    password,
    role,
    firstname = null,
    lastname = null,
    phoneNumber = null,
    status = null,
    SaveSearch = null,
    isVerified,
  } = req.body;
  console.log(req.body, " ---- signup ---- req.body");

  if (!email || !password) {
    return res.status(HTTP.SUCCESS).send({
      status: false,
      code: HTTP.NOT_FOUND,
      message: "All fields are required!",
      data: {},
    });
  }

  if (!email.includes("@")) {
    return res.status(HTTP.SUCCESS).send({
      status: false,
      code: HTTP.BAD_REQUEST,
      message: "Email is invalid!",
      data: {},
    });
  }

  if (password.length < 8 || password.length > 20) {
    return res.status(HTTP.SUCCESS).send({
      status: false,
      code: HTTP.BAD_REQUEST,
      message: "Please enter a strong password",
      data: {},
    });
  } else {
    const salt = genSaltSync(10);
    password = hashSync(password, salt);
  }

  //  check Register + verified
  const RegisterValid = await Register.findOne({
    $and: [{ email: email }, { isVerified: false }],
  });
  if (RegisterValid) {
    return res.status(HTTP.SUCCESS).send({
      status: false,
      code: HTTP.BAD_REQUEST,
      message: "user not verified.  ",
      data: {},
      page: "verifyOtp",
    });
  }

  const RegisterExists = await Register.findOne({ $or: [{ email: email }] });
  if (RegisterExists) {
    return res.status(HTTP.SUCCESS).send({
      status: false,
      code: HTTP.BAD_REQUEST,
      message: "User Exists. Please Sign In.",
      data: {},
      page: "signin",
    });
  }

  const otpCheck = randomstring.generate({ length: 4, charset: "numeric" });

  const RegisterData = await new Register({
    email,
    password,
    role,
    firstname,
    lastname,
    phoneNumber,
    otpCheck,
    status,
    isVerified,
    SaveSearch,
  }).save();

  if (!RegisterData) {
    return res.status(HTTP.SUCCESS).send({
      status: false,
      code: HTTP.BAD_REQUEST,
      message: "Unable to register user!",
      data: {},
    });
  }

  // ================== send email template ===================

  var sendMailData = {
    file_template: "./public/EmailTemplates/verifyOtp.html",
    subject: "Verify Email",
    to: email ? email : null,
    // "message": `Dear ${ firstname },` + 'some words'
    // "username": `${firstname}`,
    otp: `${otpCheck}`,
  };

  sendEmailOTP(sendMailData)
    .then((val) => {
      return res.status(HTTP.SUCCESS).send({
        status: true,
        code: HTTP.SUCCESS,
        message: "Please check your email.",
        data: val,
      });
    })
    .catch((err) => {
      console.log(err);
      return res.status(HTTP.SUCCESS).send({
        status: false,
        code: HTTP.BAD_REQUEST,
        message: "Unable to send email!",
        data: {},
      });
    });

  return res.status(HTTP.SUCCESS).send({
    status: true,
    code: HTTP.SUCCESS,
    message: "User Registered! Check your email to verify.",
    data: RegisterData,
  });
}

// ================================================= login with login ==================================================================

async function loginWithGoogle(req, res, next) {
  try {
    const { firstname, lastname, email, role } = req?.body;
    const isUserExist = await Register.findOne({ email });

    if (isUserExist) {
      const token = await createSessionAndJwtToken(isUserExist);
      return res.status(HTTP.SUCCESS).send({
        status: true,
        code: HTTP.SUCCESS,
        message: "You have signed-in successfully.",
        data: {
          userData: {
            id: isUserExist?._id,
            email: isUserExist?.email,
          },
          token: "Bearer " + token,
        },
      });
    } else {
      const createUser = await Register.create({
        firstname,
        lastname,
        email,
        role,
        isVerified: true,
      });
      if (!createUser) {
        throw new Error("somthing went wrong while creating user");
      }
      const token = await createSessionAndJwtToken(createUser);
      return res.status(HTTP.SUCCESS).send({
        status: true,
        code: HTTP.SUCCESS,
        message: "You have signed-in successfully.",
        data: {
          userData: {
            id: createUser?._id,
            email: createUser?.email,
          },
          token: "Bearer " + token,
        },
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(HTTP.SUCCESS).send({
      status: false,
      code: HTTP.INTERNAL_SERVER_ERROR,
      message: "Something went wrong!",
      data: {},
    });
  }
}
// ================================================= login with login ==================================================================

async function loginWithFacebook(req, res, next) {
  try {
    const { facebookUserId, firstname, email, role } = req?.body;
    const isUserExist = await Register.findOne({ facebookUserId });

    if (isUserExist) {
      const token = await createSessionAndJwtToken(isUserExist);
      return res.status(HTTP.SUCCESS).send({
        status: true,
        code: HTTP.SUCCESS,
        message: "You have signed-in successfully.",
        data: {
          userData: {
            id: isUserExist?._id,
            email: isUserExist?.email,
            firstname: isUserExist?.firstname,
          },
          token: "Bearer " + token,
        },
      });
    } else {
      const createUser = await Register.create({
        facebookUserId,
        firstname,
        email: email ? email : "",
        role,
      });
      if (!createUser) {
        throw new Error("something went wrong while creating user");
      }
      const token = await createSessionAndJwtToken(createUser);
      return res.status(HTTP.SUCCESS).send({
        status: true,
        code: HTTP.SUCCESS,
        message: "You have signed-in successfully.",
        data: {
          userData: {
            id: createUser?._id,
            email: createUser?.email,
            firstname: createUser?.firstname,
          },
          token: "Bearer " + token,
        },
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(HTTP.SUCCESS).send({
      status: false,
      code: HTTP.INTERNAL_SERVER_ERROR,
      message: "Something went wrong!",
      data: {},
    });
  }
}

//================================================= RESEND OTP =========================================================================

async function resendOtp(req, res) {
  try {
    const { email } = req.body;

    const checkVerified = await Register.findOne({ email });

    if (!checkVerified)
      return res.status(HTTP.SUCCESS).send({
        status: false,
        code: HTTP.BAD_REQUEST,
        message: "Unable to find User!",
        data: {},
      });

    if (checkVerified.isVerified)
      return res.status(HTTP.SUCCESS).send({
        status: false,
        code: HTTP.BAD_REQUEST,
        message: "User is already verified!",
        data: {},
      });

    const newOtp = randomstring.generate({ length: 4, charset: "numeric" });
    const updateData = await Register.findOneAndUpdate(
      { _id: checkVerified._id },
      { otpCheck: newOtp }
    );
    if (!updateData)
      return res.status(HTTP.SUCCESS).send({
        status: false,
        code: HTTP.BAD_REQUEST,
        message: "Could not update otp in  database!",
        data: {},
      });

    // resend otp email template ===========================

    var sendMailData = {
      file_template: "./public/EmailTemplates/resendOtp.html",
      subject: "Resent OTP - Laro-sa",
      to: email ? email : null,
      // "username": `${checkVerified.firstname}`,0
      otp: `${newOtp}`,
    };

    sendEmailOTP(sendMailData)
      .then((val) => {
        return res.status(HTTP.SUCCESS).send({
          status: true,
          code: HTTP.SUCCESS,
          message: "Please check your email.",
          data: val,
        });
      })
      .catch((err) => {
        console.log(err);
        return res.status(HTTP.SUCCESS).send({
          status: false,
          code: HTTP.BAD_REQUEST,
          message: "Unable to send email!",
          data: {},
        });
      });

    return res.status(HTTP.SUCCESS).send({
      status: true,
      code: HTTP.SUCCESS,
      message: "Otp Resent, check mail!",
      data: { newOtp },
    });
  } catch (e) {
    console.log(e);
    return res.status(HTTP.SUCCESS).send({
      status: false,
      code: HTTP.INTERNAL_SERVER_ERROR,
      message: "Something went wrong!",
      data: {},
    });
  }
}

//=========================================================== Verify OTP ======================================================================================

// verify otp
async function verifyOtp(req, res) {
  try {
    const eventEmitter = req.app.get("eventEmitter");
    const { email, otp } = req.body;

    let result;
    if (!otp)
      return res.status(HTTP.SUCCESS).send({
        status: false,
        code: HTTP.NOT_ALLOWED,
        message: "provide otp to verify!",
        data: {},
      });

    const userData = await Register.findOne({ email }); // , isVerified: false
    if (!userData)
      return res.status(HTTP.SUCCESS).send({
        status: false,
        code: HTTP.BAD_REQUEST,
        message: "Email is Invalid!",
        data: {},
      });

    if (userData.isVerified)
      return res.status(HTTP.SUCCESS).send({
        status: false,
        code: HTTP.BAD_REQUEST,
        message: "User already verified!!",
        data: {},
      });

    if (otp == userData.otpCheck) {
      const update = await Register.findOneAndUpdate(
        { email },
        { isVerified: true, otpCheck: 0 },
        { new: true }
      );
      if (!update)
        return res.status(HTTP.SUCCESS).send({
          status: false,
          code: HTTP.NOT_ALLOWED,
          message: "Could not update verification",
          data: {},
        });

      //genrate JWT token and store session data
      const authToken = await createSessionAndJwtToken(update);

      return res.status(HTTP.SUCCESS).send({
        status: true,
        code: HTTP.SUCCESS,
        message: "Email Verified!",
        data: {
          userData: {
            id: update._id,
            email: update.email,
          },
          token: "Bearer " + authToken,
        },
      });
    } else {
      return res.status(HTTP.SUCCESS).send({
        status: false,
        code: HTTP.BAD_REQUEST,
        message: "Invalid Otp!",
        data: {},
      });
    }
  } catch (e) {
    console.log(e);
    return res.status(HTTP.SUCCESS).send({
      status: false,
      code: HTTP.INTERNAL_SERVER_ERROR,
      message: "Something went wrong!",
      data: {},
    });
  }
}

//============================================================= login ===========================================================================================

async function Login(req, res) {
  try {
    let { email, password } = req.body;
    console.log(req.body, "----- req.body");

    if (!email || !password)
      return res.status(HTTP.SUCCESS).send({
        status: false,
        code: HTTP.NOT_ALLOWED,
        message: "Provide email and password",
        data: {},
      });

    const result = await Register.findOne({ email });
    if (!result)
      return res.status(HTTP.SUCCESS).send({
        status: false,
        code: HTTP.NOT_FOUND,
        message: "user does not exist",
        data: {},
      });

    if (result.isVerified !== true)
      return res.status(HTTP.SUCCESS).send({
        status: false,
        code: HTTP.BAD_REQUEST,
        message: "Please Complete OTP Verification",
        data: {},
      });

    // check if Register is blocked
    // if (result.isActive === false /*"Blocked"*/) return res.status(HTTP.SUCCESS).send({ "status": false, 'code': HTTP.BAD_REQUEST, "message": "Your account has been Blocked by Admin!", data: {} })

    if (!compareSync(password, result.password))
      return res.status(HTTP.SUCCESS).send({
        status: false,
        code: HTTP.BAD_REQUEST,
        message: "Password is wrong",
        data: {},
      });

    //genrate JWT token and store session data
    const token = await createSessionAndJwtToken(result);
    return res.status(HTTP.SUCCESS).send({
      status: true,
      code: HTTP.SUCCESS,
      message: "You have signed-in successfully.",
      data: {
        userData: {
          id: result._id,

          email: result.email,
          role: result.role,
        },
        token: "Bearer " + token,
      },
    });
  } catch (e) {
    console.log(e);
    return res.status(HTTP.SUCCESS).send({
      status: false,
      code: HTTP.INTERNAL_SERVER_ERROR,
      message: "Something went wrong!",
      data: {},
    });
  }
}

//==================================================================== UPDATE EMAIL  ==============================================================================

async function updateEmail(req, res) {
  try {
    const email = req.body.email;
  } catch (error) {
    return res.status(HTTP.SUCCESS).send({
      status: false,
      code: HTTP.INTERNAL_SERVER_ERROR,
      message: "Something went wrong!",
      data: {},
    });
  }
}

//===================================================================== forgot password ============================================================================

async function forgotPassword(req, res) {
  try {
    console.log("---------------------->>>>>>>>>>>");
    let { email } = req.body;
    if (!email) {
      return res.status(HTTP.SUCCESS).send({
        success: false,
        code: HTTP.NOT_ALLOWED,
        message: "provide email",
        datalink: {},
      });
    }

    const result = await Register.findOne({ email: req.body.email });
    if (!result) {
      return res.status(HTTP.SUCCESS).send({
        success: false,
        code: HTTP.NOT_FOUND,
        message: "Record not found",
        data: {},
      });
    }
    const id = result._id;
    const payload = { id: result._id, email: result.email };
    const secret = process.env.JWT_SECRET + result.password;
    const token = jwt.sign(payload, secret);
    const link = `${process.env.REACT_USER_APP_WEB_URL}/${id}/${token}`;
    const set_token = await Register.findOneAndUpdate(
      { email: result.email },
      { token },
      { new: true }
    );
    // console.log(set_token);
    // console.log(result.id, "this is a link result id");
    // send link ==================================================
    // return res.status(HTTP.SUCCESS).send({ "status": true, 'code': HTTP.SUCCESS, "message": "checking...", 'data': {} })
    // var sendMailData = {
    //   file_template: "./public/EmailTemplates/forgotPassword.html",
    //   subject: "Link to reset the password",
    //   to: result.email ? result.email : null,
    //   link: link,
    // };

    // sendForgotPasswordLink(sendMailData)
    //   .then((val) => {
    //     return res.status(HTTP.SUCCESS).send({
    //       status: true,
    //       code: HTTP.SUCCESS,
    //       message: "Please check your email.",
    //       data: val,
    //     });
    //   })
    //   .catch((err) => {
    //     console.log(err);
    //     return res.status(HTTP.SUCCESS).send({
    //       status: false,
    //       code: HTTP.BAD_REQUEST,
    //       message: "Unable to send email!",
    //       data: {},
    //     });
    //   });

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "tanthetaauser@gmail.com",
        pass: "ydsioiddnnfvcclm",
      },
    });
    const htmlTemplate = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta http-equiv="X-UA-Compatible" content="IE=edge">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Forgot Password</title>
          <style>
              *, body, p {
                  margin: 0;
                  padding: 0;
              }
              body {
                  overflow: hidden;
                  overflow-y: auto;
                  font-family: 'Montserrat', sans-serif;
                  font-weight: 500;
              }
              .qop {
                  background-color: white;
                  border: 2px solid #001BEA;
                  color: green;
                  padding: 12px 10px;
                  text-align: center;
                  display: inline-block;
                  font-size: 20px;
                  margin: 10px 30px;
                  cursor: pointer;
              }
          </style>
      </head>
      <body>
          <table cellspacing="0" border="0" cellpadding="0" width="100%" bgcolor="#f2f3f8"
          style="@import url(https://fonts.googleapis.com/css?family=Rubik:300,400,50https://res.cloudinary.com/dqffs1rxq/image/upload/v1663149858/logo_sxtkrk.png0,700|Open+Sans:300,400,600,700); font-family: 'Open Sans', sans-serif; padding-top: 20px;  ">
          <tr>
          <td>
              <table style="max-width:670px; margin:0 auto;  position: absolute;
                  top: 50%;
                  left: 50%;
                  transform: translate(-50% , -50%);padding: 0 15px;" width="100%" border="0"
                  align="center" cellpadding="0" cellspacing="0">
                  <tr>
                      <td>
                      <table width="100%" style="border:0; border-spacing:0">
                          <tr>
                              <td style="height:40px;background-color: white; border:0; padding:0px" >&nbsp;</td>
                              </tr>
                      </table>
                      <table width="100%" border="0" align="center" cellpadding="0" cellspacing="0"
                          style="max-width:670px; background:#fff; border-radius:3px; text-align:center;">
                          <tr>
                              <td style="height:40px;">&nbsp;</td>
                          </tr>
                          <tr>
                              <td style="text-align:center;">
                                  <img src="https://myrealestate.ng/static/media/logoSmall.c865497de0bfca834259.png" title="logo" alt="logo"> 
                              </td>
                          </tr>
                          <tr>
                              <td style="padding:0 35px;">
                                  <p
                                  style="font-size:28px; color:#001BEA; margin:35px 0 0; line-height:24px; font-weight: bold;">
                                  Forgot Password Verification Link
                                  </span>
                                  </p>
                                  <p
                                  style="color:#001BEA; font-size:18px;line-height:23px; margin:0; font-weight: 500; margin-top: 20px;">
                                  <h3><strong> 
                                
                                    <a href="${link}" class="GFG">
                                      <button style="border: 2px solid #001BEA; padding: 12px 27px; cursor: pointer; border-radius: 21px; font-size: 18px; background: rgb(0 27 234 / 22%);">
                                          Click Here To Reset Password
                                      </button>
                                      </a>
                                  </strong></h3>
                                  
                                  </p>
                                  
                              </td>
                          </tr>
                      </table>
                      <table width="100%" style="border:0; border-spacing:0">
                          <tr>
                              <td style="height:40px;background-color: white; border:0; padding:0px" >&nbsp;</td>
                              </tr>
                      </table>
                      </td>
                  </tr>
                  <tr>
                      <td style="height:100px; background-color: white ">&nbsp;</td>
                  </tr>
                  <tr>
                      <td style="height:50px; background-color: transparent ">&nbsp;</td>
                  </tr>
                  <tr>
                      <td style="text-align:center; background-color: transparent;">
                      <p
                          style="font-size:14px; color:#9f9f9f; line-height:18px; margin:0 0 0; font-weight: bold;padding-bottom: 20px;">
                          
                          Sent with <span style="margin-top:2px;"> <img src="https://res.cloudinary.com/dqffs1rxq/image/upload/v1663151795/heart_clyvbj.png" alt=""
                              width="15px" height="15px"> </span> from <span
                              style="background-color:#fce293 ;margin-left: 3px;">  Team myrealestate-ng </span>
                          </span>
                      </p>
                      </td>
                  </tr>
              </table>
          </td>
          </tr>
          </table>
          <!--/100% body table-->

      </body>
      </html>
    `;

    const mailOptions = {
      from: 'tanthetaauser@gmail.com"',
      to: result.email,
      subject: "Link to reset the password",
      html: htmlTemplate,
    };

    console.log("test");

    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error);
        res.status(HTTP.SUCCESS).send({
          status: false,
          code: HTTP.BAD_REQUEST,
          message: "Unable to send email!",
          data: {},
        });
      } else {
        console.log("Email sent: " + info.response);
        res.status(HTTP.SUCCESS).send({
          status: true,
          code: HTTP.SUCCESS,
          message: "Please check your email.",
          data: {},
        });
      }
    });
    return res.status(HTTP.SUCCESS).send({
      status: true,
      code: HTTP.SUCCESS,
      message: "Check your email",
      data: { id: result._id },
    });
  } catch (err) {
    console.log(err);
    return res.status(HTTP.SUCCESS).send({
      status: false,
      code: HTTP.INTERNAL_SERVER_ERROR,
      message: "Something went wrong!",
      data: {},
    });
  }
}

//==============================================================   Set new password ==========================================================================

// async function setNewPassword(req, res) {
//   // try {
//   //   var find_token = await User.findOne({ _id: req.body.id });
//   //   console.log(find_token);

//   try {
//     console.log(req.body);
//     var find_token = await Register.findOne({ _id: req.body.id });
//     // console.log(find_token);

//     var password = req.body.password;
//     var confirmPassword = req.body.confirmPassword;

//     //check password
//     if (password != confirmPassword)
//       return res.status(HTTP.SUCCESS).send({
//         status: false,
//         code: HTTP.NOT_ALLOWED,
//         message: "Password and confirm password does not match",
//         data: {},
//       });

//     if (password.trim().length < 8 || password.trim().length > 16) {
//       return res.status(HTTP.SUCCESS).send({
//         status: false,
//         code: HTTP.NOT_ALLOWED,
//         message: "Password must be between of 8 to 16 characters!",
//         data: {},
//       });
//     }

//     const RegisterData = await Register.findOne({ _id: req.body.id });
//     if (!RegisterData)
//       return res.status(HTTP.SUCCESS).send({
//         status: false,
//         code: HTTP.NOT_ALLOWED,
//         message: "Register does not exists!",
//         data: {},
//       });

//     console.log(req.body.id);

//     const isNewPassword = compareSync(password, RegisterData.password);
//     if (isNewPassword || isNewPassword === undefined)
//       return res.status(HTTP.SUCCESS).send({
//         status: false,
//         code: HTTP.NOT_ALLOWED,
//         message: "New password cannot be same as current password !",
//         data: {},
//       });

//     // for (const data of RegisterData) {

//     //     const isNewPassword = compareSync(password, data.password)
//     //     if (isNewPassword || isNewPassword === undefined) return res.status(HTTP.SUCCESS).send({ 'status': false, 'code': HTTP.NOT_ALLOWED, 'message': 'New password cannot be same as current password !', data: {} })

//     // }

//     var bpass = await bcrypt.hash(password, 10);

//     const result = await Register.findOneAndUpdate(
//       { _id: find_token.id },
//       { password: bpass, token: "" },
//       { new: true }
//     );
//     console.log("🚀 ~ result:", result);
//     if (!result)
//       return res.status(HTTP.SUCCESS).send({
//         status: false,
//         code: HTTP.NOT_ALLOWED,
//         message: "Unable to set new password!",
//         data: {},
//       });

//     return res.status(HTTP.SUCCESS).send({
//       status: true,
//       code: HTTP.SUCCESS,
//       message: `New Password has been set`,
//       data: {},
//     });
//   } catch (err) {
//     console.log(err);
//     return res.status(HTTP.SUCCESS).send({
//       status: false,
//       code: HTTP.INTERNAL_SERVER_ERROR,
//       message: "Something went wrong!",
//       data: {},
//     });
//   }
// }

async function setNewPassword(req, res) {
  try {
    console.log("Request Body:", req.body);

    const { id, password, confirmPassword } = req.body;

    if (!id || !password || !confirmPassword) {
      return res.status(HTTP.SUCCESS).send({
        status: false,
        code: HTTP.BAD_REQUEST,
        message: "Missing required fields in request body",
        data: {},
      });
    }

    const findUser = await Register.findById(id);

    console.log("Found User:", findUser);

    if (!findUser) {
      return res.status(HTTP.SUCCESS).send({
        status: false,
        code: HTTP.NOT_FOUND,
        message: "User not found",
        data: {},
      });
    }

    // Check if password and confirmPassword match
    if (password !== confirmPassword) {
      return res.status(HTTP.SUCCESS).send({
        status: false,
        code: HTTP.NOT_ALLOWED,
        message: "Password and confirm password do not match",
        data: {},
      });
    }

    if (password.trim().length < 8 || password.trim().length > 16) {
      return res.status(HTTP.SUCCESS).send({
        status: false,
        code: HTTP.NOT_ALLOWED,
        message: "Password must be between of 8 to 16 characters!",
        data: {},
      });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update user's password and clear token
    const updatedUser = await Register.findOneAndUpdate(
      { _id: id },
      { password: hashedPassword, token: "" },
      { new: true }
    );

    console.log("Updated User:", updatedUser);

    if (!updatedUser) {
      return res.status(HTTP.SUCCESS).send({
        status: false,
        code: HTTP.NOT_ALLOWED,
        message: "Unable to set new password",
        data: {},
      });
    }

    return res.status(HTTP.SUCCESS).send({
      status: true,
      code: HTTP.SUCCESS,
      message: "New password has been set",
      data: {},
    });
  } catch (err) {
    console.error(err);
    return res.status(HTTP.SUCCESS).send({
      status: false,
      code: HTTP.INTERNAL_SERVER_ERROR,
      message: "Something went wrong",
      data: {},
    });
  }
}
// for (const data of userData) {

//     const isNewPassword = compareSync(password, data.password)
//     if (isNewPassword || isNewPassword === undefined) return res.status(HTTP.SUCCESS).send({ 'status': false, 'code': HTTP.NOT_ALLOWED, 'message': 'New password cannot be same as current password !', data: {} })

// }

//Logout user session
// async function logout(req, res) {
//     try {
//         if (!req.user.sessionId) return res.status(HTTP.BAD_REQUEST).send({ "status": false, 'code': HTTP.BAD_REQUEST, "message": "Please authenticate", data: {} })

//         const userData = await UserSession.findOneAndUpdate({ _id: req.user.sessionId, userid: req.user.id, isActive: true }, { isActive: false }, { new: true })
//         if (!userData) return res.status(HTTP.SUCCESS).send({ 'status': false, 'code': HTTP.BAD_REQUEST, 'message': 'User session is invalid', data: {} })
//Logout Register session
async function logout(req, res) {
  try {
    console.log("======= SESSION ID ================>>", req.user.sessionId);
    console.log("======= USER ID ================>>", req.user.id);

    if (!req.user.sessionId)
      return res.status(HTTP.BAD_REQUEST).send({
        status: false,
        code: HTTP.BAD_REQUEST,
        message: "Please authenticate",
        data: {},
      });
    const RegisterData = await userSession.findOneAndUpdate(
      { _id: req.user.sessionId, userid: req.user.id, isActive: true },
      { isActive: false },
      { new: true }
    );
    if (!RegisterData)
      return res.status(HTTP.SUCCESS).send({
        status: false,
        code: HTTP.BAD_REQUEST,
        message: "user session is invalid",
        data: {},
      });

    // res.clearCookie("jwttoken");
    return res.status(HTTP.SUCCESS).send({
      status: true,
      code: HTTP.SUCCESS,
      message: "User logged out successfully",
      data: {},
    });
  } catch (err) {
    console.log(err);
    return res.status(HTTP.SUCCESS).send({
      status: false,
      code: HTTP.INTERNAL_SERVER_ERROR,
      message: "Something went wrong!",
      data: {},
    });
  }
}

//======================================================== log out from all ==============================================================================

async function logoutFromAll(req, res) {
  try {
    console.log(req.user);

    req.user.token = "";
    res.clearCookie("jwt");
    return res.status(HTTP.SUCCESS).send({
      status: true,
      code: HTTP.SUCCESS,
      message: "User logged out successfully",
      data: {},
    });
  } catch (error) {
    console.log(error);
    return res.status(HTTP.SUCCESS).send({
      status: false,
      code: HTTP.INTERNAL_SERVER_ERROR,
      message: "Something went wrong!",
      data: {},
    });
  }
}

//======================================================== get user profile  =============================================================================

async function getUserProfile(req, res) {
  try {
    console.log("req.user.id---------------", req.user.id);
    let result = await Register.findById(req.user.id);
    if (!result)
      return res.status(HTTP.SUCCESS).send({
        status: false,
        code: HTTP.NOT_FOUND,
        message: "Record not found",
        data: {},
      });

    return res.status(HTTP.SUCCESS).send({
      status: true,
      code: HTTP.SUCCESS,
      message: "User Profile",
      data: await formateUserData(result),
    });
  } catch (err) {
    console.log(err);
    return res.status(HTTP.SUCCESS).send({
      status: false,
      code: HTTP.INTERNAL_SERVER_ERROR,
      message: "Something went wrong!",
      data: {},
    });
  }
}

//================================================================= update Register profile =====================================================================

async function updateProfile(req, res) {
  try {
    let { email, password } = req.body;

    if (Object.keys(req.body).length === 0)
      return res.status(HTTP.SUCCESS).send({
        status: false,
        code: HTTP.NOT_ALLOWED,
        message: "No changes are available for update",
        data: {},
      });

    const isValidUpdate = Object.keys(req.body).every((key) => {
      if (["password", "email"].includes(key)) return true;
      return false;
    });

    if (!isValidUpdate)
      return res.status(HTTP.SUCCESS).send({
        status: false,
        code: HTTP.NOT_ALLOWED,
        message: "Update is not allowed!",
        data: {},
      });
    let userData = await Register.findById(req.user._id);
    if (!userData)
      return res.status(HTTP.SUCCESS).send({
        status: false,
        code: HTTP.NOT_FOUND,
        message: "user does not exists!",
        data: {},
      });

    if (email && email != userData.email) {
      const checkusername = await Register.findOne({ email: email });
      if (checkusername)
        return res.status(HTTP.SUCCESS).send({
          status: false,
          code: HTTP.NOT_ALLOWED,
          message: "Email already exists",
          data: {},
        });
      userData.email = email;
    }

    if (password) {
      if (password.trim().length < 8 || password.trim().length > 16)
        return res.status(HTTP.SUCCESS).send({
          status: false,
          code: HTTP.NOT_ALLOWED,
          message: "Password length must be between 8 to 16",
          data: {},
        });

      const isNewPassword = compareSync(password, userData.password);
      if (isNewPassword || isNewPassword === undefined)
        return res.status(HTTP.SUCCESS).send({
          status: false,
          code: HTTP.NOT_ALLOWED,
          message: "New password cannot be same as current password !",
          data: {},
        });

      const salt = genSaltSync(10);
      userData.password = hashSync(password, salt);
    }
  } catch (err) {
    console.log(err);
    return res.status(HTTP.SUCCESS).send({
      status: false,
      code: HTTP.INTERNAL_SERVER_ERROR,
      message: "Something went wrong!",
      data: {},
    });
  }
}

//========================================================================= verifyMail ==========================================================================

async function verifyMail(req, res) {
  try {
    const { email, newEmail } = req.body;
    if (!email.includes("@") || !newEmail.includes("@")) {
      return res.status(HTTP.SUCCESS).send({
        status: false,
        code: HTTP.BAD_REQUEST,
        message: "Email is invalid!",
        data: {},
      });
    }

    const RegisterData = await Register.findOne({ email });
    if (!RegisterData)
      return res.status(HTTP.SUCCESS).send({
        status: false,
        code: HTTP.BAD_REQUEST,
        message: "Register not found!",
        data: {},
      });

    return res.status(HTTP.SUCCESS).send({
      status: true,
      code: HTTP.SUCCESS,
      message: "Email updated",
      data: await formateUserData(updateEmail),
    });
  } catch (err) {
    console.log(err);
    return res.status(HTTP.SUCCESS).send({
      status: false,
      code: HTTP.INTERNAL_SERVER_ERROR,
      message: "Something went wrong!",
      data: {},
    });
  }
}

//======================================================= Add property to Whishlist ==============================================================================================

async function addToFavorites(req, res) {
  const _id = ObjectId(req.user._id).toString();
  const proID = req.body.id;
  console.log("req.body--->>", req.body);
  console.log("=========ID=========>", _id);
  console.log("==========PROID========>", proID);
  try {
    const user = await Register.findById(_id);
    const Exists = user.wishlist.find((id) => id.toString() === proID);
    //console.log("========USER========>", user);

    if (Exists) {
      let user = await Register.findByIdAndUpdate(
        _id,
        { $pull: { wishlist: proID } },
        { new: true }
      );
      return res.status(HTTP.SUCCESS).send({
        status: true,
        code: HTTP.SUCCESS,
        message: "This Property is removed from your wishlist",
        data: user.wishlist,
      });
    } else {
      let user = await Register.findByIdAndUpdate(
        _id,
        { $push: { wishlist: proID } },
        { new: true }
      );
      return res.status(HTTP.SUCCESS).send({
        status: true,
        code: HTTP.SUCCESS,
        message: "This Property is added to your wishlist",
        data: user.wishlist,
      });
    }
    // console.log("========= user ===========>", user);
    //     let result = []
    //     for (const data of user.wishlist) {

    //         const proDetails = await property_listing.find()
    //         for (const _data of proDetails) {
    //             console.log( (data) , "======data=>");
    //             console.log( (_data._id), "------>");

    //             if (
    //               ObjectId(data).toString() == ObjectId(_data._id).toString()
    //             ) {
    //               console.log("match");
    //             } else {
    //               console.log("is not match");
    //             }
    //         }
    //    }
  } catch (error) {
    console.log(error);
    return res.status(HTTP.SUCCESS).send({
      status: false,
      code: HTTP.INTERNAL_SERVER_ERROR,
      message: "Something went wrong!",
      data: {},
    });
  }
}

//===================================================== saved Property ===========================================================================================================

async function savedProperty(req, res) {
  try {
    const _id = req.user._id;
    const user = await Register.findById({ _id });
    // console.log("--------->", user);

    let result = [];
    for (const data of user.wishlist) {
      const proDetails = await property_listing.find({
        $or: [{ status: { $regex: req.body.status } }],
      });
      for (const _data of proDetails) {
        //   console.log(data, "======data=>");
        //   console.log(_data._id, "------>");

        if (ObjectId(data).toString() == ObjectId(_data._id).toString()) {
          console.log("match");
          result.push({
            _id: _data._id,
            frontPageImg: _data.frontPageImg,
            lead_agent: _data.lead_agent,
            price: _data.price,
            street_address_number: _data.street_address_number,
            street_address_name: _data.street_address_name,
            suburb: _data.suburb,
            bedroomCount: _data.Bedrooms,
            showerCount: _data.Bathrooms,
            carCount: _data.carport_spaces,
            isFavorite: true,
            location: _data.location,
            createdAt: _data.createdAt
          });
        }
      }
    }
    result.sort((a, b) => (a.createdAt < b.createdAt) ? 1 : -1);
    // console.log("----------RESULT----------------->>>>>>>>>", result.length);
    return res.status(HTTP.SUCCESS).send({
      status: true,
      code: HTTP.SUCCESS,
      message: "savedProperty",
      data: result,
    });
  } catch (error) {
    console.log(error);
    return res.status(HTTP.SUCCESS).send({
      status: false,
      code: HTTP.INTERNAL_SERVER_ERROR,
      message: "Something went wrong!",
      data: {},
    });
  }
}

//============================================================  Inspecion Time(Newest -- oldest)  ============================================================================

async function inspection(req, res) {
  try {
    var currentDate = new Date();

    const listing = await property_listing.find({});

    let arr = [];
    for (let data of listing) {
      if (data.inspection_times.length !== 0) {
        let time = data.inspection_times[0].show_date;
        let storedTime = new Date(time);

        if (storedTime > currentDate) {
          arr.push(data);
        }
      }
    }

    return res.status(HTTP.SUCCESS).send({
      status: true,
      code: HTTP.SUCCESS,
      message: "inspections",
      data: arr,
    });
  } catch (error) {
    console.log(error);
    return res.status(HTTP.SUCCESS).send({
      status: false,
      code: HTTP.INTERNAL_SERVER_ERROR,
      message: "Something went wrong!",
      data: {},
    });
  }
}

//===============================================================================================================================================================================

async function SaveSearch(req, res) {
  try {
    var querydata = req.query.id;
    querydata = JSON.parse(querydata);

    agentdata = [];
    var bodyname = req.body.name;
    for (k = 0; k < querydata.length; k++) {
      if (req.body) {
        var list = await property_listing.findById(querydata[k]);

        agentdata.push(list);
      }
    }

    if (!req.body.name)
      return res.status(HTTP.SUCCESS).send({
        status: false,
        code: HTTP.NOT_FOUND,
        message: "name is required",
        data: {},
      });

    const data = new saveSearch({
      data: agentdata,
      name: bodyname,
      user_id: req.Data,
    }).save();

    return res.status(HTTP.SUCCESS).send({
      status: true,
      code: HTTP.SUCCESS,
      message: "Search saved",
      data: {},
    });
  } catch (err) {
    return res.status(HTTP.SUCCESS).send({
      status: false,
      code: HTTP.INTERNAL_SERVER_ERROR,
      message: "Something went wrong!",
      data: {},
    });
  }
}

//================================================================================================================================================================================

async function SearchShow(req, res) {
  try {
    var tokendata = req.Data;
    if (req.Data) {
      let data = await saveSearch.find({ user_id: tokendata });
      return res.status(HTTP.SUCCESS).send({
        status: true,
        code: HTTP.SUCCESS,
        message: "Data Show",
        data: data,
      });
    } else {
      return res.status(HTTP.SUCCESS).send({
        status: false,
        code: HTTP.INTERNAL_SERVER_ERROR,
        message: "Something went wrong!",
        data: {},
      });
    }
  } catch (error) {
    return res.status(HTTP.SUCCESS).send({
      status: false,
      code: HTTP.INTERNAL_SERVER_ERROR,
      message: "Something went wrong!",
      data: {},
    });
  }
}

//================================================================================================================================================================================

async function Searchdelete(req, res) {
  try {
    if (req.Data) {
      let TokenData = req.params.id;
      await saveSearch.findByIdAndDelete(TokenData, {});
      return res.status(HTTP.SUCCESS).send({
        status: true,
        code: HTTP.SUCCESS,
        message: "Search Delete",
        data: {},
      });
    } else {
      return res.status(HTTP.SUCCESS).send({
        status: false,
        code: HTTP.INTERNAL_SERVER_ERROR,
        message: "Something went wrong!",
        data: {},
      });
    }
  } catch (error) {
    return res.status(HTTP.SUCCESS).send({
      status: false,
      code: HTTP.INTERNAL_SERVER_ERROR,
      message: "Something went wrong!",
      data: {},
    });
  }
}

//================================================================================================================================================================================

async function NumberOfPropertiesSold(req, res) {
  try {
    dataid = [];
    agentdata = [];

    const listing = await property_listing.find({});
    for (var i of listing) {
      for (var j = 0; j < listing.length; j++) {
        var findid = i.lead_agent._id;
      }
      dataid.push(findid);
    }

    var filtered = dataid.filter(function (x) {
      return x !== undefined;
    });

    const counts = {};
    filtered.forEach(function (x) {
      counts[x] = (counts[x] || 0) + 1;
    });

    var keys = Object.keys(counts);
    var keys_data = keys.filter(function (x) {
      return x !== undefined;
    });
    var value = Object.values(counts);
    for (k = 0; k < keys_data.length; k++) {
      var agent = await admin_agent.findByIdAndUpdate(keys_data[k], {
        property_sold: value[k],
      });
    }

    // for (k = 0; k < keys_data.length; k++) {
    // var agent = await admin_agent.findById(keys_data[k]);
    var agent = await admin_agent.aggregate([{ $sort: { property_sold: -1 } }]);
    agentdata.push({ agent });
    // }
    return res.status(HTTP.SUCCESS).send({
      status: true,
      code: HTTP.SUCCESS,
      message: "SUCCESS",
      data: agentdata,
    });
  } catch (error) {
    console.log(error);
    return res.status(HTTP.SUCCESS).send({
      status: false,
      code: HTTP.INTERNAL_SERVER_ERROR,
      message: "Something went wrong!",
      error: error,
      data: {},
    });
  }
}

async function Property_sales_as_lead_agent(req, res) {
  try {
    dataid = [];
    agentdata = [];

    const listing = await property_listing.find({});
    for (var i of listing) {
      for (var j = 0; j < listing.length; j++) {
        var findid = i.lead_agent._id;
      }
      dataid.push(findid);
    }

    var filtered = dataid.filter(function (x) {
      return x !== undefined;
    });
    const counts = {};
    filtered.forEach(function (x) {
      counts[x] = (counts[x] || 0) + 1;
    });

    var keys = Object.keys(counts);
    var keys_data = keys.filter(function (x) {
      return x !== undefined;
    });
    var value = Object.values(counts);

    for (k = 0; k < keys_data.length; k++) {
      var agent = await admin_agent.findByIdAndUpdate(keys_data[k], {
        property_sold: value[k],
      });
    }

    // for (k = 0; k < keys_data.length; k++) {
    //     var agent = await admin_agent.findById(keys_data[k]);
    var agent = await admin_agent.aggregate([{ $sort: { property_sold: -1 } }]);
    agentdata.push({ agent });
    // }
    return res.status(HTTP.SUCCESS).send({
      status: true,
      code: HTTP.SUCCESS,
      message: "SUCCESS",
      data: agentdata,
    });
  } catch (error) {
    console.log(error);
    return res.status(HTTP.SUCCESS).send({
      status: false,
      code: HTTP.INTERNAL_SERVER_ERROR,
      message: "Something went wrong!",
      error: error,
      data: {},
    });
  }
}

async function Number_of_reviews(req, res) {
  try {
    let data = await property_listing.find({});

    const arr = [];
    const MainArray = [];

    for (var i of data) {
      let datavalue = i.lead_agent._id;
      arr.push(datavalue);
    }

    var mainData = arr.filter((value, index) => arr.indexOf(value) === index);

    for (let j = 0; j < mainData.length; j++) {
      var AllData = await admin_agent.aggregate([
        { $sort: { agentReview: -1 } },
      ]);
      MainArray.push(AllData);
    }
    return res.status(HTTP.SUCCESS).send({
      status: true,
      code: HTTP.SUCCESS,
      message: "SUCCESS",
      data: MainArray,
    });
  } catch (error) {
    return res.status(HTTP.SUCCESS).send({
      status: false,
      code: HTTP.INTERNAL_SERVER_ERROR,
      message: "Something went wrong!",
      error: error,
      data: {},
    });
  }
}

async function Years_experience(req, res) {
  try {
    const data = await admin_agent.aggregate([
      { $sort: { start_year_in_industry: 1 } },
    ]);
    return res.status(HTTP.SUCCESS).send({
      status: true,
      code: HTTP.SUCCESS,
      message: "SUCCESS",
      data: data,
    });
  } catch (error) {
    return res.status(HTTP.SUCCESS).send({
      status: false,
      code: HTTP.INTERNAL_SERVER_ERROR,
      message: "Something went wrong!",
      error: error,
      data: {},
    });
  }
}

//================================================================  Compare Agents ====================================================================================

async function compareAgents(req, res) {
  try {
    const IDs = req.body.IDs;
    const data = await admin_agent.find({ _id: { $in: IDs } });
    let comparision = [];
    for (let i = 0; i < data.length; i++) {
      comparision.push({
        name: data[i].name,
        medianPrice: data[i].medianPrice,
        property_sold: data[i].property_sold,
        start_year_in_industry: data[i].start_year_in_industry,
      });
    }
    return res.status(HTTP.SUCCESS).send({
      status: true,
      code: HTTP.SUCCESS,
      message: "SUCCESS",
      data: comparision,
    });
  } catch (error) {
    return res.status(HTTP.SUCCESS).send({
      status: false,
      code: HTTP.INTERNAL_SERVER_ERROR,
      message: "Something went wrong!",
      data: {},
    });
  }
}

const contact_us = async (req, res) => {
  try {
    const { name, email, message } = req.body;
    if (!name || !email || !message)
      return res.status(HTTP.SUCCESS).send({
        status: false,
        code: HTTP.NOT_ALLOWED,
        message: "All Fields Are Required !",
        data: {},
      });
    const data = new contact({ name, email, message }).save();
    if (!data)
      return res.status(HTTP.SUCCESS).send({
        status: false,
        code: HTTP.NOT_ALLOWED,
        message: "Something Else Data Not Send !",
        data: {},
      });
    var sendMailData = {
      file_template: "./public/EmailTemplates/contactus.html",
      subject: "Contact Us Email From user",
      to: email ? email : null,
      // "username": `${checkVerified.firstname}`,0
      email: `${email}`,
      name: name,
      message: message,
    };
    sendContactusemail(sendMailData);
    return res.status(HTTP.SUCCESS).send({
      status: true,
      code: HTTP.SUCCESS,
      message: "Your data Send Succesfully !",
      data: data,
    });
  } catch (error) {
    return res.status(HTTP.SUCCESS).send({
      status: false,
      code: HTTP.INTERNAL_SERVER_ERROR,
      message: "Something went wrong!",
      data: {},
    });
  }
};

async function propaties(req, res) {
  try {
    let data = await property_listing.find().sort({ _id: -1 });
    let formated = [];

    for (d of data) {
      let img = [];
      for (e of d.propertyImg) {
        img.push(e);
      }
      img.push(d.florePlansImg[0]);
      // img.push(d.statementOfInfo[0])
      img.push(d.frontPageImg[0]);
      let address =
        d.street_address_number + " " + d.street_address_name + " " + d.suburb;
      formated.push({
        _id: d?._id,
        Bathrooms: d.Bathrooms,
        Bedrooms: d.Bedrooms,
        toilets: d.toilets,
        discription: d.discription,
        address: address,
        heading: d.heading,
        image: img,
      });
    }
    return res.status(HTTP.SUCCESS).send({
      status: true,
      code: HTTP.SUCCESS,
      message: "Your data Send Succesfully !",
      data: formated,
    });
  } catch (error) {
    return res.status(HTTP.SUCCESS).send({
      status: false,
      code: HTTP.INTERNAL_SERVER_ERROR,
      message: "Something went wrong!",
      data: {},
    });
  }
}

async function latestagent(req, res) {
  try {
    let data = await admin_agent.find().sort({ _id: -1 }).limit(5);
    let allagent = [];
    for (d of data) {
      // let formated = [];
      const propatys = await property_listing.find({ lead_agent: d._id });
      // for (s of propatys) {
      //     formated.push({ image: s.frontPageImg, street_address_number: s.street_address_number, street_address_name: s.street_address_name, suburb: s.suburb })
      // }
      allagent.push({
        _id: d._id,
        count: propatys.length,
        name: d.name,
        profileImg: d.profileImg,
      });
    }
    return res.status(HTTP.SUCCESS).send({
      status: true,
      code: HTTP.SUCCESS,
      message: "Your data Send Succesfully !",
      data: allagent,
    });
  } catch (error) {
    return res.status(HTTP.SUCCESS).send({
      status: false,
      code: HTTP.INTERNAL_SERVER_ERROR,
      message: "Something went wrong!",
      data: {},
    });
  }
}

async function deleteAccount(req, res) {
  try {
    const { email } = req.body;
    // Check if the user exists and delete the account
    const deletedUser = await Register.findOneAndDelete({ email });

    if (!deletedUser) {
      return res.status(HTTP.SUCCESS).send({
        status: false,
        code: HTTP.NOT_FOUND,
        message: "User account not found.",
      });
    }

    return res.status(HTTP.SUCCESS).send({
      status: true,
      code: HTTP.SUCCESS,
      message: "Account deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting user account:", error);
    return res.status(HTTP.INTERNAL_SERVER_ERROR).send({
      status: false,
      code: HTTP.INTERNAL_SERVER_ERROR,
      message: "Something went wrong while deleting the account.",
    });
  }
}

async function signOutAll(req, res) {
  try {
    await userSession.updateMany(
      { isActive: true },
      { $set: { isActive: false } }
    );
    return res.status(HTTP.SUCCESS).send({
      status: true,
      code: HTTP.SUCCESS,
      message: "sign out from all devices successfully",
    });
  } catch (e) {
    console.log(e);
    return res.status(HTTP.SUCCESS).send({
      status: false,
      code: HTTP.INTERNAL_SERVER_ERROR,
      message: "Something went wrong!",
      data: {},
    });
  }
}

async function propertyData(req, res) {
  const id = req.params.id;
  console.log("id::::::::::::::>>>>>>>>>>>>", id);
  try {
    const soldCount = await property_listing.find({
      lead_agent: id.toString(),
      status: "Sold",
    });
    const totalSoldCount = await property_listing.find({ status: "Sold" });
    res.status(HTTP.SUCCESS).json({
      status: true,
      code: HTTP.SUCCESS,
      soldCount: soldCount,
      totalSoldCount: totalSoldCount,
    });
  } catch (error) {
    console.error("Error counting sold properties:", error);
    res.status(HTTP.SUCCESS).json({
      status: false,
      code: HTTP.INTERNAL_SERVER_ERROR,
      error: "Internal Server Error",
    });
  }
}
//===================  update password ====================================================================================

const updatePassword = async (req, res) => {
  try {
    let { currentPassword, newPassword, confirmPassword } = req.body;
    let user = req.user;
    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(HTTP.SUCCESS).send({
        status: false,
        code: HTTP.NOT_ALLOWED,
        message: "All fields are required!",
        data: {},
      });
    }
    const findUser = await Register.findOne({ email: user.email });
    if (!findUser) {
      return res.status(HTTP.SUCCESS).send({
        status: false,
        code: HTTP.NOT_FOUND,
        message: "Record not found",
        data: {},
      });
    }

    const jwt_secret = process.env.JWT_SECRET;
    const comparePassword = bcrypt.compareSync(currentPassword, findUser.password);

    if (!comparePassword) {
      return res.status(HTTP.SUCCESS).send({
        status: false,
        code: HTTP.BAD_REQUEST,
        message: "Current password is incorrect",
        data: {},
      });
    }
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const updateUser = await Register.findByIdAndUpdate(user._id,
      {
        password: hashedPassword,
      },
      { new: true })

    return res.status(HTTP.SUCCESS).json({
      status: true,
      code: HTTP.SUCCESS,
      message: "Password updated successfully",
      data: {},
    });
  } catch (error) {
    console.error("Error updated password:", error);
    res.status(HTTP.SUCCESS).json({
      status: false,
      code: HTTP.INTERNAL_SERVER_ERROR,
      error: "Internal Server Error",
    });
  }
}

module.exports = {
  dashboard,
  signup,
  resendOtp,
  verifyOtp,
  Login,
  forgotPassword,
  updatePassword,
  setNewPassword,
  getUserProfile,
  updateProfile,
  verifyMail,
  logout,
  logoutFromAll,
  addToFavorites,
  savedProperty,
  inspection,
  SaveSearch,
  SearchShow,
  Searchdelete,
  NumberOfPropertiesSold,
  Property_sales_as_lead_agent,
  Number_of_reviews,
  Years_experience,
  compareAgents,
  contact_us,
  propaties,
  latestagent,
  loginWithGoogle,
  loginWithFacebook,

  deleteAccount,
  signOutAll,
  propertyData,
};
