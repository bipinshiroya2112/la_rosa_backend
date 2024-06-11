const express = require("express");
const admin = require("../models/savesearch.model");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const { hashSync } = require("bcrypt");
const HTTP = require("../../constants/responseCode.constant");
const {
  sendForgotPasswordLink,
  tokenforAgency,
  sendEmailOTP,
} = require("../../public/partials/utils");
const nodemailer = require("nodemailer");
const bcrypt = require("bcrypt");
const admin_agent = require("../models/admin.agent");
const property_listing = require("../models/property_listing");
const Register = require("../models/register");
// const { ApiKeyManager } = require('@esri/arcgis-rest-request');
const axios = require("axios");
// const { geocode } = require('@esri/arcgis-rest-geocoding');
// const apiKey = "AAPK6761830a440b49d1a6b71e7c30758007o68TwFDn1k66vCc7YDzZM-rAnUjCRnGBf_Ygz1FQCx1fzc4eE2peDdogXfPIZYbT";

// const authentication = ApiKeyManager.fromKey(apiKey);
const { log } = require("handlebars");
const { ObjectId } = require("mongodb");
const fs = require("fs");
const path = require("path");
const { request } = require("http");
const { register } = require("module");
const AVATAR_PATH = "/uploads/agency_image";

//Add default admin
(async function deafultAdminsignup(req, res) {
  try {
    const adminData = {
      username: "admin",
      email: "larosa.admin@yopmail.com",
      role: "admin",
    };
    const password = "larosaadmin@123";
    // const encData = await encryptUserModel(adminData)
    const existsAdmin = await Register.findOne({
      email: adminData.email,
      role: adminData.role,
    });

    //Admin exist
    if (existsAdmin) return;

    const userData = await new Register({
      ...adminData,
      password: hashSync(password.trim(), 8),
      isVerified: true,
    }).save();
    if (!userData) console.log("Unable to add default admin");

    return;
  } catch (e) {
    console.log(e);
    return;
  }
})();

// admin sign in
async function signin(req, res) {
  try {
    let { email, password, role } = req.body;

    console.log(
      " file: admin.controller.js : - 55 ~ signin ~ req.body",
      req.body
    );

    if (!req.body || !password || !email) {
      return res.status(HTTP.SUCCESS).send({
        success: false,
        code: HTTP.NOT_ALLOWED,
        message: "email or password is invalid",
        data: {},
      });
    }
    // const encData = await encryptUserModel({ email })

    const adminExists = await Register.findOne({ email: req.body.email });

    if (!adminExists) {
      return res.status(HTTP.SUCCESS).send({
        success: false,
        code: HTTP.NOT_ALLOWED,
        message: "email is incorrect",
        data: {},
      });
    }

    if (adminExists.role !== "admin")
      return res.status(HTTP.SUCCESS).send({
        status: false,
        code: HTTP.BAD_REQUEST,
        message: "Invalid credentials.",
        data: {},
      });

    if (!bcrypt.compareSync(password, adminExists.password)) {
      return res.status(HTTP.SUCCESS).send({
        success: false,
        code: HTTP.BAD_REQUEST,
        message: "Password is incorrect",
        data: {},
      });
    }

    const token = jwt.sign(
      { id: adminExists._id, email: adminExists.email },
      "hello@user"
    );
    // console.log(" file: admin.controller.js: 77 ~ signin ~ token", token);

    return res.status(HTTP.SUCCESS).send({
      status: true,
      code: HTTP.SUCCESS,
      message: "Logged in successfully!",
      data: { userId: adminExists?._id, data: token },
    });
  } catch (error) {
    console.log(error);
    return res.status(HTTP.SUCCESS).send({
      success: false,
      code: HTTP.INTERNAL_SERVER_ERROR,
      message: "Something went wrong!",
      data: {},
    });
  }
}

// admin forgot password
// async function forgotPassword(req, res) {
//   try {
//     let { email } = req.body;
// console.log("email-->", email);
//     if (!email) {
//       return res.status(HTTP.SUCCESS).send({
//         success: false,
//         code: HTTP.NOT_ALLOWED,
//         message: "provide email",
//         data: {},
//       });
//     }

//     result = await Register.findOne({ email: req.body.email });
//     if (!result) {
//       return res.status(HTTP.SUCCESS).send({
//         success: false,
//         code: HTTP.NOT_FOUND,
//         message: "Record not found",
//         data: {},
//       });
//     }
//     console.log(result, "result");
//     const token = jwt.sign(
//       { id: result._id, email: result.email },
//       process.env.JWT_SECRET,
//       { expiresIn: "15m" }
//     );
//     console.log("token", token);
//     let link = "";
//     if (result.role == "admin") {
//       link = `${process.env.REACT_MAINADMIN_APP_WEB_URL}/${result.id}/${token}`;
//     } else {
//       link = `${process.env.REACT_ADMIN_APP_WEB_URL}/${result.id}/${token}`;
//     }
//     console.log(link,"this is a link result id");

//     // console.log(" file: admin.controller.js: ~ forgotPassword ~ link", link);

//     var sendMailData = {
//       file_template: "../../public/EmailTemplates/forgotPassword.html",
//       subject: "Link to reset the password",
//       to: result.email ? result.email : null,
//       link: link,
//     };
//     console.log("test");

//     sendForgotPasswordLink(sendMailData)
//       .then((val) => {
//         return res.status(HTTP.SUCCESS).send({
//           status: true,
//           code: HTTP.SUCCESS,
//           message: "Please check your email.",
//           data: val,
//         });
//       })
//       .catch((err) => {
//         console.log(err);
//         return res.status(HTTP.SUCCESS).send({
//           status: false,
//           code: HTTP.BAD_REQUEST,
//           message: "Unable to send email!",
//           data: {},
//         });
//       });

//     return res.status(HTTP.SUCCESS).send({
//       status: true,
//       code: HTTP.SUCCESS,
//       message: "Please check your email.",
//       data: { token: " " + token },
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

