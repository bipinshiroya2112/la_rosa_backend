const mongoose = require("mongoose");

const advertiseSchema = new mongoose.Schema({
  phoneNumber: {
    type: Number,
    isRequired: true
  },
  fullName: {
    type: String,
    isRequired: true
  },
  email: {
    type: String,
    isRequired: true
  },
  companyName: {
    type: String,
    isRequired: true
  },
  advertiseType: {
    type: String,
    isRequired: true
  }
}, {
  timestamps: true,
})
const AdvertiseModel = mongoose.model("Advertise", advertiseSchema);

module.exports = AdvertiseModel