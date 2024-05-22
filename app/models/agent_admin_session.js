const mongoose = require('mongoose')
const Schema = mongoose.Schema

const userSessionSchema = new Schema({
    userid: {
        type: mongoose.Schema.Types.ObjectId,
        required: [true, "agency id is required"],
        ref: 'agency'
    },
    isActive: {
        type: Boolean,
        required: [true, "Session status is required"],
    },
    expAt: {
        type: Number,
        required: [true, "Session expire time is required"],
    }
}, { timestamps: true, versionKey: false })

module.exports = mongoose.model('UserSession', userSessionSchema)