async function forgotPassword(req, res) {
  try {
    let { email } = req.body;
    console.log("email-->", email);

    if (!email) {
      return res.status(HTTP.SUCCESS).send({
        success: false,
        code: HTTP.NOT_ALLOWED,
        message: "provide email",
        data: {},
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

    console.log(result, "result");

    const token = jwt.sign(
      { id: result._id, email: result.email },
      process.env.JWT_SECRET,
      { expiresIn: "15m" }
    );

    console.log("token", token);

    let link = "";

    if (result.role == "admin") {
      link = `${process.env.REACT_MAINADMIN_APP_WEB_URL}/${result.id}/${token}`;
    } else {
      link = `${process.env.REACT_ADMIN_APP_WEB_URL}/${result.id}/${token}`;
    }

    console.log(link, "this is a link result id");
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
  } catch (err) {
    console.log(err);
    res.status(HTTP.SUCCESS).send({
      status: false,
      code: HTTP.INTERNAL_SERVER_ERROR,
      message: "Something went wrong!",
      data: {},
    });
  }
}

//set New Password
// async function setNewPassword(req, res) {
//   try {
//     let { password, cpassword, id, oldpass } = req.body;
//     console.log(
//       " ~ file: admin.controller.js ~ setNewPassword ~ req.body",
//       req.body
//     );
//     if (!password || !cpassword || !id || !oldpass) {
//       return res.status(400).json({
//           status: false,
//           message: "All fields are required",
//           data: {}
//       });
//   }

//     const user = await Register.findById(id);
//     console.log(user);
//     if (!user) {
//       return res.status(401).send({
//         status: false,
//         code: HTTP.BAD_REQUEST,
//         message: "password and confirmpassword does not match!!",
//         data: {},
//       });
//     }
//     const oldpassword = hashSync(oldpass?.trim(), 10);
//     console.log(oldpass);
//     console.log(oldpassword);
//     if (user?.password !== oldpassword) {
//       return res.status(401).send({
//         status: false,
//         code: HTTP.BAD_REQUEST,
//         message: "old password  does not match!!",
//         data: {},
//       });
//     }

//     // if (req.body && password && cpassword) {
//       //check password
//       if (password !== cpassword) {
//         return res.status(HTTP.SUCCESS).send({
//           status: false,
//           code: HTTP.NOT_ALLOWED,
//           message: "Password and confirm password does not match",
//           data: {},
//         });
//       }
//       // add other validations
//       if (password.length < 8 || password.length > 16) {
//         return res.status(HTTP.SUCCESS).send({
//           status: false,
//           code: HTTP.NOT_ALLOWED,
//           message: "Password must be between of 8 to 16 characters!",
//           data: {},
//         });
//       }
//       // if (!role) {
//       //   return res.status(HTTP.SUCCESS).send({
//       //     status: false,
//       //     code: HTTP.NOT_ALLOWED,
//       //     message: "role is required",
//       //     data: {},
//       //   });
//       // }

//       password = hashSync(password.trim(), 10);

//       const result = await Register.findByIdAndUpdate(
//         // { role: role },
//         id,
//         { password },
//         { new: true }
//       );
//       console.log(
//         "🚀 ~ file: admin_agency_controller.js:145 ~ setNewPassword ~ result:",
//         result
//       );
//       if (!result) {
//         return res.status(HTTP.SUCCESS).send({
//           status: false,
//           code: HTTP.NOT_ALLOWED,
//           message: "Unable to update password",
//           data: {},
//         });
//       }

//       return res.status(HTTP.SUCCESS).send({
//         status: true,
//         code: HTTP.SUCCESS,
//         message: "New Password has been set",
//         data: {},
//       });
//     // } else {
//     //   return res.status(HTTP.SUCCESS).send({
//     //     status: false,
//     //     code: HTTP.NOT_ALLOWED,
//     //     message: "New password and confirm password is required",
//     //     data: {},
//     //   });
//     // }
//   } catch (err) {
//     console.log(" ~ file: admin.controller.js ~ setNewPassword ~ err", err);
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
    const { password, cpassword, id, oldpass } = req.body;

    // Input validation
    if (!password || !cpassword || !id || !oldpass) {
      return res.status(400).json({
        status: false,
        message: "All fields are required",
        data: {},
      });
    }

    // Fetch user by ID
    const user = await Register.findById(id);
    if (!user) {
      return res.status(404).json({
        status: false,
        message: "User not found",
        data: {},
      });
    }

    // Verify old password
    const isPasswordMatch = await bcrypt.compare(oldpass, user.password);
    if (!isPasswordMatch) {
      return res.status(401).json({
        status: false,
        message: "Old password does not match",
        data: {},
      });
    }

    // Check if new password and confirm password match
    if (password !== cpassword) {
      return res.status(400).json({
        status: false,
        message: "New password and confirm password do not match",
        data: {},
      });
    }

    // Validate password length
    if (password.length < 8 || password.length > 16) {
      return res.status(400).json({
        status: false,
        message: "Password must be between 8 to 16 characters",
        data: {},
      });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update user password
    const updatedUser = await Register.findByIdAndUpdate(
      id,
      { password: hashedPassword },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(500).json({
        status: false,
        message: "Failed to update password",
        data: {},
      });
    }

    // Password updated successfully
    return res.status(200).json({
      status: true,
      message: "Password updated successfully",
      data: {},
    });
  } catch (error) {
    console.error("Error in setNewPassword:", error);
    return res.status(500).json({
      status: false,
      message: "Internal server error",
      data: {},
    });
  }
}

// ==================================================================================================================================
// add agency
async function agencySignup(req, res) {
  try {
    let {
      email,
      password,
      role,
      street = null,
      suburb_area = null,
      postcode = null,
      state_region = null,
      country = null,
      mailing_address_street = null,
      mailing_address_suburb_area = null,
      mailing_address_postcode = null,
      mailing_address_state_region = null,
      mailing_address_country = null,
      fax = null,
      phone = null,
      web = null,
      facebook_page = null,
      twitter_profile_url = null,
      principal_name = null,
      display_email = null,
      office_description = null,
      agencySmallLogo = null,
      agencyMediumLogo = null,
      agencyLargeLogo = null,
      commercialAgencySmallLogo = null,
      commercialAgencyMediumLogo = null,
      commercialAgencyLargeLogo = null,
      commercialAgencyExtraLargeLogo = null,
      heroImg = null,
      primary_color = null,
      secondary_color = null,
      text_color = null,
      publish = null,
    } = req.body;

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
        message: "email is invalid!",
        data: {},
      });
    }

    if (password.length < 8 || password.length > 16) {
      return res.status(HTTP.SUCCESS).send({
        status: false,
        code: HTTP.BAD_REQUEST,
        message: "Please enter a strong password",
        data: {},
      });
    } else {
      password = hashSync(password.trim(), 8);
    }

    const agencyExists = await Register.findOne({ $or: [{ email: email }] });
    console.log(
      "🚀 ~ file: admin_agency_controller.js:215 ~ agencySignup ~ agencyExists:",
      agencyExists
    );
    if (agencyExists) {
      return res.status(HTTP.SUCCESS).send({
        status: false,
        code: HTTP.BAD_REQUEST,
        message: "agency Exists. Please Sign In.",
        data: {},
        page: "signin",
      });
    }

    const userData = new Register({
      email,
      password,
      role,
      street,
      suburb_area,
      postcode,
      state_region,
      country,
      mailing_address_street,
      mailing_address_suburb_area,
      mailing_address_postcode,
      mailing_address_state_region,
      mailing_address_country,
      fax,
      phone,
      web,
      facebook_page,
      twitter_profile_url,
      principal_name,
      display_email,
      office_description,
      agencySmallLogo,
      agencyMediumLogo,
      agencyLargeLogo,
      commercialAgencySmallLogo,
      commercialAgencyMediumLogo,
      commercialAgencyLargeLogo,
      commercialAgencyExtraLargeLogo,
      heroImg,
      primary_color,
      secondary_color,
      text_color,
    }).save();

    // if (!userData)
    //   console.log("🚀 ~ file: admin_agency_controller.js:254 ~ agencySignup ~ userData:", userData)
    // return res.status(HTTP.SUCCESS).send({ status: false, code: HTTP.BAD_REQUEST, message: "Unable to register agency!", data: {} });

    return res.status(HTTP.SUCCESS).send({
      status: true,
      code: HTTP.SUCCESS,
      message: "agency Registered.",
      data: {},
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

//agency signin

async function agencySignin(req, res) {
  try {
    let { email, password, role } = req.body;

    if (!req.body || !password || !email) {
      return res.status(HTTP.SUCCESS).send({
        success: false,
        code: HTTP.NOT_ALLOWED,
        message: "email or password is invalid",
        data: {},
      });
    }
    let token;

    if (role == "agency") {
      const agencyExist = await Register.findOne({ email: req.body.email });
      console.log(
        "🚀 ~ agencySignin ~ adminExists:----------------",
        agencyExist
      );

      if (!agencyExist) {
        return res.status(HTTP.SUCCESS).send({
          status: false,
          code: HTTP.BAD_REQUEST,
          message: "Agency Not Exist",
          data: {},
        });
      }
      if (!bcrypt.compareSync(password, agencyExist.password)) {
        return res.status(HTTP.SUCCESS).send({
          success: false,
          code: HTTP.BAD_REQUEST,
          message: "Password is incorrect",
          data: {},
        });
      }
      if (agencyExist.role !== req.body.role) {
        return res.status(HTTP.SUCCESS).send({
          status: false,
          code: HTTP.BAD_REQUEST,
          message: "Invalid credentials.",
          data: {},
        });
      }
      token = jwt.sign({ id: agencyExist._id }, process.env.JWT_SECRET);
      console.log("🚀 ~ agencySignin ~ token:", token);
      return res.status(HTTP.SUCCESS).send({
        status: true,
        code: HTTP.SUCCESS,
        message: "Logged in successfully!",
        data: { token: token, role: role, id: agencyExist._id },
      });
    }
    if (role == "agent") {
      const agentExists = await admin_agent.findOne({ email: req.body.email });

      if (!agentExists) {
        return res.status(HTTP.SUCCESS).send({
          status: false,
          code: HTTP.BAD_REQUEST,
          message: "Agent Not Exist",
          data: {},
        });
      }
      // if (!bcrypt.compareSync(password, agentExists.password)) {
      //   return res.status(HTTP.SUCCESS).send({
      //     success: false,
      //     code: HTTP.BAD_REQUEST,
      //     message: "Password is incorrect",
      //     data: {},
      //   });
      // }
      if (password != agentExists.password) {
        return res.status(HTTP.SUCCESS).send({
          success: false,
          code: HTTP.BAD_REQUEST,
          message: "Password is incorrect",
          data: {},
        });
      }
      if (agentExists.role !== req.body.role) {
        return res.status(HTTP.SUCCESS).send({
          status: false,
          code: HTTP.BAD_REQUEST,
          message: "Invalid credentials.",
          data: {},
        });
      }
      token = jwt.sign({ id: agentExists._id }, process.env.JWT_SECRET);
      console.log("🚀 ~ agencySignin ~ token:", token);
      return res.status(HTTP.SUCCESS).send({
        status: true,
        code: HTTP.SUCCESS,
        message: "Logged in successfully!",
        data: { token: token, role: role, id: agentExists._id },
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(HTTP.SUCCESS).send({
      success: false,
      code: HTTP.INTERNAL_SERVER_ERROR,
      message: "Something went wrong!",
      data: {},
    });
  }
}

//====================================================================  agency forgot password  =================================================================================

async function agencyFpassword(req, res) {
  try {
    let { email } = req.body;
    // console.log(
    //   "🚀 ~ file: admin_agency_controller.js:306 ~ agencyFpassword ~ email:",
    //   email
    // );

    if (!email) {
      return res.status(HTTP.SUCCESS).send({
        success: false,
        code: HTTP.NOT_ALLOWED,
        message: "provide email",
        data: {},
      });
    }

    result = await Register.findOne({ email: req.body.email });
    console.log(
      "🚀 ~ file: admin_agency_controller.js:313 ~ agencyFpassword ~ result:",
      result
    );
    if (!result) {
      return res.status(HTTP.SUCCESS).send({
        success: false,
        code: HTTP.NOT_FOUND,
        message: "Record not found",
        data: {},
      });
    }

    const token = jwt.sign(
      { id: result._id, email: result.email },
      process.env.JWT_SECRET,
      { expiresIn: "15m" }
    );

    const link = `${process.env.REACT_ADMIN_APP_WEB_URL}/${result.id}/${token}`;

    // var sendMailData = {
    //   file_template: "./public/emailTemplates/forgotPassword.html",
    //   subject: "Link to reset the password",
    //   to: result.email ? result.email : null,
    //   link: link,
    // };

    // sendForgotPasswordLink(sendMailData)
    //   .then((val) => {
    //     console.log(
    //       "🚀 ~ file: admin_agency_controller.js:335 ~ .then ~ val:",
    //       val
    //     );
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
      data: { token: token },
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
//=======================================================================  agency set new password  ==========================================================================

async function updatePassword(req, res) {
  try {
    let { id, password, cpassword } = req.body;
    console.log(req.body);
    if (!req.body) {
      return res.status(HTTP.SUCCESS).send({
        success: false,
        code: HTTP.NOT_FOUND,
        message: "All Feilds Are Not Found",
        data: {},
      });
    }
    if (password != cpassword) {
      return res.status(HTTP.SUCCESS).send({
        success: false,
        code: HTTP.NOT_FOUND,
        message: "Both Password Not Matched",
        data: {},
      });
    }
    if (password.length < 8 || password.length > 16) {
      return res.status(HTTP.SUCCESS).send({
        status: false,
        code: HTTP.BAD_REQUEST,
        message: "Please enter a strong password",
        data: {},
      });
    } else {
      password = hashSync(password.trim(), 8);
    }

    const result = await Register.findByIdAndUpdate(
      { _id: id },
      { password: password },
      { new: true }
    );
    if (!result) {
      return res.status(HTTP.SUCCESS).send({
        success: false,
        code: HTTP.NOT_FOUND,
        message: "Record not found",
        data: {},
      });
    }
    return res.status(HTTP.SUCCESS).send({
      status: true,
      code: HTTP.SUCCESS,
      message: "Password Updated successfully",
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

//=======================================================================  agency set new password  ==========================================================================

// async function agencySetpassword(req, res) {
//   try {
//     let { password, cpassword, role ,} = req.body;
//     email = req.data;
//     console.log("🚀 ~ agencySetpassword ~ email:", email);
//     console.log(
//       "~ file: admin.controller.js: 351 ~ setNewPassword ~ req.body------------------",
//       req.body
//     );

//     if (req.body && password && cpassword) {
//       //check password
//       if (password != cpassword) {
//         return res.status(HTTP.SUCCESS).send({
//           status: false,
//           code: HTTP.NOT_ALLOWED,
//           message: "Password and confirm password does not match",
//           data: {},
//         });
//       }
//       // add other validations
//       if (password.length < 8 || password.length > 20) {
//         return res.status(HTTP.SUCCESS).send({
//           status: false,
//           code: HTTP.NOT_ALLOWED,
//           message: "Password must be between of 8 to 16 characters!",
//           data: {},
//         });
//       }

//       password = hashSync(password.trim(), 10);
//       console.log(
//         "🚀 ~ file: admin_agency_controller.js:369 ~ agencySetpassword ~ password:",
//         password
//       );

//       const result = await Register.findOneAndUpdate(
//         { role: "agency" },
//         { password },
//         { new: true }
//       );
//       console.log(
//         "🚀 ~ file: admin_agency_controller.js:372 ~ agencySetpassword ~ result:",
//         result
//       );
//       if (!result) {
//         return res.status(HTTP.SUCCESS).send({
//           status: false,
//           code: HTTP.NOT_ALLOWED,
//           message: "Unable to update password",
//           data: {},
//         });
//       }

//       return res.status(HTTP.SUCCESS).send({
//         status: true,
//         code: HTTP.SUCCESS,
//         message: "New Password has been set",
//         data: {},
//       });
//     } else {
//       return res.status(HTTP.SUCCESS).send({
//         status: false,
//         code: HTTP.NOT_ALLOWED,
//         message: "New password and confirm password is required",
//         data: {},
//       });
//     }
//   } catch (err) {
//     console.log(" ~ file: admin.controller.js ~ setNewPassword ~ err", err);
//     return res.status(HTTP.SUCCESS).send({
//       status: false,
//       code: HTTP.INTERNAL_SERVER_ERROR,
//       message: "Something went wrong!",
//       data: {},
//     });
//   }
// }

async function agencySetpassword(req, res) {
  console.log("-----------------------------------------------");
  try {
    let { password, cpassword, oldpassword, role, id } = req.body; // Extract id from req.body
    console.log("🚀 ~ agencySetpassword ~ email:", req.body);
    console.log("___________", id);

    if (!id || !password || !cpassword || !oldpassword) {
      // Check if id and all required fields are provided
      return res.status(HTTP.SUCCESS).send({
        status: false,
        code: HTTP.NOT_ALLOWED,
        message:
          "ID, New Password, Confirm Password, and Old Password are required",
        data: {},
      });
    }

    // Check if new password and confirm password match
    if (password !== cpassword) {
      return res.status(HTTP.SUCCESS).send({
        status: false,
        code: HTTP.NOT_ALLOWED,
        message: "New Password and Confirm Password do not match",
        data: {},
      });
    }

    // Check password length
    if (password.length < 8 || password.length > 20) {
      return res.status(HTTP.SUCCESS).send({
        status: false,
        code: HTTP.NOT_ALLOWED,
        message: "New Password must be between 8 to 20 characters!",
        data: {},
      });
    }

    // Verify old password from the database
    const user = await Register.findOne({ _id: id }); // Find user by _id
    console.log("----------------------", user);
    if (!user) {
      return res.status(HTTP.SUCCESS).send({
        status: false,
        code: HTTP.NOT_ALLOWED,
        message: "Old Password is incorrect",
        data: {},
      });
    }

    // Hash and update new password in the database
    const newPasswordHash = hashSync(password.trim(), 10);
    const result = await Register.findOneAndUpdate(
      { _id: id, role: "agency" },
      { password: newPasswordHash },
      { new: true }
    );

    if (!result) {
      return res.status(HTTP.SUCCESS).send({
        status: false,
        code: HTTP.NOT_ALLOWED,
        message: "Unable to update password",
        data: {},
      });
    }

    return res.status(HTTP.SUCCESS).send({
      status: true,
      code: HTTP.SUCCESS,
      message: "New Password has been set",
      data: {},
    });
  } catch (err) {
    console.log(" ~ file: admin.controller.js ~ setNewPassword ~ err", err);
    return res.status(HTTP.SUCCESS).send({
      status: false,
      code: HTTP.INTERNAL_SERVER_ERROR,
      message: "Something went wrong!",
      data: {},
    });
  }
}

// async function agentSetpassword(req, res) {
//   try {
//     let { password, cpassword, id, oldpassword } = req.body;

//     if (req.body && password && cpassword) {
//       //check password
//       if (password != cpassword) {
//         return res.status(HTTP.SUCCESS).send({
//           status: false,
//           code: HTTP.NOT_ALLOWED,
//           message: "Password and confirm password does not match",
//           data: {},
//         });
//       }
//       // add other validations
//       if (password.length < 8 || password.length > 20) {
//         return res.status(HTTP.SUCCESS).send({
//           status: false,
//           code: HTTP.NOT_ALLOWED,
//           message: "Password must be between of 8 to 16 characters!",
//           data: {},
//         });
//       }

//       password = hashSync(oldpassword?.trim(), 10);
//       console.log("🚀 ~ agentSetpassword ~ password:", password);

//       // const result = await Register.findOneAndUpdate(
//       //   { role: "agency" },
//       //   { password },
//       //   { new: true }
//       // );

//       const result = await admin_agent.findOne({ _id: id });
//       console.log("🚀 ~ agentSetpassword ~ result:", result);
//       result.password = password;
//       await result.save();

//       if (!result) {
//         return res.status(HTTP.SUCCESS).send({
//           status: false,
//           code: HTTP.NOT_ALLOWED,
//           message: "Unable to update password",
//           data: {},
//         });
//       }

//       return res.status(HTTP.SUCCESS).send({
//         status: true,
//         code: HTTP.SUCCESS,
//         message: "New Password has been set",
//         data: {},
//       });
//     } else {
//       return res.status(HTTP.SUCCESS).send({
//         status: false,
//         code: HTTP.NOT_ALLOWED,
//         message: "New password and confirm password is required",
//         data: {},
//       });
//     }
//   } catch (err) {
//     console.log(" ~ file: admin.controller.js ~ setNewPassword ~ err", err);
//     return res.status(HTTP.SUCCESS).send({
//       status: false,
//       code: HTTP.INTERNAL_SERVER_ERROR,
//       message: "Something went wrong!",
//       data: {},
//     });
//   }
// }

//======================================================== agency view Profile ==============================================================

async function agentSetpassword(req, res) {
  const { password, cpassword, id } = req.body;
  console.log("🚀 ~ agentSetpassword ~ id:", id);
  console.log("🚀 ~ agentSetpassword ~ password:", password);

  const user = await admin_agent.findById(id);

  if (!user) {
    return res.status(401).send({
      status: false,
      code: HTTP.BAD_REQUEST,
      message: "password and confirmpassword does not match!!",
      data: {},
    });
  }

  if (password !== cpassword) {
    return res.status(401).send({
      status: false,
      code: HTTP.BAD_REQUEST,
      message: "password and confirmpassword does not match!!",
      data: {},
    });
  }

  const passwordHash = hashSync(password?.trim(), 10);

  user.password = passwordHash;
  await user.save();
  console.log("🚀 ~ agentSetpassword ~ user:", user);

  if (user.password !== passwordHash) {
    return res.status(401).send({
      status: false,
      code: HTTP.BAD_REQUEST,
      message: "password does not update!!",
      data: {},
    });
  }

  return res.status(HTTP.SUCCESS).send({
    status: true,
    code: HTTP.SUCCESS,
    message: "New Password has been set",
    data: {},
  });
}

async function agencyViewProfile(req, res) {
  var id = req.Data;
  if (req.body.role == "agency") {
    Register.findById(id, async function (err, doc) {
      try {
        if (!doc) {
          return res.status(HTTP.SUCCESS).send({
            status: false,
            code: HTTP.NOT_FOUND,
            message: "Record not found",
            data: {},
          });
        }
        return res.status(HTTP.SUCCESS).send({
          status: true,
          code: HTTP.SUCCESS,
          message: "agency Profile",
          data: await doc,
        });
      } catch (err) {
        return res.status(HTTP.SUCCESS).send({
          status: false,
          code: HTTP.INTERNAL_SERVER_ERROR,
          message: "Something went wrong!",
          data: {},
        });
      }
    });
  }
  if (req.body.role == "agent") {
    const objectId = mongoose.Types.ObjectId;
    const idObject = new objectId(id);
    const agent = await admin_agent.aggregate([
      {
        $match: { _id: idObject },
      },
      {
        $lookup: {
          from: "registers",
          localField: "agency_id",
          foreignField: "_id",
          as: "agencyDetails",
        },
      },
    ]);
    return res.status(HTTP.SUCCESS).send({
      status: true,
      code: HTTP.SUCCESS,
      message: "agency Profile",
      data: agent,
    });
  }
}

//============================================= agency veiw profile user side ===================================================

async function agencyViewProfile_U(req, res) {
  var id = req.body.id;
  // console.log("🚀 ~ file: admin_agency_controller.js:417 ~ agencyViewProfile_U ~ id:", id)

  try {
    const ObjectId = mongoose.Types.ObjectId;
    const idObject = new ObjectId(id);
    // console.log("🚀 ~ agencyViewProfile_U ~ idObject:", idObject)

    const result = await Register.aggregate([
      {
        $match: { _id: idObject },
      },
      {
        $lookup: {
          from: "property_listings",
          localField: "_id",
          foreignField: "agency_id",
          as: "properties",
        },
      },
      {
        $lookup: {
          from: "agents",
          localField: "properties.lead_agent",
          foreignField: "_id",
          as: "agents",
        },
      },

      {
        $project: {
          "agents._id": 1,
          "agents.name": 1,
          "agents.profileImg": 1,
          "agents.reviews": 1,
          "properties._id": 1,
          "properties.frontPageImg": 1,
          "properties.lead_agent": 1,
          "properties.address": 1,
          "properties.location": 1,
          "properties.price": 1,
          "properties.street_address_number": 1,
          "properties.street_address_name": 1,
          "properties.createdAt": 1,
          "properties.property_type": 1,
          "properties.Bathrooms": 1,
          "properties.Bedrooms": 1,
          "properties.carport_spaces": 1,
          email: 1,
          street: 1,
          suburb_area: 1,
          postcode: 1,
          state_region: 1,
          country: 1,
          mailing_address_street: 1,
          mailing_address_suburb_area: 1,
          mailing_address_postcode: 1,
          mailing_address_state_region: 1,
          mailing_address_country: 1,
          fax: 1,
          phone: 1,
          web: 1,
          facebook_page: 1,
          twitter_profile_url: 1,
          principal_name: 1,
          display_email: 1,
          office_description: 1,
          agencySmallLogo: 1,
          agencyMediumLogo: 1,
          agencyLargeLogo: 1,
          commercialAgencySmallLogo: 1,
          commercialAgencyMediumLogo: 1,
          commercialAgencyLargeLogo: 1,
          commercialAgencyExtraLargeLogo: 1,
          heroImg: 1,
          primary_color: 1,
          secondary_color: 1,
          text_color: 1,
        },
      },
    ]).exec();
    let totalreviewstar = 0;
    let totalreviews = 0;
    let averageRating = 0;
    for (data of result[0].agents) {
      if (data.reviews.length != 0) {
        totalreviews += data.reviews.length;
        for (i = 0; i < data.reviews.length; i++) {
          totalreviewstar += Number(data.reviews[i].star);
        }
      }
    }
    averageRating = totalreviewstar / totalreviews;
    return res.status(HTTP.SUCCESS).send({
      status: true,
      code: HTTP.SUCCESS,
      message: "agency Profile",
      data: result,
      averageRating,
    });
  } catch (err) {
    console.log("🚀 ~ agencyViewProfile_U ~ err:", err);
    return res.status(HTTP.SUCCESS).send({
      status: false,
      code: HTTP.INTERNAL_SERVER_ERROR,
      message: "Something went wrong!",
      data: {},
    });
  }
}

//=========================================== agency profile update ==================================================================

async function agencyUpdateProfile(req, res) {
  try {
    if (req.body) {
      const update = await Register.findByIdAndUpdate(
        req.Data,
        { $set: req.body },
        { new: true }
      );
      if (update) {
        return res.status(HTTP.SUCCESS).send({
          status: true,
          code: HTTP.SUCCESS,
          message: "agency Profile update",
          data: {},
        });
      }
    }
  } catch (error) {
    console.log("🚀 ~ agencyUpdateProfile ~ error:", error);
    return res.status(HTTP.SUCCESS).send({
      status: false,
      code: HTTP.INTERNAL_SERVER_ERROR,
      message: "Something went wrong!",
      data: {},
    });
  }
}

// ====================================================  View All Agency ====================================================================================

async function viewAllAgency(req, res) {
  try {
    let formattedAgencyData = [];
    const usersData = await Register.find({ role: "agency", publish: true });
    if (!usersData)
      return res.status(HTTP.SUCCESS).send({
        status: false,
        code: HTTP.NOT_FOUND,
        message: "No Agency available!",
        data: {},
      });

    for (const data of usersData) {
      formattedAgencyData.push({
        id: data._id,
        name: data.name,
        agencyLargeLogo: data.agencyLargeLogo,
        name: data.principal_name,
        street: data.street,
        suburb_area: data.suburb_area,
        postcode: data.postcode,
        publish: true,
        secondary_color: data.secondary_color,
        primary_color: data.primary_color,
        text_color: data.text_color,
        createdAt: data.createdAt
      });
    }
    formattedAgencyData.sort((a, b) => (a.createdAt < b.createdAt) ? 1 : -1);
    return res.status(HTTP.SUCCESS).send({
      status: true,
      code: HTTP.SUCCESS,
      message: "Agency details.",
      data: formattedAgencyData,
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

// ================================================== agency delete profile ===================================================
async function agencyDelete(req, res) {
  try {
    Register.findByIdAndDelete(req.Data, async function (err, data) {
      if (err) {
        return res.status(HTTP.SUCCESS).send({
          status: false,
          code: HTTP.INTERNAL_SERVER_ERROR,
          message: "Something went wrong!",
          data: {},
        });
      }
      return res.status(HTTP.SUCCESS).send({
        status: true,
        code: HTTP.SUCCESS,
        message: "agency Profile delete",
        data: {},
      });
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

// ================================================  Agency branding and images update  =================================================================================

async function Agency_Branding_Update(req, res) {
  var id = req.Data;
  try {
    const { secondary_color, primary_color, text_color, heroImg, agencyLargeLogo, agencyMediumLogo, agencySmallLogo } = req.body;
    console.log("-------------- branding body ----------->> ", req.body);
    await Register.findById(id, async function (err, doc) {
      if (secondary_color || primary_color || text_color) {
        await Register.findByIdAndUpdate(
          doc.id,
          {
            secondary_color: secondary_color,
            primary_color: primary_color,
            text_color: text_color,
          },
          { new: true }
        );
      }
      if (req.body.agencySmallLogo != 'undefined') {
        await Register.findByIdAndUpdate(
          doc.id,
          {
            agencySmallLogo: agencySmallLogo,
          },
          { new: true }
        );
      }
      if (req.body.agencyMediumLogo != 'undefined') {
        await Register.findByIdAndUpdate(
          doc.id,
          {
            agencyMediumLogo: agencyMediumLogo,
          },
          { new: true }
        );
      }
      if (req.body.agencyLargeLogo != 'undefined') {
        await Register.findByIdAndUpdate(
          doc.id,
          {
            agencyLargeLogo: agencyLargeLogo,
          },
          { new: true }
        );
      }
      if (req.body.heroImg != 'undefined') {
        await Register.findByIdAndUpdate(
          doc.id,
          {
            heroImg: heroImg,
          },
          { new: true }
        );
      }
      if (req.files.commercialAgencySmallLogo) {
        if (req.files.commercialAgencySmallLogo !== null) {
          // console.log(doc, "-------------------->");
          if (doc.commercialAgencySmallLogo) {
            fs.unlinkSync(
              path.join(__dirname, "..", "..", doc.commercialAgencySmallLogo)
            );
          }
          for (data of req.files.commercialAgencySmallLogo) {
            commercialAgencySmallLogo = "uploads/agency_image/" + data.filename;
            await Register.findByIdAndUpdate(
              id,
              { commercialAgencySmallLogo: commercialAgencySmallLogo },
              { new: true }
            ),
              function (err, docs) {
                if (err) {
                  console.log(err);
                }
              };
          }
        } else {
          // console.log(doc, "-------------------->");
          var imagePath = "";
          if (doc.commercialAgencySmallLogo) {
            imagePath = doc.commercialAgencySmallLogo;
          }
          for (data of req.files.commercialAgencySmallLogo) {
            await Register.findByIdAndUpdate(
              id,
              { commercialAgencySmallLogo: imagePath },
              { new: true }
            ),
              function (err, docs) {
                if (err) {
                  console.log(err);
                }
              };
          }
        }
      }
      if (req.files.commercialAgencyMediumLogo) {
        if (req.files.commercialAgencyMediumLogo !== null) {
          // console.log(doc, "-------------------->");
          if (doc.commercialAgencyMediumLogo) {
            fs.unlinkSync(
              path.join(__dirname, "..", "..", doc.commercialAgencyMediumLogo)
            );
          }
          for (data of req.files.commercialAgencyMediumLogo) {
            commercialAgencyMediumLogo =
              "uploads/agency_image/" + data.filename;
            await Register.findByIdAndUpdate(
              id,
              { commercialAgencyMediumLogo: commercialAgencyMediumLogo },
              { new: true }
            ),
              function (err, docs) {
                if (err) {
                  console.log(err);
                }
              };
          }
        } else {
          // console.log(doc, "-------------------->");
          var imagePath = "";
          if (doc.commercialAgencyMediumLogo) {
            imagePath = doc.commercialAgencyMediumLogo;
          }
          for (data of req.files.commercialAgencyMediumLogo) {
            await Register.findByIdAndUpdate(
              id,
              { commercialAgencyMediumLogo: imagePath },
              { new: true }
            ),
              function (err, docs) {
                if (err) {
                  console.log(err);
                }
              };
          }
        }
      }
      if (req.files.commercialAgencyLargeLogo) {
        if (req.files.commercialAgencyLargeLogo !== null) {
          // console.log(doc, "-------------------->");
          if (doc.commercialAgencyLargeLogo) {
            fs.unlinkSync(
              path.join(__dirname, "..", "..", doc.commercialAgencyLargeLogo)
            );
          }
          for (data of req.files.commercialAgencyLargeLogo) {
            commercialAgencyLargeLogo = "uploads/agency_image/" + data.filename;
            await Register.findByIdAndUpdate(
              id,
              { commercialAgencyLargeLogo: commercialAgencyLargeLogo },
              { new: true }
            ),
              function (err, docs) {
                if (err) {
                  console.log(err);
                }
              };
          }
        } else {
          // console.log(doc, "-------------------->");
          var imagePath = "";
          if (doc.commercialAgencyLargeLogo) {
            imagePath = doc.commercialAgencyLargeLogo;
          }
          for (data of req.files.commercialAgencyLargeLogo) {
            await Register.findByIdAndUpdate(
              id,
              { commercialAgencyLargeLogo: imagePath },
              { new: true }
            ),
              function (err, docs) {
                if (err) {
                  console.log(err);
                }
              };
          }
        }
      }
      if (req.files.commercialAgencyExtraLargeLogo) {
        if (req.files.commercialAgencyExtraLargeLogo !== null) {
          // console.log(doc, "-------------------->");
          if (doc.commercialAgencyExtraLargeLogo) {
            fs.unlinkSync(
              path.join(
                __dirname,
                "..",
                "..",
                doc.commercialAgencyExtraLargeLogo
              )
            );
          }
          for (data of req.files.commercialAgencyExtraLargeLogo) {
            commercialAgencyExtraLargeLogo =
              "uploads/agency_image/" + data.filename;
            await Register.findByIdAndUpdate(
              id,
              {
                commercialAgencyExtraLargeLogo: commercialAgencyExtraLargeLogo,
              },
              { new: true }
            ),
              function (err, docs) {
                if (err) {
                  console.log(err);
                }
              };
          }
        } else {
          // console.log(doc, "-------------------->");
          var imagePath = "";
          if (doc.commercialAgencyExtraLargeLogo) {
            imagePath = doc.commercialAgencyExtraLargeLogo;
          }
          for (data of req.files.commercialAgencyExtraLargeLogo) {
            await Register.findByIdAndUpdate(
              id,
              { commercialAgencyExtraLargeLogo: imagePath },
              { new: true }
            ),
              function (err, docs) {
                if (err) {
                  console.log(err);
                }
              };
          }
        }
      }
      return res.status(HTTP.SUCCESS).send({
        status: true,
        code: HTTP.SUCCESS,
        message: "Agent registered.",
        data: {},
      });
    }).clone();
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

// =======================================================   agent profile register   =========================================================================================

// async function agentregister(req, res) {
//   try {
//     let {
//       job_title,
//       email,
//       confirm_email,
//       password,
//       mobile_number,
//       business_number,
//       first_name,
//       last_name,
//       // start_year_in_industry,
//       // license_number,
//       about_me,
//       taglines,
//       awards,
//       specialties,
//       community_involvement,
//       video_title,
//       video_URL,
//       twitter_profile_URL,
//       facebook_profile_URL,
//       linkedIn_profile_URL,
//       role,
//       residential_sales,
//       residential_property_management,
//       weakly_update,
//       agency_id,
//       reviews

//     } = req.body;

//     var name = first_name + " " + last_name;

//     if (email !== confirm_email)
//       return res.status(HTTP.SUCCESS).send({ status: false, code: HTTP.BAD_REQUEST, message: "Email and confirm email does not match" });

//     var photo = req.files.profileImg.find((item) => item);
//     var profileImg = "uploads/agent/" + photo.filename;

//     var profile = req.files.coverProfileImg.find((item) => item);
//     var coverProfileImg = "uploads/agent/" + profile.filename;

//     // if (!start_year_in_industry || !license_number) {
//     //   return res.status(HTTP.SUCCESS).send({ status: false, code: HTTP.NOT_FOUND, message: "All fields are required!", data: {} });
//     // }

//     if (!email.includes("@")) {
//       return res.status(HTTP.SUCCESS).send({ status: false, code: HTTP.BAD_REQUEST, message: "email is invalid!", data: {} });
//     }

//     const userExists = await admin_agent.findOne({ $or: [{ email: req.body.email }] });
//     if (userExists)
//       return res.status(HTTP.SUCCESS).send({ status: false, code: HTTP.BAD_REQUEST, message: "Agent with this email is already exist", data: {} });

//     var agencyId_Data = req.Data;
//     console.log("🚀 ~ file: admin_agency_controller.js:935 ~ agentregister ~ agencyId_Data:", agencyId_Data)

//     await new admin_agent({
//       job_title,
//       email,
//       confirm_email,
//       password,
//       mobile_number,
//       business_number,
//       profileImg,
//       first_name,
//       last_name,
//       name,
//       // start_year_in_industry,
//       // license_number,
//       about_me,
//       taglines,
//       awards,
//       specialties,
//       community_involvement,
//       coverProfileImg,
//       video_title,
//       video_URL,
//       twitter_profile_URL,
//       facebook_profile_URL,
//       linkedIn_profile_URL,
//       role,
//       residential_sales,
//       residential_property_management,
//       weakly_update,
//       agency_id: agencyId_Data,
//       reviews
//     }).save();

//     return res.status(HTTP.SUCCESS).send({ status: true, code: HTTP.SUCCESS, message: "Agent registered.", });
//   } catch (e) {
//     console.log(e);
//     return res.status(HTTP.SUCCESS).send({ status: false, code: HTTP.INTERNAL_SERVER_ERROR, message: "Something went wrong!", data: {} });
//   }
// }
async function agentregister(req, res) {
  try {
    let {
      job_title,
      email,
      confirm_email,
      password,
      mobile_number,
      business_number,
      first_name,
      last_name,
      // start_year_in_industry,
      // license_number,
      about_me,
      taglines,
      awards,
      specialties,
      community_involvement,
      video_title,
      video_URL,
      twitter_profile_URL,
      facebook_profile_URL,
      linkedIn_profile_URL,
      role,
      residential_sales,
      residential_property_management,
      weakly_update,
      agency_id,
      reviews,
      profileImg,
      coverProfileImg
    } = req.body;

    var name = first_name + " " + last_name;

    if (email !== confirm_email)
      return res.status(HTTP.SUCCESS).send({
        status: false,
        code: HTTP.BAD_REQUEST,
        message: "Email and confirm email does not match",
      });

    // if (!start_year_in_industry || !license_number) {
    //   return res.status(HTTP.SUCCESS).send({ status: false, code: HTTP.NOT_FOUND, message: "All fields are required!", data: {} });
    // }

    if (!email.includes("@")) {
      return res.status(HTTP.SUCCESS).send({
        status: false,
        code: HTTP.BAD_REQUEST,
        message: "email is invalid!",
        data: {},
      });
    }

    const userExists = await admin_agent.findOne({
      $or: [{ email: req.body.email }],
    });
    if (userExists)
      return res.status(HTTP.SUCCESS).send({
        status: false,
        code: HTTP.BAD_REQUEST,
        message: "Agent with this email is already exist",
        data: {},
      });

    var agencyId_Data = req.Data;
    console.log(
      "🚀 ~ file: admin_agency_controller.js:935 ~ agentregister ~ agencyId_Data:",
      agencyId_Data
    );

    await new admin_agent({
      job_title,
      email,
      confirm_email,
      password,
      mobile_number,
      business_number,
      profileImg,
      first_name,
      last_name,
      name,
      // start_year_in_industry,
      // license_number,
      about_me,
      taglines,
      awards,
      specialties,
      community_involvement,
      coverProfileImg,
      video_title,
      video_URL,
      twitter_profile_URL,
      facebook_profile_URL,
      linkedIn_profile_URL,
      role,
      residential_sales,
      residential_property_management,
      weakly_update,
      agency_id: agencyId_Data,
      reviews,
    }).save();

    return res
      .status(HTTP.SUCCESS)
      .send({ status: true, code: HTTP.SUCCESS, message: "Agent registered." });
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
//=================================================== agent view profile===============================================================================================

async function agentViewProfile(req, res) {
  var id = req.body.id;
  console.log(req.body, "agentViewprofile----||");
  const ObjectId = mongoose.Types.ObjectId;
  const idObject = new ObjectId(id);
  console.log("🚀 ~ agentViewProfile ~ idObject:", idObject);

  try {
    const check = await admin_agent.findOne({ _id: id }).populate("agency_id");

    const property = await property_listing.find({
      $and: [{ lead_agent: id }],
    });

    const medianSoldPrice = await property_listing.aggregate([
      {
        $match: { lead_agent: idObject, status: "Sold" },
      },
      {
        $group: {
          _id: null,
          avgAmount: { $push: "$price" },
        },
      },
      {
        $project: {
          avgAmount: 1,
        },
      },
    ]);

    if (!check) {
      return res.status(HTTP.SUCCESS).send({
        status: false,
        code: HTTP.NOT_FOUND,
        message: "Agent not found",
        data: {},
      });
    }

    // let averageRating = 0;
    // for (var i = 0; i < check.reviews.length; i++) {
    //   console.log("🚀 ~ agentViewProfile ~ star:", check.reviews[i].star)
    //   averageRating += Number(check.reviews[i].star)

    // }
    // averageRating /= Number(check.reviews.length)
    // console.log("🚀 ~ agentViewProfile ~ averageRating:", averageRating)

    // let agencyDetails = {
    //   agencyLargeLogo: agency_id.agencyLargeLogo,
    //   agencySmallLogo: agency_id.agencySmallLogo,
    //   agencyName: agency_id.principal_name,
    //   agencyEmail: agency_id.display_email
    // }

    let propertyDetails = {
      frontPageImage: property.frontPageImage,
      status: property.status,
      price: property.price,
      location: property.location,
    };
    const totalSoldCount = await property_listing.find({ status: "Sold" });

    return res.status(HTTP.SUCCESS).send({
      status: true,
      code: HTTP.SUCCESS,
      message: "agent Profile",
      data: check,
      property,
      totalSoldCount: totalSoldCount,
    });
  } catch (error) {
    console.log(error);
    return res.status(HTTP.SUCCESS).send({
      status: false,
      code: HTTP.NOT_FOUND,
      message: "Somthing went wrong!",
      data: {},
    });
  }
}

//=============================================================== agent Delete Profile ===================================================================================

async function agentDelete(req, res) {
  var data_id = req.body.id;

  const find_all_propaty = await property_listing.find({ lead_agent: data_id });
  if (find_all_propaty > 0) {
    await property_listing.updateMany(
      { lead_agent: data_id },
      { $set: { agent_delet_key: false } }
    );
  }
  // var id = data_id.toString().slice(0, 27);
  admin_agent.findByIdAndDelete(data_id, async function (err, data) {
    if (err) {
      return res.status(HTTP.SUCCESS).send({
        status: false,
        code: HTTP.INTERNAL_SERVER_ERROR,
        message: "Something went wrong!",
        data: {},
      });
    }
    return res.status(HTTP.SUCCESS).send({
      status: true,
      code: HTTP.SUCCESS,
      message: "agent Profile delete",
      data: {},
    });
  });
}

// ============================================================  agent update profile =============================================================================================
async function agentUpdateProfile(req, res) {
  try {
    var id = req.body.id;

    var {
      job_title,
      email,
      confirm_email,
      mobile_number,
      business_number,
      first_name,
      last_name,
      // start_year_in_industry,
      // license_number,
      about_me,
      taglines,
      awards,
      specialties,
      community_involvement,
      video_title,
      video_URL,
      twitter_profile_URL,
      facebook_profile_URL,
      linkedIn_profile_URL,
      role,
      residential_sales,
      residential_property_management,
      weakly_update,
      profileImg,
      coverProfileImg
    } = req.body;

    // var { coverProfileImg, profileImg } = req.files;

    var name = first_name + " " + last_name;

    // if (req.Data) {
    if (!req.files) {
      const update = await admin_agent.findByIdAndUpdate(
        id,
        { $set: req.body },
        { name },
        { new: true }
      );
      // console.log("🚀 ~ file: admin_controller.js:845 ~ agentEdit ~ update:", update)
      return res.status(HTTP.SUCCESS).send({
        status: true,
        code: HTTP.SUCCESS,
        message: "agent profile updated",
        data: update,
      });
    } else {
      await admin_agent.findByIdAndUpdate(
        id,
        { $set: req.body, name: name },
        { new: true }
      );

      const doc = await admin_agent.findById(id, {}, { new: true });

      // if (req.files.profileImg) {
      //   if (req.files.profileImg !== null) {
      //     // console.log(doc, "-------------------->");
      //     if (doc.profileImg) {
      //       fs.unlinkSync(path.join(__dirname, "..", "..", doc.profileImg));
      //     }
      //     for (data of req.files.profileImg) {
      //       profileImg = "uploads/agent" + data.filename;
      //       console.log(
      //         "🚀 ~ file: blog.controller.js:556 ~ editBlog ~ outsideImg",
      //         profileImg
      //       );
      //       await admin_agent.findByIdAndUpdate(
      //         id,
      //         { profileImg, name },
      //         { new: true }
      //       ),
      //         function (err, docs) {
      //           if (err) {
      //             console.log(err);
      //           }
      //         };
      //     }
      //   } else {
      //     //console.log(doc, "--------------------><------------------------");
      //     var imagePath = "";
      //     if (doc.profileImg) {
      //       imagePath = doc.profileImg;
      //     }
      //     for (data of req.files.profileImg) {
      //       await admin_agent.findByIdAndUpdate(
      //         id,
      //         { profileImg: imagePath, name },
      //         { new: true }
      //       ),
      //         function (err, docs) {
      //           if (err) {
      //             console.log(err);
      //           }
      //         };
      //     }
      //   }
      // }
      // if (req.files.coverProfileImg) {
      //   if (req.files.coverProfileImg !== null) {
      //     // console.log(doc.coverProfileImg, "-------------------->123");
      //     if (doc.coverProfileImg) {
      //       fs.unlinkSync(
      //         path.join(__dirname, "..", "..", doc.coverProfileImg)
      //       );
      //     }
      //     for (data of req.files.coverProfileImg) {
      //       coverProfileImg = "uploads/agent" + data.filename;
      //       // console.log("🚀 ~ file: blog.controller.js:589 ~ editBlog ~ outsideImg",coverProfileImg);
      //       await admin_agent.findByIdAndUpdate(
      //         id,
      //         { coverProfileImg: coverProfileImg, name },
      //         { new: true }
      //       ),
      //         function (err, docs) {
      //           if (err) {
      //             console.log(err);
      //           }
      //         };
      //     }
      //   } else {
      //     // console.log(doc, "--------------------><--------------------");
      //     var imagePath = "";
      //     if (doc.coverProfileImg) {
      //       imagePath = doc.coverProfileImg;
      //     }
      //     for (data of req.files.coverProfileImg) {
      //       await admin_agent.findByIdAndUpdate(
      //         id,
      //         { coverProfileImg: imagePath, name },
      //         { new: true }
      //       ),
      //         function (err, docs) {
      //           if (err) {
      //             console.log(err);
      //           }
      //         };
      //     }
      //   }
      // }

      return res.status(HTTP.SUCCESS).send({
        status: true,
        code: HTTP.SUCCESS,
        message: "Agent profile updated.",
        data: {},
      });
    }
    // } else {
    //   return res.status(HTTP.SUCCESS).send({ status: false, code: HTTP.UNAUTHORIZED, message: "Please authenticate your-self", data: {} });
    // }
  } catch (error) {
    console.log(error);
    return res.status(HTTP.SUCCESS).send({
      success: false,
      code: HTTP.INTERNAL_SERVER_ERROR,
      message: "Something went wrong!",
      data: {},
    });
  }
}
//================================================================== viewAll Agents Of Agency ============================================================================

async function viewAllAgentsOfAgency(req, res) {
  try {
    let formattedAgentsData = [];

    const id = req.Data;
    let agentsData;
    if (req.body.role == "agency") {
      agentsData = await admin_agent.find({ agency_id: id });
    }
    if (req.body.role == "agent") {
      agentsData = await admin_agent.find({ _id: id });
    }

    if (!agentsData)
      return res.status(HTTP.SUCCESS).send({
        status: false,
        code: HTTP.NOT_FOUND,
        message: "No Agents available!",
        data: {},
      });

    for (const data of agentsData) {
      formattedAgentsData.push({
        name: data.name,
        email: data.email,
        profileImg: data.profileImg,
        createdAt: data.createdAt,
        id: data._id,
      });
    }
    agentsData.sort((a, b) => (a.createdAt < b.createdAt) ? 1 : -1);

    return res.status(HTTP.SUCCESS).send({
      status: true,
      code: HTTP.SUCCESS,
      message: "Agents details.",
      data: agentsData,
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

//==================================================================== view all agents of agency user side ==========================================================================

async function viewAllAgentsOfAgency_U(req, res) {
  try {
    let formattedAgentsData = [];

    agency_id = req.body.id;

    const agentsData = await admin_agent.find({ agency_id });

    if (!agentsData)
      return res.status(HTTP.SUCCESS).send({
        status: false,
        code: HTTP.NOT_FOUND,
        message: "No Agents available!",
        data: {},
      });

    for (const data of agentsData) {
      formattedAgentsData.push({
        name: data.name,
        email: data.email,
        profileImg: data.profileImg,
        createdAt: data.createdAt,
        id: data._id,
      });
    }

    return res.status(HTTP.SUCCESS).send({
      status: true,
      code: HTTP.SUCCESS,
      message: "Agents details.",
      data: agentsData,
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

// ====================================================================== Viwe All Agent============================================================================================

async function viewAllAgents(req, res) {
  try {
    let formattedUserData = [];
    var key = req.params.key;
    // console.log("🚀 ~ viewAllAgents ~ key:", key)

    if (key == "undefined") {
      var usersData = await admin_agent.find({}).populate("agency_id");
      // console.log("🚀 ~ viewAllAgents ~ usersData:", usersData)
    } else {
      var usersData = await admin_agent
        .find({
          $or: [
            { name: { $regex: req.params.key, $options: "i" } },
            // { last_name: { $regex: req.params.key, $options: "i" } },
            { job_title: { $regex: req.params.key, $options: "i" } },
          ],
        })
        .populate("agency_id");
      // console.log("🚀 ~ viewAllAgents ~ usersData:", usersData)
    }

    if (usersData) {
      for (const data of usersData) {
        let propertyDetails = [];

        let average = 0;
        const properties = await property_listing
          .find({ lead_agent: data._id, status: "Sold" })
          .sort({ _id: -1 })
          .limit(4);

        for (const p of properties) {
          propertyDetails.push({
            _id: p._id,
            frontPageImg: p.frontPageImg,
          });
        }

        for (let i = 0; i < data.reviews.length; i++) {
          average += Number(data.reviews[i].star);
        }
        average /= data.reviews.length;

        formattedUserData.push({
          name: data.name,
          email: data.email,
          profileImg: data.profileImg,
          createdAt: data.createdAt,
          id: data._id,
          reviews: data.reviews,
          average,
          // agencySmallLogo: 'uploads/agency_image/commercialAgencySmallLogo-1680591891362.png',
          // agencyName: 'agency name',
          agencySmallLogo: data.agency_id.agencySmallLogo,
          agencyName: data.agency_id.principal_name,
          propertyDetails: propertyDetails,
          primary_color: data.agency_id.primary_color,
          secondary_color: data.agency_id.secondary_color,
          text_color: data.agency_id.text_color,
          medianPrice: data.medianPrice,
          property_sold: data.property_sold,
        });
      }
    } else {
      return res.status(HTTP.SUCCESS).send({
        status: false,
        code: HTTP.NOT_FOUND,
        message: "No Agents available!",
        data: {},
      });
    }

    // const suburb = '394326'
    // console.log("🚀 ~ viewAllAgents ~ suburb:", suburb)
    // const formattedUserData = await admin_agent.aggregate([
    // {
    //   $lookup: {
    //     from: "property_listings",
    //     localField: "_id",
    //     foreignField: "lead_agent",
    //     as: "properties"
    //   }
    // },
    // {

    //   $addFields: {
    //     totalSales: { $size: "properties" }
    //   }
    // },
    // {
    //   $match: {
    //     $and: [
    //       { suburb: suburb },
    //       { status: "Sold" }
    //     ]
    //   }
    // },
    // {

    //   $count: "propertiesSoldInSuburb"

    // },
    // {
    //   $addFields: {
    //     medianSoldPrice: { $avg: "$properties.price" },
    //     // propertiesOfAddress: { $count: "$properties" }
    //   }
    // },
    // {
    //   $project: {
    //     suburb: 1,
    //     medianSoldPrice: 1,
    //     propertiesOfAddress: 1
    //   }
    // }
    // ])
    // console.log("🚀 ~ viewAllAgents ~ formattedUserData:", formattedUserData)
    const totalSoldCount = await property_listing.find({ status: "Sold" });
    formattedUserData.sort((a, b) => (a.createdAt < b.createdAt) ? 1 : -1);
    return res.status(HTTP.SUCCESS).send({
      status: true,
      code: HTTP.SUCCESS,
      message: "Agents details.",
      data: formattedUserData,
      totalSoldCount: totalSoldCount,
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

//=========================================================  Sort By =======================================================================================================

async function sortBy(req, res) {
  try {
    const id = req.Data;

    const data = await property_listing.find({ agency_id: id });

    if (req.body.sort_by == "streetAsending") {
      const properties = await property_listing
        .find({ agency_id: id })
        .sort({ street_address_name: 1 });

      return res.status(HTTP.SUCCESS).send({
        status: true,
        code: HTTP.SUCCESS,
        message: "Properties",
        data: properties,
      });
    }
    if (req.body.sort_by == "streetDescending") {
      const properties = await property_listing
        .find({ agency_id: id })
        .sort({ street_address_name: -1 });

      return res.status(HTTP.SUCCESS).send({
        status: true,
        code: HTTP.SUCCESS,
        message: "Properties",
        data: properties,
      });
    }
    if (req.body.sort_by == "suburbAsending") {
      const properties = await property_listing
        .find({ agency_id: id })
        .sort({ suburb: 1 });

      return res.status(HTTP.SUCCESS).send({
        status: true,
        code: HTTP.SUCCESS,
        message: "Properties",
        data: properties,
      });
    }
    if (req.body.sort_by == "suburbDescending") {
      const properties = await property_listing
        .find({ agency_id: id })
        .sort({ suburb: -1 });

      return res.status(HTTP.SUCCESS).send({
        status: true,
        code: HTTP.SUCCESS,
        message: "Properties",
        data: properties,
      });
    }
    if (req.body.sort_by == "agentAsending") {
      const properties = await admin_agent.aggregate([
        {
          $lookup: {
            from: "property_listings",
            localField: "_id",
            foreignField: "lead_agent",
            as: "properties",
          },
        },
        {
          $sort: {
            name: 1,
          },
        },
        {
          $project: {
            properties: 1,
          },
        },
      ]);

      return res.status(HTTP.SUCCESS).send({
        status: true,
        code: HTTP.SUCCESS,
        message: "Properties",
        data: properties,
      });
    }

    //============================================================================================================================================================

    if (req.body.sort_by == "agentDescending") {
      const properties = await admin_agent.aggregate([
        { $match: { agency_id: id } },
        {
          $lookup: {
            from: "property_listings",
            localField: "_id",
            foreignField: "lead_agent",
            as: "properties",
          },
        },
        {
          $sort: {
            name: -1,
          },
        },
        {
          $project: {
            properties: 1,
          },
        },
      ]);

      return res.status(HTTP.SUCCESS).send({
        status: true,
        code: HTTP.SUCCESS,
        message: "Properties",
        data: properties,
      });
    }
    if (req.body.sort_by == "Listed (Oldest - Newest)") {
      const properties = await property_listing
        .find({ agency_id: id })
        .sort({ createdAt: 1 });

      return res.status(HTTP.SUCCESS).send({
        status: true,
        code: HTTP.SUCCESS,
        message: "Properties",
        data: properties,
      });
    }
    if (req.body.sort_by == "Listed (Newest - Oldest)") {
      const properties = await property_listing
        .find({ agency_id: id })
        .sort({ createdAt: -1 });

      return res.status(HTTP.SUCCESS).send({
        status: true,
        code: HTTP.SUCCESS,
        message: "Properties",
        data: properties,
      });
    }

    if (req.body.sort_by == "Sold Date (Oldest - Newest)") {
      const properties = await property_listing
        .find({ agency_id: id }, { status: Sold })
        .sort({ updatedAt: 1 });
      properties.length <= 0
        ? res.status(HTTP.SUCCESS).send({
          status: true,
          code: HTTP.SUCCESS,
          message: "No Properties Sold Yet.",
          data: properties,
        })
        : res.status(HTTP.SUCCESS).send({
          status: true,
          code: HTTP.SUCCESS,
          message: "Properties",
          data: properties,
        });
    }
    if (req.body.sort_by == "Sold Date (Newest - Oldest)") {
      const properties = await property_listing
        .find({ agency_id: id }, { status: Sold })
        .sort({ updatedAt: -1 });
      properties.length <= 0
        ? res.status(HTTP.SUCCESS).send({
          status: true,
          code: HTTP.SUCCESS,
          message: "No Properties Sold Yet.",
          data: properties,
        })
        : res.status(HTTP.SUCCESS).send({
          status: true,
          code: HTTP.SUCCESS,
          message: "Properties",
          data: properties,
        });
    }
    if (req.body.sort_by == "Sold Price (Low - High)") {
      const properties = await property_listing
        .find({ agency_id: id }, { status: Sold })
        .sort({ price: 1 });
      properties.length <= 0
        ? res.status(HTTP.SUCCESS).send({
          status: true,
          code: HTTP.SUCCESS,
          message: "No Properties Sold Yet.",
          data: properties,
        })
        : res.status(HTTP.SUCCESS).send({
          status: true,
          code: HTTP.SUCCESS,
          message: "Properties",
          data: properties,
        });
    }

    if (req.body.sort_by == "Sold Price (High - Low)") {
      const properties = await property_listing
        .find({ agency_id: id }, { status: Sold })
        .sort({ price: -1 });
      properties.length <= 0
        ? res.status(HTTP.SUCCESS).send({
          status: true,
          code: HTTP.SUCCESS,
          message: "No Properties Sold Yet.",
          data: properties,
        })
        : res.status(HTTP.SUCCESS).send({
          status: true,
          code: HTTP.SUCCESS,
          message: "Properties",
          data: properties,
        });
    }

    return res.status(HTTP.SUCCESS).send({
      status: true,
      code: HTTP.SUCCESS,
      message: "Property details.",
      data: {},
    });
  } catch (error) {
    console.log("🚀 ~ sortBy ~ error:", error);
    return res.status(HTTP.SUCCESS).send({
      status: false,
      code: HTTP.INTERNAL_SERVER_ERROR,
      message: "Something went wrong!",
      data: {},
    });
  }
}

//================================================================   sortBy Agent ============================================================================================

async function sortByAgent(req, res) {
  try {
    let ID = req.body.id;
    const sorting = await property_listing.find({ lead_agent: ID });
    console.log("🚀 ~ sortByAgent ~ sorting:", sorting);
    return res.status(HTTP.SUCCESS).send({
      status: true,
      code: HTTP.SUCCESS,
      message: "Properties By agent",
      data: sorting,
    });
  } catch (error) {
    console.log("🚀 ~ sortByAgent ~ error:", error);
    return res.status(HTTP.SUCCESS).send({
      status: false,
      code: HTTP.INTERNAL_SERVER_ERROR,
      message: "Something went wrong!",
      data: {},
    });
  }
}

//==============================================================  MAP  =============================================================================================

const geocode = async (location) => {
  const apiKey = "AIzaSyBF9EWb8h108q71fTe2wOw7ixi0id3PKA0";
  const languages = "en|es"; // Specify "en" for English, "es" for Spanish, or both separated by a pipe (|)
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
    location
  )}&language=${languages}&key=${apiKey}`;

  let lat, lng;

  try {
    const response = await axios.get(url);
    const results = response.data;
    lat = results.results[0].geometry.location.lat;
    lng = results.results[0].geometry.location.lng;
    console.log(`Lat: ${lat}, Lng: ${lng}`);
  } catch (error) {
    console.log(error);
  }

  const geoCode = {
    lat: lat,
    lng: lng,
  };

  console.log("Geocode:", geoCode);
  return geoCode;
};

async function mapsearch(req, res) {
  try {
    var ID = req.body.id;
    const data = await property_listing.findById({ _id: ID });
    const location =
      data.street_address_number +
      "," +
      data.street_address_name +
      "," +
      data.municipality +
      "," +
      data.suburb;
    const geoCodeData = await geocode(location);
    console.log("🚀 ~ mapsearch ~ geoCodeData:", geoCodeData);

    try {
      // const response = await axios.request(options);
      // console.log(response.data)
      return res.status(HTTP.SUCCESS).send({
        status: true,
        code: HTTP.SUCCESS,
        message: "Properties By agent",
        data: [geoCodeData],
      });
    } catch (error) {
      console.error(error);
    }
  } catch (error) {
    console.log("🚀 ~ mapsearch ~ error:", error);
    return res.status(HTTP.SUCCESS).send({
      status: false,
      code: HTTP.INTERNAL_SERVER_ERROR,
      message: "Something went wrong!",
      data: {},
    });
  }
}

// =====================================================  MAP Agent ===============================================================================================

// async function mapAgent(req, res) {
//   try {
//     const  agentId  = '642580e2d8518352e6866e53'
//     console.log("🚀 ~ mapAgent ~ agentId:", agentId)
//     const properties = await property_listing.find({ lead_agent: agentId }).exec();
//     // console.log("🚀 ~ mapAgent ~ properties:", properties)

//     const updatedProperties = await Promise.all(properties.map(async (property) => {
//       if (!property.latitude || !property.longitude) {
//         const address = property.street_address_number + "," + property.street_address_name + "," + property.suburb + "," + property.municipality
//         console.log("🚀 ~ updatedProperties ~ address:", address)
//         const response = await axios.get('@esri/arcgis-rest-geocoding', {
//           params: {
//             address,
//             apiKey: "AAPK6761830a440b49d1a6b71e7c30758007o68TwFDn1k66vCc7YDzZM-rAnUjCRnGBf_Ygz1FQCx1fzc4eE2peDdogXfPIZYbT",
//           },
//         });
//         console.log("🚀 ~ updatedProperties ~ response:--------------------------->>>>>>", response)
//         const { latitude, longitude } = response.data.results[0].geometry.location;
//         property.latitude = latitude;
//         property.longitude = longitude;
//         await property.save();
//       }
//       return property;
//     }));

//     res.json(updatedProperties);
//   } catch (error) {
//     console.error('Error fetching agent properties:', error);
//     res.status(500).json({ error: 'Internal Server Error' });
//   }
// }

async function mapAgent(req, res) {
  try {
    var ID = req.body.id;

    const properties = await property_listing.find({ lead_agent: { $in: ID } });

    // const updatedProperties = await Promise.all(properties.map(async (property) => {
    //   if (!property.location || !property.location) {
    //     const location = property.street_address_number + "," + property.street_address_name + "," + property.suburb + "," + property.municipality
    //     console.log("🚀 ~ updatedProperties ~ location:", location)
    //     const geoCodeData = await geocode(location)
    //     console.log("🚀 ~ updatedProperties ~ geoCodeData:", geoCodeData)

    //     arr.push(geoCodeData)
    //   }
    // }))

    return res.status(HTTP.SUCCESS).send({
      status: true,
      code: HTTP.SUCCESS,
      message: "Map location details.",
      data: properties,
    });
  } catch (error) {
    console.log("🚀 ~ mapsearch ~ error:", error);
    return res.status(HTTP.SUCCESS).send({
      status: false,
      code: HTTP.INTERNAL_SERVER_ERROR,
      message: "Something went wrong!",
      data: {},
    });
  }
}

async function vendorEmail(req, res) {
  try {
    const email = req.body.email;
    console.log("🚀 ~ vendorEmail ~ email:", email);

    // const updateData = await property_listing.findOne({ email })
    // if (!updateData) {
    //   return res.status(HTTP.SUCCESS).send({ "status": false, 'code': HTTP.BAD_REQUEST, "message": "Could not find vendor!", data: {} })
    // }
    const newOtp = "Congratulations! your property is live now on La-Rosa";
    // resend otp email template ===========================

    var sendMailData = {
      file_template: "./public/EmailTemplates/welcome.html",
      subject: "Congratulatiopn dear vendor Laro-sa",
      to: email ? email : null,
      // "username": `${checkVerified.firstname}`,0
      property: `${newOtp}`,
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
      message: "Email send to the vendor!",
      data: {},
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
//===========================================================================================================================================================================

module.exports = {
  // la_Rosa Admin --------------->
  //admin
  signin,
  forgotPassword,
  updatePassword,
  setNewPassword,

  // agency admin ---------------->
  agencySignup,
  agencySignin,
  agencyFpassword,
  agencySetpassword,

  // agency profile Manage ---------------->
  // AgencyProfileRagister,
  agencyViewProfile,
  agencyViewProfile_U,
  agencyUpdateProfile,
  viewAllAgency,
  agencyDelete,

  // Agency branding and images
  // Agency_Branding_img,
  // Agency_Branding_View,
  Agency_Branding_Update,

  // agent profile Manage --------------->

  agentregister,
  agentViewProfile,
  agentUpdateProfile,
  agentDelete,
  viewAllAgentsOfAgency,
  viewAllAgentsOfAgency_U,
  viewAllAgents,
  sortBy,
  sortByAgent,
  geocode,
  agentSetpassword,
  mapsearch,
  mapAgent,
  vendorEmail,
};
