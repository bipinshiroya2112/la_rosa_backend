const mongoose = require('mongoose')
const Schema = mongoose.Schema
const validator = require("validator");

const inspection = new Schema({
    date: {
        type: String,
        required : true
    },
    startTime: {
        type: String,
        required : true
       
    },  
    endTime: {
        type: String,
        required : true       
        
    },
    
}, { timestamps: true, versionKey: false })

module.exports = mongoose.model('inspection', inspection)
