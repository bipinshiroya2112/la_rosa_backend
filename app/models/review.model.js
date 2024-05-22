var mongoose = require('mongoose')
const { Schema, model } = require("mongoose");
const validator = require("validator");


const agentReview = new Schema(
  {
    agency_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref : "registers"
    },
    star: {
      type: Number,
      required: true,
    },
    review: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      required: true,
      trim: true,
    },
    address: {
      type: String,
    },
    firstname: {
      type: String,
      // required: true
    },
    lastname: {
      type: String,
      // required: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    phoneNumber: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true, versionKey: false }
);
module.exports = mongoose.model('agentReview', agentReview)