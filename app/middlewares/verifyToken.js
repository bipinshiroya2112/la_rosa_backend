const jwt = require("jsonwebtoken");
const HTTP = require("../../constants/responseCode.constant");
const User = require("../models/user.model");
const passport = require("passport");
const UserSession = require("../models/userSession.model");


var ObjectId = require("mongoose").Types.ObjectId;

const http = require("http");
const { json } = require("body-parser");
const { log } = require("console");
const Register = require("../models/register");

function verifyToken(req, res, next) {
  let token = req.cookies.jwttoken; //get cookie from request

  if (token) {
    jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
      if (err) {
        return res.status(HTTP.SUCCESS).send({
          success: false,
          code: HTTP.UNAUTHORIZED,
          message: "invalid token",
          data: {},
        });
      } else {

        const { sessionId } = decoded.result;

        if (!sessionId || !ObjectId.isValid(sessionId)) {
          return res.status(HTTP.SUCCESS).send({
            status: false,
            code: HTTP.NOT_ALLOWED,
            message: "Invalid session!",
            data: {},
          });
        }

        const result = await Register.findById(id);
        if (!result) {
          return res.status(HTTP.SUCCESS).send({
            status: false,
            code: HTTP.BAD_REQUEST,
            message: "Please Authenticate yourself!!",
            data: {},
          });
        }

        const userSession = await UserSession.findOne({
          _id: sessionId,
          userid: decoded.result.id,
          isActive: true,
        });
        // const userSession = await UserSession.findOne({ _id: sessionId })
        console.log(userSession);
        if (!userSession) {
          return res.status(HTTP.SUCCESS).send({
            status: false,
            code: HTTP.BAD_REQUEST,
            message: "User session is expired!",
            data: {},
          });
        }

        decoded.result.username = result.username;
        decoded.result.email = result.email;

        req.user = decoded;
        req.user.sessionId = sessionId;
        // To Write a Cookie
        // res.writeHead(200, {
        //     "Set-Cookie": `mycookie=test`,
        //     "Content-Type": `text/plain`
        // });
        next();
      }
    });
  } else {
    return res.status(HTTP.SUCCESS).send({
      success: false,
      code: HTTP.UNAUTHORIZED,
      message: "Access Denied! Unauthorized User",
      data: {},
    });
  }
}

function verifyResetPasswordToken(req, res, next) {
  let token = req.cookies.jwttoken;
  if (token) {
    jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
      if (err) {
        return res.status(HTTP.SUCCESS).send({
          success: false,
          code: HTTP.UNAUTHORIZED,
          message: "invalid token",
          data: {},
        });
      } else {
        const result = await User.findById(id);
        if (!result) {
          return res.status(HTTP.SUCCESS).send({
            status: false,
            code: HTTP.BAD_REQUEST,
            message: "Please Uthenticate yourself!!",
            data: {},
          });
        }
        next();
      }
    });
  } else {
    return res.status(HTTP.SUCCESS).send({
      success: false,
      code: HTTP.UNAUTHORIZED,
      message: "Access Denied! Unauthorized User",
      data: {},
    });
  }
}

//user authorization
function authUser(req, res, next) {
  passport.authenticate("jwt", { session: false }, async function (err, userData, info, status) {
    try {
      if (err) {
        console.log(err);
        return next(err);
      }

      // console.log("🚀 ~ authUser ~ userData", userData)
      const { user, sessionId } = userData;
      // console.log("=================sessionID", sessionId);
      // console.log("=================user", user);

      if (!user || user.role != "user") {
        return res.status(HTTP.SUCCESS).send({
          status: false,
          code: HTTP.UNAUTHORIZED,
          message: "Access denied. Please log in to continue.",
          data: {},
        });
      }

      if (!sessionId || !ObjectId.isValid(sessionId)) {
        return res.status(HTTP.SUCCESS).send({
          status: false,
          code: HTTP.NOT_ALLOWED,
          message: "Invalid session!",
          data: {},
        });
      }

      const userSession = await UserSession.findOne({
        _id: sessionId,
        userid: user._id,
        isActive: true,
      });
      // console.log("🚀 ~ isActive:", user.isActive)
      console.log("🚀 ~ userid:", user._id)
      if (!userSession) {
        return res.status(HTTP.SUCCESS).send({
          status: false,
          code: HTTP.BAD_REQUEST,
          message: "User session is expired!",
          data: {},
        });
      }

      req.user = user;
      req.user.sessionId = sessionId;
      return next();
    } catch (e) {
      console.log("error from user middleware", e);
      return next();
    }
  }
  )(req, res, next);
}
//===========================================================================================================================================================================

function authagency(req, res, next) {

  const decodedToken = jwt.decode(req.headers.authorization, { complete: true });

  if (!decodedToken) {
    console.log("error from authagency");
  }
  req.Data = decodedToken?.payload.id;

  return next();
}

//==============================================================================================================================================================================


function auth(req, res, next) {

  bearer = req.headers.authorization.slice(7);

  const decodedToken = jwt.verify(bearer, process.env.JWT_SECRET, { complete: true });

  if (!decodedToken) {
    console.log("error from authagency");
  }
  req.Data = decodedToken?.payload.id;

  return next();
}
//==============================================================================================================================================================================

function authadmin(req, res, next) {

  passport.authenticate('jwt', { session: false }, async function (err, userData) {

    try {
      if (err || userData === false) {
        return res.send({
          "message": "invalid token."
        })
      }
      req.user = userData
      return next()
    }
    catch {
      console.log("something went wrong");
    }
  })(req, res, next)
}



module.exports = {
  verifyToken,
  verifyResetPasswordToken,
  authUser,
  authagency,
  authadmin,
  auth
};
