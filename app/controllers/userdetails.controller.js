const mongoose = require('mongoose');
const { genSaltSync, hashSync, compareSync } = require("bcrypt")
const userDetails = require('../models/userDetails.model')

var ObjectId = require('mongoose').Types.ObjectId;
const HTTP = require("../../constants/responseCode.constant");
const jwt = require('jsonwebtoken');
var randomstring = require("randomstring");
const cron = require('node-cron')
const Otp = require("../models/otp.model")

const { log } = require('handlebars');
// const serviceID = "VAa9bde626fdfd239ce5c9e37bce6bb8c2" 
// const accountsID = "ACb77b449b33b407fe76f4bd6b2d6f3dff"
// const authToken = "f8a9fa4eb1ca938e1e3cd545bcdc92eb"
// const client = require('twilio')(accountsID, authToken)
// async function userData(req, res) {
//     try {
//         let { email, firstname, lastname, phoneNumber } = req.body
//         // console.log(req.body, " ---- signup ---- req.body");

//         if (!email || !firstname || !lastname || !phoneNumber ) {
//             return res.status(HTTP.SUCCESS).send({ "status": false, 'code': HTTP.NOT_FOUND, "message": "All fields are required!", data: {} })
//         }

//         if (!email.includes('@')) {
//             return res.status(HTTP.SUCCESS).send({ "status": false, 'code': HTTP.BAD_REQUEST, "message": "Email is invalid!", data: {} })
//         }


//         // check user + verified
//         const userValid = await userDetails.findOne({ $and: [{ email: email }, { isVerified: false }] })
//         if (userValid) return res.status(HTTP.SUCCESS).send({ "status": false, 'code': HTTP.BAD_REQUEST, "message": "User not verified. Please complete OTP Verification. ", data: {}, page: "verifyOtp" })

//         const userExists = await userDetails.findOne({ $or: [{ email: email }, { phoneNumber }] })
//         if (userExists) return res.status(HTTP.SUCCESS).send({ "status": false, 'code': HTTP.BAD_REQUEST, "message": "User Exists. Please Sign In.", data: {}, page: "signin" })

//         let otpCheck = ""
//         if (phoneNumber) {
//             console.log("🚀 ~ in if ~ phoneNumber", phoneNumber)

//            await client
//             .verify
//             .services(serviceID)
//             .verifications
//             .create({
//                 to: `+${phoneNumber}`,
//                 channel: 'sms' 
//             })
//             .then(data => {
//                 console.log("🚀 ~ twiliooooooooooooooooooooo signup ~ data.status ~ ", data.status)
//                 otpCheck = data.status
//                 console.log("🚀 ~ file: user.controller.js:80 ~ signup ~ otpCheck", otpCheck)
//                 // return res.status(200).send({ message: "Verification is sent!!", phonenumber: phoneNumber, data })
//             }) 
//          } else {

//             return res.status(HTTP.SUCCESS).send({ "status": false, 'code': HTTP.BAD_REQUEST, "message": "Unable to send OTP!", data: {} })
//          }

//         const userData = await new userDetails({ email, firstname, lastname, phoneNumber, otpCheck }).save()
//         if (!userData)  return res.status(HTTP.SUCCESS).send({ "status": false, 'code': HTTP.BAD_REQUEST, "message": "Unable to register user!", data: {} })


//         // userData.decryptFieldsSync({ __secret__: process.env.DATABASE_ACCESS_KEY });

//         return res.status(HTTP.SUCCESS).send({ "status": true, 'code': HTTP.SUCCESS, "message": "User Registered! Please enter the OTP to verify." })

//     } catch (e) {
//         console.log(e)
//         return res.status(HTTP.SUCCESS).send({ "status": false, 'code': HTTP.INTERNAL_SERVER_ERROR, "message": "Something went wrong!", data: {} })
//     }
// }
// async function verifyOtp(req, res) {
//     try {

//         const { phoneNumber, otp } = req.body
//         console.log(req.body.phoneNumber, "---------req.body.phoneNumber");

