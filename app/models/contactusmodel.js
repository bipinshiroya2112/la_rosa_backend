const { default: mongoose } = require("mongoose");

const contact_us = new mongoose.Schema({
    name: {
        type: String,
    },
    email: {
        type: String,
    },
    message: {
        type: String,
    }
})
const contact = mongoose.model("ContactUs", contact_us);

module.exports = contact