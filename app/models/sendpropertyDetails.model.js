var mongoose = require('mongoose')
const { Schema, model } = require("mongoose");
const validator = require("validator");

  
const propertydetails = new Schema({
    timeframe: {
        type: String,
         // required : true   
    },
    reason: {
        type: String,
        // required: true,
    },
    address: {
        type: String,
        // required: true
    },
    type: {
        type: String,
        // required: true,
        // trim: true,
    },
    first_name: {
        type: String,
        // required: true,
    },
    last_name: {
        type: String,
        // required: true,
    },
    mobile_no: {
        type: String,
        // required: true,
    },
    email: {
        type: String,
        // required: true,
        unique: true,
        trim: true,
        lowercase: true,
    },
    prefer_to_be_contacted: {
        type: String,
        // required: true,
    },
    priceRange: {
        min: {
            type: Number,
            // require : true,
        },
        max: {
            type: Number,
            // require : true,
        }
    },
    remember_details: {
        type: Boolean,
        default : false
    },
    agent_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref : "agents"
    },
    agency_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "registers"
    },

    // isVerified: {
    //     type: Boolean,
    //     required: [true, "Required"],
    //     default: false,
    // },
    // status: {
    //     type: Boolean,
    //     default: true
    // },
    // role: {
    //     type: String,
    //     default: 'property',
    //     trim: true
    // },
    

}, { timestamps: true, versionKey: false })
module.exports = mongoose.model('sendPropertydetails', propertydetails)
