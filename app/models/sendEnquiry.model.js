var mongoose = require('mongoose')
const { Schema, model } = require("mongoose");
const validator = require("validator")


const sendEnquiry = new Schema(
  {
    agent_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "agent",
    },
    agency_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "registers"
    },
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Register",
    },
    message: {
      type: String,
      require: true,
    },
    email: {
      type: String,
      // require: true,
    },
    name: {
      type: String,
      // required: true
    },
    first_name: {
      type: String,
      // required: true
    },
    last_name: {
      type: String,
      // required: true
    },
    address: {
      type: String,
      // required: true
    },
    prefer_to_be_contacted: {
      type: String,
      // required: true,      

    },
    mobile_no: {
      type: Number,
      trim: true,
    },
    isVerified: {
      type: Boolean,
      required: [true, "Required"],
      default: false,
    },
    status: {
      type: Boolean,
      default: true,
    },
    role: {
      type: String,
      default: "user",
      trim: true,
    },
  },
  { timestamps: true, versionKey: false }
);
module.exports = mongoose.model('sendEnquiry', sendEnquiry) 
