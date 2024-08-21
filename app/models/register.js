const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const adminSchema = new Schema(
  {
    facebookUserId: {
      type: String,
    },
    email: {
      type: String,
    },
    password: {
      type: String,
    },
    role: {
      type: String,
    },
    street: {
      type: String,
    },
    suburb_area: {
      type: String,
    },
    postcode: {
      type: Number,
    },
    state_region: {
      type: String,
    },
    country: {
      type: String,
    },
    mailing_address_street: {
      type: String,
    },
    mailing_address_suburb_area: {
      type: String,
    },
    mailing_address_postcode: {
      type: Number,
    },
    mailing_address_state_region: {
      type: String,
    },
    mailing_address_country: {
      type: String,
    },
    fax: {
      type: String,
    },
    phone: {
      type: Number,
    },
    email: {
      type: String,
    },
    web: {
      type: String,
    },
    facebook_page: {
      type: String,
    },
    twitter_profile_url: {
      type: String,
    },
    principal_name: {
      type: String,
    },
    display_email: {
      type: String,
    },
    office_description: {
      type: String,
    },
    agencySmallLogo: {
      type: String,
    },
    agencyMediumLogo: {
      type: String,
    },
    agencyLargeLogo: {
      type: String,
    },
    commercialAgencySmallLogo: {
      type: String,
    },
    commercialAgencyMediumLogo: {
      type: String,
    },
    commercialAgencyLargeLogo: {
      type: String,
    },
    commercialAgencyExtraLargeLogo: {
      type: String,
    },
    heroImg: {
      type: String,
    },
    primary_color: {
      type: String,
    },
    secondary_color: {
      type: String,
    },
    text_color: {
      type: String,
    },
    firstname: {
      type: String,
    },
    lastname: {
      type: String,
    },
    SaveSearch: {
      type: [Object],
    },
    phoneNumber: {
      type: Number,
      trim: true,
    },
    wishlist: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "property_listing",
      },
    ],
    publish: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    otpCheck: {
      type: Number,
      default: 0,
    },
    status: {
      type: Boolean,
      default: true,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    SaveSearch: {
      type: String,
    },
    advertiseIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "advertise_list",
      },
    ],
  },
  { timestamps: true, versionKey: false }
);

const Register = mongoose.model("Register", adminSchema);
module.exports = Register;
