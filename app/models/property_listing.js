const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const propertySchema = new Schema(
  {
    agency_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Register",
    },
    role: {
      type: String,
      default: "property",
    },
    listing_type: {
      type : String
    },
    property_type: {
      type: String,
    },
    status: {
      type: String,
    },
    new_or_established_checked: {
      type: String,
    },
    lead_agent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "agent",
    },
    authority: {
      type: String,
    },
    price: {
      type: Number,
    },
    price_display: {
      type: Number,
    },
    price_display_checked: {
      type: String,
    },
    name: {
      type: String,
    },
    email: {
      type: String,
    },
    phone_number: {
      type: String,
    },
    unit: {
      type: String,
    },
    street_address_number: {
      type: String,
    },
    street_address_name: {
      type: String,
    },
    suburb: {
      type: String,
    },
    municipality: {
      type: String,
    },
    auction_result: {
      type: String,
    },
    maximum_bid: {
      type: Number,
    },
    Bedrooms: {
      type: String,
    },
    Bathrooms: {
      type: String,
    },
    Ensuites: {
      type: String,
    },
    toilets: {
      type: String,
    },
    garage_spaces: {
      type: String,
    },
    carport_spaces: {
      type: String,
    },
    open_spaces: {
      type: String,
    },
    energy_efficiensy_rating: {
      type: String,
    },
    living_areas: {
      type: String,
    },
    house_size: {
      type: String,
    },
    house_size_square: {
      type: String,
    },
    land_size: {
      type: String,
    },
    land_size_square: {
      type: String,
    },
    other_features: {
      type: String,
    },
    // established_property: {
    //   type: Boolean,
    // },
    // new_construction: {
    //   type: String,
    // },
    // show_actual_price: {
    //   type: Boolean,
    // },
    show_text_instead_of_price: {
      type: Boolean,
    },
    price_display_checked: {
      type : String
    },
    Hide_the_price_and_display_contact_agent: {
      type: Boolean,
    },
    send_vendor_the_property_live_email_when_listing_is_published: {
      type: Boolean,
    },
    send_vendor_a_weekly_campaign_activity_report_email: {
      type: Boolean,
    },
    hide_street_address_on_listing: {
      type: Boolean,
    },
    hide_street_view: {
      type: Boolean,
    },
    outdoor_features: {
    type : Array
    },
    indoor_features: {
      type: Array
     },
    heating_cooling: {
      type: Array,
    },
    eco_friendly: {
      type: Array,
    },
    climate_energy: {
      type: Array
    },
    heading: {
      type: String,
    },
    discription: {
      type: String,
    },
    propertyImg: {
      type: Array,
    },
    florePlansImg: {
      type: Array,
    },
    statementOfInfo: {
      type: Array,
    },
    frontPageImg: {
      type: Array,
    },
    video_url: {
      type: String,
    },
    online_tour_1: {
      type: String
    },
    online_tour_2: {
      type: String
    },
    agency_listing_url: {
      type: String
    },
    inspection_times: {
      type: Array,
    },
    agent_delet_key:{
      type :Boolean,
      default : true
    },
    location: {
      type: {type : String, required: true},
      coordinates : []
    }
  },
  { timestamps: true }
);
propertySchema.index({location : "2dsphere"})
const property_listing = mongoose.model("property_listing", propertySchema);
module.exports = property_listing;