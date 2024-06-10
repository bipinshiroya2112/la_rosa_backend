var JwtStrategy = require('passport-jwt').Strategy,
  ExtractJwt = require('passport-jwt').ExtractJwt;
var opts = {}
const Register = require("../app/models/register");
const mongoose = require("mongoose");
const passport = require("passport");
require('dotenv').config();
// const User = require("../app/models/user.model");

opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = process.env.JWT_SECRET;

passport.use(
  new JwtStrategy(opts, async function (jwt_payload, done) {
    try {
      console.log("-------------passport------------");
      console.log(jwt_payload.id, "------jwt_payload.id------");
      console.log(jwt_payload.sessionId, "------jwt_payload.sessionId------");

      const user = await Register.findOne({ _id: jwt_payload.id });

      if (user) {
        const userData = { user, sessionId: jwt_payload.sessionId };
        if (userData.sessionId === "" || userData.sessionId === "undefined") {
          return done(null, user);
        }
        return done(null, userData);
      } else {
        return done(null, false);
      }
    } catch (err) {
      return done(err, false);
    }
  })
);