//         // check if phoneNumber is valid
//         const checkNumber = await userDetails.findOne({ phoneNumber }) 
//         if(!checkNumber) return res.status(HTTP.SUCCESS).send({ "status": false, 'code': HTTP.BAD_REQUEST, "message": "Invalid Phone Number.", data: {} })

//         if (phoneNumber && otp.length === 6) {
//            await client
//                 .verify
//                 .services(serviceID)
//                 .verificationChecks
//                 .create({
//                     to: `+${phoneNumber}`,
//                     code: otp
//                 })

//                 .then(async data => {
//                     if (data.status === "approved") {
//                         console.log("🚀 ~ file: user.controller.js:111 ~ verifyOtp ~ data.status", data.status)

//                         checkNumber.isVerified = true
//                         checkNumber.otpCheck = data.status
//                         checkNumber.save()

//                         //genrate JWT token and store session data
//                         const token = await createSessionAndJwtToken(checkNumber)

//                          return res.status(HTTP.SUCCESS).send({ "status": true, 'code': HTTP.SUCCESS, "message": "Otp Verified.", "data": { token: "Bearer " + token } })

//                     }
//                     return res.status(HTTP.SUCCESS).send({ "status": false, 'code': HTTP.BAD_REQUEST, "message": "Invalid OTP", "data": {} })

//                 }).catch((err) => {

//                     console.log("🚀 ~ verifyOtp ~ err", err)
//                     return res.status(HTTP.SUCCESS).send({ "status": false, 'code': HTTP.BAD_REQUEST, "message": "Something went wrong. Please try Resend Otp.", "data": {} })

//                 })
//         } else {

//             return res.status(HTTP.SUCCESS).send({ "status": false, 'code': HTTP.BAD_REQUEST, "message": "Invalid OTP", "data": {} })

//         }


//     } catch (e) {
//         console.log(e)
//         return res.status(HTTP.SUCCESS).send({ "status": false, 'code': HTTP.INTERNAL_SERVER_ERROR, "message": "Something went wrong!", data: {} })
//     }
// }

// resend otp
// async function resendOtp(req, res) {
//     try {

//         const { phoneNumber } = req.body
//         console.log("🚀 ~ file: user.controller.js:387 ~ resendOtp ~ req.body", req.body)

//         // check if already verified
//         // const checkVerified = await userDetails.findOne({ phoneNumber })
//         // if (!checkVerified) return res.status(HTTP.SUCCESS).send({ "status": false, 'code': HTTP.BAD_REQUEST, "message": "Unable to find User!", data: {} })

//         // if (checkVerified.isVerified) return res.status(HTTP.SUCCESS).send({ "status": false, 'code': HTTP.BAD_REQUEST, "message": "User is already verified!", data: {} })

//         if (phoneNumber) {
//             console.log("🚀 ~ in if ~ phoneNumber", phoneNumber)

//            await client
//             .verify
//             .services(serviceID)
//             .verifications
//             .create({
//                 to: `+${phoneNumber}`,
//                 channel: 'sms' 
//             })
//             .then(data => {

//                 console.log("🚀 ~ twiliooooooooooooooooooooo resendOtp ~ data.status ~ ", data.status)
//                 checkVerified.otpCheck = data.status
//                 checkVerified.save()

//                 return res.status(HTTP.SUCCESS).send({ "status": true, 'code': HTTP.SUCCESS, "message": "OTP Resent.", data: {} })

//             }) 
//          } else {

//             return res.status(HTTP.SUCCESS).send({ "status": false, 'code': HTTP.BAD_REQUEST, "message": "Unable to send OTP!", data: {} })

//          }

//     } catch (e) {
//         console.log(e)
//         return res.status(HTTP.SUCCESS).send({ "status": false, 'code': HTTP.INTERNAL_SERVER_ERROR, "message": "Something went wrong!", data: {} })
//     }
// }

async function searchUser(req, res) {

    console.log(req.params.key);
    let search = await userDetails.find({
        "$or": [
            { "firstname": { $regex: req.params.key } },
            { "lastname": { $regex: req.params.key } },
            { "email": { $regex: req.params.key } }
        ]

    })
    res.send(search)
}


module.exports = {

    // userData,
    // verifyOtp,
    // resendOtp,
    searchUser
}
