const mongoose = require('mongoose')
const Schema = mongoose.Schema

const otpSchema = new Schema({
    number: {
        type: Number,
            required : true
    },
    otp: {
        type: String,
        required : true
    },
    
}, { timestamps: true, versionKey: false })

module.exports = mongoose.model('OTP', otpSchema)
