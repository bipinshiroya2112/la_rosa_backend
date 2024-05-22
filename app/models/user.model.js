// var mongoose = require('mongoose')
// const { Schema, model } = require("mongoose");
// const validator = require("validator");
// var SchemaTypes = mongoose.Schema.Types;
// const mongooseFieldEncryption = require("mongoose-field-encryption").fieldEncryption;

// const userSchema = new Schema({
   
//     email: {
//         type: String,
//         required: true,
//         unique: true,
//         trim: true,
//         lowercase: true,
//     },
    
//     password: {
//         type: String,
//         required: [true, "Required"],
//         trim: true,
//     },
//     // confirmPassword: {
//     //     type: String,
//     //     trim: true,
// // }
//     firstname: {
//         type: String,
        
//     },
//     lastname: {
//         type: String,
       
//     },

//     phoneNumber: {
//         type: Number,
//         trim: true
//     },
 
//     // otpCheck: {
//     //     type: String,
      
//     // },
//     // otpPassword: {
//     //     type: String,
//     // },
  
//     status: {
//         type: Boolean,
//         default: true
//     },
//     role: {
//         type: String,
//         default: 'user',
//         trim: true
//     },
//     token: {
//         type: String,
//         default: '',
//     },
//     isVerified: {
//         type: Boolean,
//         required: [true, "Required"],
//         default: false,
//     }
// }, { timestamps: true, versionKey: false })

// module.exports = mongoose.model('User', userSchema)