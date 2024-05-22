var mongoose = require('mongoose')
const { Schema, model } = require("mongoose");
const validator = require("validator");



const userDetails = new Schema({
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
        type: Number,
        trim: true
    },
    isVerified: {
        type: Boolean,
        required: [true, "Required"],
        default: false,
    },
    status: {
        type: Boolean,
        default: true
    },
    role: {
        type: String,
        default: 'user',
        trim: true
    },
    

}, { timestamps: true, versionKey: false })
module.exports = mongoose.model('userDetails', userDetails)
