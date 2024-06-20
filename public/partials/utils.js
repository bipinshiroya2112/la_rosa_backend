const { users } = require("../../app/models/user.model");
const Register = require("../../app/models/register");

const UserSession = require("../../app/models/userSession.model");
const { sign } = require("jsonwebtoken");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");

const handlebars = require("handlebars");
const fs = require("fs");
const { log } = require("handlebars");

//Formate user data
async function formateUserData(user) {
  user = user.toObject();
  delete user.email;
  delete user._id;
  delete user.otpCheck;
  delete user.username;
  delete user.firstname;
  delete user.lastname;
  delete user.password;
  delete user.updatedAt;
  delete user.createdAt;
  return user;
}

//genrate JWT token store user session
async function createSessionAndJwtToken(user) {
  try {
    const expAt = new Date().getTime() / 1000 + 86400;
    // let token = ""

    const userSession = await new UserSession({
      userid: user._id,
      isActive: true,
      expAt: expAt.toFixed(),
    }).save();
    console.log("🚀 ~ createSessionAndJwtToken ~ userSession:", userSession);

    if (!userSession) {
      throw "Unable to store user session.";
    }
    // let payload = { result: { id: user._id, sessionId: userSession._id } }
    // token = sign(payload, process.env.JWT_SECRET, { expiresIn: "24h" });

    // sign the JWT token
    // const payload = { email: user.email, id: user._id, sessionId: userSession._id }
    // const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "Id" })

    console.log(
      "---------------create session and jwt token----------------------"
    );
    // console.log("email :", user.email, "id :", user._id, "sessionId :" , userSession._id);

    //sign the JWT token
    const payload = {
      email: user.email,
      id: user._id,
      sessionId: userSession._id,
      role: user.role,
    };
    console.log(
      "🚀 ~ createSessionAndJwtToken ~ payload.sessionId:",
      payload.sessionId
    );

    // const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1d" })
    const token = jwt.sign(payload, process.env.JWT_SECRET);
    console.log("token : ", token);

    return token;
  } catch (e) {
    console.log(e);
    throw "Unable to create session or genrate JWT token";
  }
}
//================================  create token for agency ============================================

//Expire session
async function checkSessionExpiration() {
  try {
    setInterval(async () => {
      UserSession.updateMany(
        {
          isActive: true,
          $and: [
            { expAt: { $ne: 0 } },
            { expAt: { $lte: new Date().getTime() / 1000 } },
          ],
        },
        { $set: { isActive: false } }
      );
    }, 1000);
  } catch (err) {
    console.log(err);
  }
}

// send welcome email template
// const sendEmail = (sendData) => {
//     try {

//         return new Promise(async resolve => {
//             var file_template = sendData.file_template
//             var subject = sendData.subject

//             let transporter = nodemailer.createTransport({
//                 host: "mail.privateemail.com",
//                 port: 465,
//                 secure: true,
//                 auth: {
//                     user: "hello@GFTRcoin.io",
//                     pass: "GFTR009$"
//                 }

//             });

//             fs.readFile(file_template, { encoding: 'utf-8' }, function (err, html) {
//                 var template = handlebars.compile(html);
//                 var htmlToSend = template(sendData);

//                 var mailOptions = {
//                     from: "hello@GFTRcoin.io",
//                     to: sendData.to,
//                     subject: subject,
//                     html: htmlToSend
//                 };

//                 transporter.sendMail(mailOptions, (error, info) => {
//                     if (error) {
//                         console.log("error" + error)
//                         return ({ status: false, data: [], message: 'Could not send mail!' });
//                     }

//                     console.log("info " + info)
//                     console.log('Message sent: %s', info.messageId);
//                     console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
//                     return ({ status: true, data: [], message: 'mail sent!.' });
//                 });

//             });

//         })

//     } catch (e) {
//         console.log(e)
//         return res.status(HTTP.SUCCESS).send({ "status": false, 'code': HTTP.INTERNAL_SERVER_ERROR, "message": "Unable to send email!", data: {} })
//     }
// }

// otp email

const sendEmailOTP = (sendData) => {
  return new Promise(async (resolve, reject) => {
    try {
      var file_template = sendData.file_template;
      var subject = sendData.subject;
      console.log("subject", subject);

      let transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 465,
        secure: true,
        auth: {
          user: "info@myrealestate-ng.com",
          pass: "4EDVB%^H&g*GJ*",
        },
        tls: { rejectUnauthorized: false }
      });

      fs.readFile(file_template, { encoding: "utf-8" }, function (err, html) {
        if (err) {
          console.log("File read error: " + err);
          return reject({ status: false, data: [], message: "Could not read email template file!" });
        }

        var template = handlebars.compile(html);
        var htmlToSend = template(sendData);

        var mailOptions = {
          from: "info@myrealestate-ng.com",
          to: sendData.to,
          subject: subject,
          html: htmlToSend,
        };

        transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
            console.log("error" + error);
            return { status: false, data: [], message: "Could not send mail!" };
          }
          console.log("info " + info);
          console.log("Message sent: %s", info.messageId);
          console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
          resolve({ status: true, data: [], message: "Mail sent!" });
        });
      });
    } catch (err) {
      console.log(err);
    }
  });
};

