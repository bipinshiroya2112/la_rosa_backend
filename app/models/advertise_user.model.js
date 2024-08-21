const mongoose = require("mongoose");

const advertiseUserSchema = new mongoose.Schema({
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
  },
  status: {
    type: String,
    isRequired: true
  }
}, {
  timestamps: true,
})
const AdvertiseUserModel = mongoose.model("advertise_user", advertiseUserSchema);

module.exports = AdvertiseUserModel