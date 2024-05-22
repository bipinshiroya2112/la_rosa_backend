const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const adminSchema = new Schema(
  {
    agency_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Register",
    },
    job_title: {
      type: String,
    },
    email: {
      type: String,
    },
    confirm_email: {
      type: String,
    },
    password: {
      type: String,
    },
    mobile_number: {
      type: Number,
    },
    business_number: {
      type: Number,
    },
    profileImg: {
      type: String,
    },
    first_name: {
      type: String,
    },
    last_name: {
      type: String,
    },
    name: {
      type: String,
    },
    // start_year_in_industry: {
    //   type: Number,
    // },
    // license_number: {
    //   type: Number,
    // },
    about_me: {
      type: String,
    },
    taglines: {
      type: String,
    },
    awards: {
      type: String,
    },
    specialties: {
      type: String,
    },
    community_involvement: {
      type: String,
    },
    coverProfileImg: {
      type: String,
    },
    video_title: {
      type: String,
    },
    video_URL: {
      type: String,
    },
    twitter_profile_URL: {
      type: String,
    },
    facebook_profile_URL: {
      type: String,
    },
    linkedIn_profile_URL: {
      type: String,
    },
    role: {
      type: String,
    },
    property_sold: {
      type: Number,
      default: 0
    },
    medianPrice: {
      type: Number,
      default: 0,
    },
    agentReview: {
      type: Number,
      default: 0
    },
    weakly_update: {
      type: Boolean,
    },
    residential_sales: {
      type: Boolean,
    },
    residential_property_management: {
      type: Boolean,
    },
    reviews: [
      {
        star: {
          type: String,
          default: null,
        },
        type: {
          type: String,
          default: null,
        },
        review: {
          type: String,
          default: null,
        },
        client_address: {
          type: String,
          default: null,
        },
        client_firstname: {
          type: String,
          default: null,
        },
        client_lastname: {
          type: String,
          default: null,
        },
        client_email: {
          type: String,
          default: null,
        },
        client_phoneNumber: {
          type: String,
          default: null,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

const admin_agent = mongoose.model("agent", adminSchema);
module.exports = admin_agent;