// sendForgotPasswordLink
// const sendForgotPasswordLink = (sendData) => {
//   try {
//     return new Promise(async (resolve) => {
//       var file_template = sendData.file_template;
//       var subject = sendData.subject;
//       console.log("subject", subject);

//       let transporter = nodemailer.createTransport({
//         host: "smtp.gmail.com",
//         port: 465,
//         secure: true,
//         // tls : { rejectUnauthorized: false },
//         auth: {
//           user: "tanthetaauser@gmail.com",
//           pass: "ydsioiddnnfvcclm",
//         },
//         // === add this === //
//         // tls : { rejectUnauthorized: false }
//       });

//       fs.readFile(file_template, { encoding: "utf-8" }, function (err, html) {
//         var template = handlebars.compile(html);
//         var htmlToSend = template(sendData);

//         var mailOptions = {
//           from: "tanthetaauser@gmail.com",
//           to: sendData.to,
//           subject: subject,
//           html: htmlToSend,
//         };

//         transporter.sendMail(mailOptions, (error, info) => {
//           if (error) {
//             console.log("error" + error);
//             return { status: false, data: [], message: "Could not send mail!" };
//           }

//           console.log("info " + info);
//           console.log("Message sent: %s", info.messageId);
//           console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
//           return { status: true, data: [], message: "mail sent!." };
//         });
//       });
//     });
//   } catch (e) {
//     console.log(e);
//     return res
//       .status(HTTP.SUCCESS)
//       .send({
//         status: false,
//         code: HTTP.INTERNAL_SERVER_ERROR,
//         message: "Unable to send email!",
//         data: {},
//       });
//   }
// };

const sendForgotPasswordLink = (sendData) => {
  return new Promise(async (resolve, reject) => {
    try {
      var file_template = sendData.file_template;
      var subject = sendData.subject;
      console.log("subject:--------------", subject);

      fs.readFile(file_template, { encoding: "utf-8" }, function (err, html) {
        if (err) {
          console.error("Error reading file:", err);
          reject(err); // Reject the promise if there's an error
          return;
        }

        var template = handlebars.compile(html);
        var htmlToSend = template(sendData);

        let transporter = nodemailer.createTransport({
          host: "smtp.gmail.com",
          port: 465,
          secure: true,
          auth: {
            user: "tanthetaauser@gmail.com",
            pass: "ydsioiddnnfvcclm",
          },
        });

        var mailOptions = {
          from: "info@myrealestate-ng.com",
          to: sendData.to,
          subject: subject,
          html: htmlToSend,
        };
        console.log("test3");

        transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
            console.error("Error sending email:", error);
            reject(error); // Reject the promise if there's an error
            return;
          }

          console.log("Message sent: %s", info.messageId);
          console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
          resolve({ status: true, data: [], message: "mail sent!." }); // Resolve the promise if email is sent successfully
        });
      });
    } catch (e) {
      console.error("Error:", e);
      reject(e); // Reject the promise if there's an error
    }
  });
};

const sendContactusemail = (sendData) => {
  try {
    return new Promise(async (resolve) => {
      var file_template = sendData.file_template;
      var subject = sendData.subject;

      let transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 465,
        secure: true,
        tls: { rejectUnauthorized: false },
        auth: {
          user: "tanthetaauser@gmail.com",
          pass: "ydsioiddnnfvcclm",
        },
        // === add this === //
        // tls : { rejectUnauthorized: false }
      });

      fs.readFile(file_template, { encoding: "utf-8" }, function (err, html) {
        var template = handlebars.compile(html);
        var htmlToSend = template(sendData);

        var mailOptions = {
          from: "tanthetaauser@gmail.com",
          to: "info@myrealestate-ng.com",
          subject: "contact us email",
          html: htmlToSend,
        };

        transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
            console.log("error" + error);
            return { status: false, data: [], message: "Could not send mail!" };
          }

          console.log("info " + info);
          console.log("Message sent: %s", info.messageId);
          console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
          return { status: true, data: [], message: "mail sent!." };
        });
      });
    });
  } catch (err) {
    console.log(err);
  }
};
module.exports = {
  formateUserData,
  checkSessionExpiration,
  createSessionAndJwtToken,
  // sendEmail,
  sendForgotPasswordLink,
  sendEmailOTP,
  sendContactusemail,
};
