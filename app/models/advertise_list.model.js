const mongoose = require("mongoose");

const advertiseListSchema = new mongoose.Schema({
  advertiseType: {
    type: String,
    isRequired: true
  },
  title: {
    type: String,
    isRequired: true
  },
  city: {
    type: Array,
    isRequired: true
  },
  description: {
    type: String,
    isRequired: true
  },
  link: {
    type: String,
    isRequired: true
  },
  companyLogoImage: {
    type: String,
    isRequired: true
  },
  advertiseImage: {
    type: String,
    isRequired: true
  },
  addedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "register"
  },
  status: {
    type: Boolean,
    default: false
  },
  approved_status: {
    type: String,
    default: 'Waiting for approval'
  }
}, {
  timestamps: true,
})

const AdvertiseListModel = mongoose.model("advertise_list", advertiseListSchema);

module.exports = AdvertiseListModel