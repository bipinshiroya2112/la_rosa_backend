const mongoose = require("mongoose");
const express = require("express");
const sendPropertyDetail = require("../models/sendpropertyDetails.model");
const property_listing = require("../models/property_listing");
const multer = require("multer");
const path = require("path");

const reviews = require("../models/review.model");
const sendEnquirys = require("../models/sendEnquiry.model");
const HTTP = require("../../constants/responseCode.constant");
const fs = require("fs");
var bodyParser = require("body-parser");
const { log } = require("console");
const admin_agent = require("../models/admin.agent");
const { findByIdAndUpdate } = require("../models/register");
const app = express();
app.use(express.json());
const nodemailer = require("nodemailer");
const Register = require("../models/register");
let transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  // tls : { rejectUnauthorized: false },
  auth: {
    user: "tanthetaauser@gmail.com",
    pass: "ydsioiddnnfvcclm",
  },
  // === add this === //
  // tls : { rejectUnauthorized: false }
});
//====================================================== send property details  ===========================================  PAGE NO> : 5_02  ===================

async function sendPropertyDetails(req, res) {
  try {
    const {
      agent_id,
      agency_id,
      reason,
      first_name,
      last_name,
      email,
      mobile_no,
      prefer_to_be_contacted,
      timeframe,
      address,
      type,
      priceRange,
      remember_details,
    } = req.body;

    if (
      !reason ||
      !first_name ||
      !last_name ||
      !email ||
      !mobile_no ||
      !prefer_to_be_contacted ||
      !timeframe ||
      !address ||
      !type
    ) {
      return res.status(HTTP.SUCCESS).send({
        status: false,
        code: HTTP.BAD_REQUEST,
        message: "all fields required!",
      });
    }

    if (!email?.includes("@")) {
      return res.status(HTTP.SUCCESS).send({
        status: false,
        code: HTTP.BAD_REQUEST,
        message: "Email is invalid!",
        data: {},
      });
    }

    // priceRange = JSON.parse(priceRange);
    // console.log(priceRange);

    const data = await sendPropertyDetail({
      agent_id,
      reason,
      first_name,
      last_name,
      email,
      mobile_no,
      prefer_to_be_contacted,
      timeframe,
      address,
      type,
      priceRange,
      remember_details,
    }).save();
    if (!data) {
      return res
        .status(HTTP.NOT_FOUND)
        .send({ status: false, message: "Unable to add Property details." });
    }

    const agentDetails = await admin_agent.findOne({ _id: agent_id });
    if (!agentDetails) {
      return res
        .status(HTTP.NOT_FOUND)
        .send({ status: false, message: "agent not found!!" });
    }
    const htmlToSend = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Property Details</title>
      <style>
        body {
          font-family: 'Arial', sans-serif;
          background-color: #f8f9fa;
          color: #333;
          margin: 0;
          padding: 20px;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          background-color: #fff;
          border-radius: 10px;
          padding: 30px;
          box-shadow: 0 4px 8px rgba(0,0,0,0.1);
        }
        h1 {
          color: #007bff;
          text-align: center;
          margin-bottom: 20px;
        }
        ul {
          list-style-type: none;
          padding: 0;
        }
        li {
          margin-bottom: 15px;
        }
        .field {
          font-weight: bold;
          color: #007bff;
          text-transform: uppercase;
          display: inline-block;
          width: 150px;
        }
        .value {
          font-weight: normal;
          color: #495057;
        }
        .footer {
          margin-top: 30px;
          text-align: center;
          color: #6c757d;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>Property Details</h1>
        <ul>
          <li><span class="field">Agent ID:</span> <span class="value">${agent_id}</span></li>
          <li><span class="field">Reason:</span> <span class="value">${reason}</span></li>
          <li><span class="field">First Name:</span> <span class="value">${first_name}</span></li>
          <li><span class="field">Last Name:</span> <span class="value">${last_name}</span></li>
          <li><span class="field">Email:</span> <span class="value">${email}</span></li>
          <li><span class="field">Mobile No:</span> <span class="value">${mobile_no}</span></li>
          <li><span class="field">Prefer to be Contacted:</span> <span class="value">${prefer_to_be_contacted}</span></li>
          <li><span class="field">Timeframe:</span> <span class="value">${timeframe}</span></li>
          <li><span class="field">Address:</span> <span class="value">${address}</span></li>
          <li><span class="field">Type:</span> <span class="value">${type}</span></li>
          <li><span class="field">Price Range:</span> <span class="value">${priceRange}</span></li>
          <li><span class="field">Remember Details:</span> <span class="value">${remember_details}</span></li>
        </ul>
      </div>
      <div class="footer">
        Sent via La_ROSA &copy; ${new Date().getFullYear()}
      </div>
    </body>
    </html>

`;

    var mailOptions = {
      from: "tanthetaauser@gmail.com",
      to: agentDetails?.email,
      subject: "Send Property Details",
      html: htmlToSend,
    };
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log("error" + error);
        return { status: false, data: [], message: "Could not send mail!" };
      }

      console.log("info " + info);
      console.log("Message sent: %s", info.messageId);
      console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
      return { status: true, data: [], message: "mail sent!." };
    });
    return res.status(HTTP.SUCCESS).send({
      status: true,
      message: "Property details sent successfully.",
      data: {},
    });
  } catch (e) {
    console.log(e);
    return res.status(HTTP.SUCCESS).send({
      status: false,
      code: HTTP.INTERNAL_SERVER_ERROR,
      message: "Something went wrong!",
      data: {},
    });
  }
}

//================================================ agent Review ================================================== PAGE NO. : 8 =========================

async function agentReview(req, res) {
  try {
    let id = req.params.id;
    const ObjectId = mongoose.Types.ObjectId;
    const user_id = new ObjectId(id);

    const {
      star,
      review,
      type,
      client_address,
      client_email,
      client_firstname,
      client_lastname,
      client_phoneNumber,
    } = req.body;
    let reviewData = {
      user_id,
      star,
      review,
      type,
      client_address,
      client_email,
      client_firstname,
      client_lastname,
      client_phoneNumber,
    };

    let olddata = await admin_agent.findById(id, {});

    let data = olddata.reviews.length + 1;

    let finalData = await admin_agent.findByIdAndUpdate(id, {
      $set: { agentReview: data },
    });

    if (
      !star ||
      !review ||
      !type ||
      !client_email ||
      !client_firstname ||
      !client_lastname ||
      !client_phoneNumber
    ) {
      return res
        .status(HTTP.BAD_REQUEST)
        .send({ status: false, message: "All fields are required!" });
    }

    let find = await admin_agent.findByIdAndUpdate(
      id,
      { $push: { reviews: reviewData } },
      { new: true }
    );
    return res.status(HTTP.SUCCESS).send({
      status: true,
      code: HTTP.SUCCESS,
      message: "Review Noted",
      data: {},
    });
  } catch (e) {
    console.log(e);
    return res.status(HTTP.SUCCESS).send({
      status: false,
      code: HTTP.INTERNAL_SERVER_ERROR,
      message: "Something went wrong!",
      data: {},
    });
  }
}
//=====================================================  Agency Review  ============================================================================

async function agencyReview(req, res) {
  try {
    const {
      agency_id,
      star,
      review,
      type,
      client_address,
      client_email,
      client_firstname,
      client_lastname,
      client_phoneNumber,
    } = req.body;
    if (
      !star ||
      !review ||
      !type ||
      !client_email ||
      !client_firstname ||
      !client_lastname ||
      !client_phoneNumber
    ) {
      return res
        .status(HTTP.BAD_REQUEST)
        .send({ status: false, message: "All fields are required!" });
    }
    const reviewData = await reviews({
      agency_id,
      star,
      review,
      type,
      client_address,
      client_email,
      client_firstname,
      client_lastname,
      client_phoneNumber,
    }).save();
    if (!reviewData) {
      return res.status(HTTP.NOT_FOUND).send({
        status: false,
        code: HTTP.BAD_REQUEST,
        message: "Unable to Take Review.",
      });
    }
    return res.status(HTTP.SUCCESS).send({
      status: true,
      code: HTTP.SUCCESS,
      message: "Review Noted",
      data: {},
    });
  } catch (error) {
    return res.status(HTTP.SUCCESS).send({
      status: false,
      code: HTTP.INTERNAL_SERVER_ERROR,
      message: "Something went wrong!",
      data: {},
    });
  }
}

//=====================================================  send enquiry ==============================================================================

async function sendEnquiry(req, res) {
  try {
    let {
      message,
      // prefer_to_be_contacted,
      name,
      address,
      mobile_no,
      agent_id,
      // agency_id,
      property_id,
      first_name,
      last_name,
      email,
    } = req.body;
    const user_id = req.user.id;

    if (!message || !mobile_no) {
      return res.status(HTTP.SUCCESS).send({
        status: false,
        code: HTTP.NOT_FOUND,
        message: "All fields are required!",
        data: {},
      });
    }
    const result = await sendEnquirys({
      user_id,
      agent_id,
      // agency_id,
      message,
      // prefer_to_be_contacted,
      name,
      address,
      mobile_no,
    }).save();

    const agentEmail = await admin_agent.findById(agent_id).select("email");
    console.log(agentEmail);
    const htmlToSend = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Property Details</title>
      <style>
        body {
          font-family: 'Arial', sans-serif;
          background-color: #f8f9fa;
          color: #333;
          margin: 0;
          padding: 20px;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          background-color: #fff;
          border-radius: 10px;
          padding: 30px;
          box-shadow: 0 4px 8px rgba(0,0,0,0.1);
        }
        h1 {
          color: #007bff;
          text-align: center;
          margin-bottom: 20px;
        }
        ul {
          list-style-type: none;
          padding: 0;
        }
        li {
          margin-bottom: 15px;
        }
        .field {
          font-weight: bold;
          color: #007bff;
          text-transform: uppercase;
          display: inline-block;
          width: 150px;
        }
        .value {
          font-weight: normal;
          color: #495057;
        }
        .footer {
          margin-top: 30px;
          text-align: center;
          color: #6c757d;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>Property Details</h1>
        <ul>
          <li><span class="field">User ID:</span> <span class="value">${user_id}</span></li>
          <li><span class="field">Agency ID:</span> <span class="value">${property_id}</span></li>
          <li><span class="field">Name:</span> <span class="value">${first_name}</span></li>
          <li><span class="field">Name:</span> <span class="value">${last_name}</span></li>
          <li><span class="field">Address:</span> <span class="value">${email}</span></li>
          <li><span class="field">Mobile No:</span> <span class="value">${mobile_no}</span></li>
          <li><span class="field">Message:</span> <span class="value">${message}</span></li>
        </ul>
      </div>
      <div class="footer">
        Sent via La_ROSA &copy; ${new Date().getFullYear()}
      </div>
    </body>
    </html>`;

    var mailOptions = {
      from: "tanthetaauser@gmail.com",
      to: agentEmail.email,
      subject: "Send Property Details",
      html: htmlToSend,
    };
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log("error" + error);
        return { status: false, data: [], message: "Could not send mail!" };
      }

      console.log("info " + info);
      console.log("Message sent: %s", info.messageId);
      console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
      return { status: true, data: [], message: "mail sent!." };
    });

    if (!result) {
      return res
        .status(HTTP.NOT_FOUND)
        .send({ status: false, message: "Unable to send Enquiry" });
    } else {
      return res
        .status(HTTP.SUCCESS)
        .send({ status: true, message: "Enquiry sent successfully.", result });
    }
  } catch (e) {
    console.log(e);
    return res.status(HTTP.SUCCESS).send({
      status: false,
      code: HTTP.INTERNAL_SERVER_ERROR,
      message: "Something went wrong!",
      data: {},
    });
  }
}

// ==================================================   Property Listing   =======================================================================================================

async function propertyListing(req, res) {
  try {
    let {
      listing_type,
      property_type,
      status,
      new_or_established_checked,
      lead_agent,
      authority,
      price,
      price_display,
      price_display_checked,
      name,
      email,
      phone_number,
      unit,
      street_address_number,
      street_address_name,
      suburb,
      municipality,
      auction_result,
      maximum_bid,
      Bedrooms,
      Bathrooms,
      Ensuites,
      toilets,
      garage_spaces,
      carport_spaces,
      open_spaces,
      energy_efficiensy_rating,
      living_areas,
      house_size,
      house_size_square,
      land_size,
      land_size_square,
      other_features,
      established_property,
      new_construction,
      show_actual_price,
      show_text_instead_of_price,
      Hide_the_price_and_display_contact_agent,
      send_vendor_the_property_live_email_when_listing_is_published,
      send_vendor_a_weekly_campaign_activity_report_email,
      hide_street_address_on_listing,
      hide_street_view,
      outdoor_features,
      indoor_features,
      hc_air_conditioning,
      hc_ducted_heating,
      hc_hydronic_heating,
      hc_ducted_cooling,
      hc_gas_heating,
      hc_open_fireplace,
      hc_split_system_air_conditioning,
      hc_split_system_heating,
      hc_evaporative_cooling,
      hc_reverse_cycle_air_conditioning,
      eff_solar_hot_water,
      eff_water_tank,
      eff_grey_water_system,
      eff_solar_panels,
      climate_energy,
      heading,
      discription,
      video_url,
      online_tour_1,
      online_tour_2,
      agency_listing_url,
      inspection_times,
    } = req.body;

    inspection_times = JSON.parse(inspection_times);
    var { propertyImg, florePlansImg, frontPageImg, statementOfInfo } =
      req.files;
    console.log("OUTDOOR---------->>", req.body.outdoor_features);
    console.log("INDOOR---------->>", req.body.indoor_features);

    if (!propertyImg || !florePlansImg || !statementOfInfo || !frontPageImg) {
      return res.status(HTTP.SUCCESS).send({
        success: false,
        code: HTTP.NOT_ALLOWED,
        message: "upload All Images and File",
        data: {},
      });
    }
    if (
      !Bedrooms ||
      !Bathrooms ||
      !property_type ||
      !new_or_established_checked ||
      !lead_agent ||
      !price
    ) {
      return res.status(HTTP.SUCCESS).send({
        status: false,
        code: HTTP.NOT_FOUND,
        message: "All fields are required!",
        data: {},
      });
    }
    lead_agent = JSON.parse(lead_agent);
    var propertyImg = [];
    for (const data of req.files.propertyImg) {
      propertyImg.push("uploads/property_image" + data.filename);
    }

    var plan = req.files.florePlansImg.find((item) => item);
    var florePlansImg = "uploads/property_image" + plan.filename;

    var statement = req.files.statementOfInfo.find((item) => item);
    var statementOfInfo = "uploads/property_image" + statement.filename;

    var frontPage = req.files.frontPageImg.find((item) => item);
    var frontPageImg = "uploads/property_image" + frontPage.filename;

    var agencyId_Data = req.Data;

    await new property_listing({
      agency_id: req.Data,
      listing_type,
      property_type,
      status,
      new_or_established_checked,
      lead_agent,
      authority,
      price,
      price_display,
      price_display_checked,
      name,
      email,
      phone_number,
      unit,
      street_address_number,
      street_address_name,
      suburb,
      municipality,
      auction_result,
      maximum_bid,
      Bedrooms,
      Bathrooms,
      Ensuites,
      toilets,
      garage_spaces,
      carport_spaces,
      open_spaces,
      energy_efficiensy_rating,
      living_areas,
      house_size,
      house_size_square,
      land_size,
      land_size_square,
      other_features,
      established_property,
      new_construction,
      show_actual_price,
      show_text_instead_of_price,
      Hide_the_price_and_display_contact_agent,
      send_vendor_the_property_live_email_when_listing_is_published,
      send_vendor_a_weekly_campaign_activity_report_email,
      hide_street_address_on_listing,
      hide_street_view,
      outdoor_features,
      indoor_features,
      hc_air_conditioning,
      hc_ducted_heating,
      hc_hydronic_heating,
      hc_ducted_cooling,
      hc_gas_heating,
      hc_open_fireplace,
      hc_split_system_air_conditioning,
      hc_split_system_heating,
      hc_evaporative_cooling,
      hc_reverse_cycle_air_conditioning,
      eff_solar_hot_water,
      eff_water_tank,
      eff_grey_water_system,
      eff_solar_panels,
      climate_energy,
      heading,
      discription,
      video_url,
      online_tour_1,
      online_tour_2,
      agency_listing_url,
      inspection_times,
      propertyImg,
      florePlansImg,
      frontPageImg,
      statementOfInfo,
    }).save();

    return res.status(HTTP.SUCCESS).send({
      status: true,
      code: HTTP.SUCCESS,
      message: "Property listed successfully",
      data: {},
    });
  } catch (error) {
    console.log(error);
    return res.status(HTTP.SUCCESS).send({
      status: false,
      code: HTTP.INTERNAL_SERVER_ERROR,
      message: "Something went wrong!",
      data: {},
    });
  }
}

// ======================================================   View Property  =================================================================================================

async function viewProperty(req, res) {
  try {
    const ID = req.body.id;

    let arr = [];
    const property = await property_listing.findOne({ _id: ID });
    const agent = await admin_agent
      .findOne({ _id: property.lead_agent })
      .populate("agency_id");

    let average = 0;

    for (let i = 0; i < agent.reviews.length; i++) {
      average += Number(agent.reviews[i].star);
    }
    average /= agent.reviews.length;

    let address =
      agent.agency_id.street +
      "," +
      agent.agency_id.state_region +
      "," +
      agent.agency_id.suburb_area;

    let agentData = {
      id: agent._id,
      name: agent.name,
      profileImg: agent.profileImg,
      phone: agent.business_number,
      reviews: agent.reviews,
      reviewCount: agent.reviews.length,
      average,
      agencyName: agent.agency_id.principal_name,
      agencyLogo: agent.agency_id.agencySmallLogo,
      primary_color: agent.agency_id.primary_color,
      agencyAddress: address,
    };
    return res.status(HTTP.SUCCESS).send({
      status: true,
      code: HTTP.SUCCESS,
      message: "property",
      data: property,
      agentData,
    });
  } catch (error) {
    return res.status(HTTP.SUCCESS).send({
      status: false,
      code: HTTP.INTERNAL_SERVER_ERROR,
      message: "Something went wrong!",
      data: {},
    });
  }
}

// ----------------------------------------------------------- update property ----------------------------------------------------------------------------------

async function propertyUpdate(req, res) {
  var _id = req.Data;
  let {
    property_type,
    listing_type,
    status,
    new_or_established_checked,
    lead_agent,
    authority,
    price,
    price_display,
    price_display_checked,
    name,
    email,
    phone_number,
    unit,
    street_address_number,
    street_address_name,
    suburb,
    municipality,
    auction_result,
    maximum_bid,
    Bedrooms,
    Bathrooms,
    Ensuites,
    toilets,
    garage_spaces,
    carport_spaces,
    open_spaces,
    energy_efficiensy_rating,
    living_areas,
    house_size,
    house_size_square,
    land_size,
    land_size_square,
    other_features,
    show_actual_price,
    show_text_instead_of_price,
    Hide_the_price_and_display_contact_agent,
    send_vendor_the_property_live_email_when_listing_is_published,
    send_vendor_a_weekly_campaign_activity_report_email,
    hide_street_address_on_listing,
    hide_street_view,
    outdoor_features,
    indoor_features,
    hc_air_conditioning,
    hc_ducted_heating,
    hc_hydronic_heating,
    hc_ducted_cooling,
    hc_gas_heating,
    hc_open_fireplace,
    hc_split_system_air_conditioning,
    hc_split_system_heating,
    hc_evaporative_cooling,
    hc_reverse_cycle_air_conditioning,
    eff_solar_hot_water,
    eff_water_tank,
    eff_grey_water_system,
    eff_solar_panels,
    climate_energy,
    heading,
    discription,
    video_url,
    online_tour_1,
    online_tour_2,
    agency_listing_url,
    inspection_times,
  } = req.body;

  var data_id = await property_listing.findOne({ agency_id: req.Data });
  try {
    var doc = await property_listing.find({ agency_id: _id });
    for (da of doc) {
    }
    var list_id = da.toString().slice(23, 47);

    var first = da.propertyImg;
    var second = doc.florePlansImg;
    var third = doc.statementOfInfo;
    var fourth = doc.frontPageImg;

    var firsts = [first];
    var seconds = [second];
    var thirds = [third];
    var fourths = [fourth];

    var firstsData = firsts.toString();
    var secondsData = seconds.toString();
    var thirdsData = thirds.toString();
    var fourthsData = fourths.toString();

    if (req.files.propertyImg != undefined) {
      for (const data of req.files.propertyImg) {
        outsideImg = "uploads/property_image" + data.filename;
        if (outsideImg) {
          propertyImg = "uploads/property_image" + data.filename;
          // fs.unlinkSync(path.join(__dirname, "..", "..", pro))
        }
        const data_ = await property_listing.findByIdAndUpdate(
          da._id,
          { propertyImg: outsideImg },
          { new: true }
        );
        if (!data_)
          return res.status(HTTP.SUCCESS).send({
            status: false,
            code: HTTP.BAD_REQUEST,
            message: "Unable to update data!",
            data: {},
          });
      }
    }

    if (req.files.florePlansImg != undefined) {
      for (const data of req.files.florePlansImg) {
        florePlansImg = "uploads/property_image" + data.filename;
        if (secondsData) {
          fs.unlinkSync(path.join(__dirname, "..", "..", secondsData));
        }
        const data_ = await property_listing.findByIdAndUpdate(
          da._id,
          { florePlansImg },
          { new: true }
        );
        if (!data_)
          return res.status(HTTP.SUCCESS).send({
            status: false,
            code: HTTP.BAD_REQUEST,
            message: "Unable to update data!",
            data: {},
          });
      }
    }

    if (req.files.statementOfInfo != undefined) {
      for (const data of req.files.statementOfInfo) {
        statementOfInfo = "uploads/property_image" + data.filename;
        if (thirdsData) {
          fs.unlinkSync(path.join(__dirname, "..", "..", thirdsData));
        }
        const data_ = await property_listing.findByIdAndUpdate(
          da._id,
          { statementOfInfo },
          { new: true }
        );
        if (!data_)
          return res.status(HTTP.SUCCESS).send({
            status: false,
            code: HTTP.BAD_REQUEST,
            message: "Unable to update data!",
            data: {},
          });
      }
    }

    if (req.files.frontPageImg != undefined) {
      for (const data of req.files.frontPageImg) {
        frontPageImg = "uploads/property_image" + data.filename;
        if (fourthsData) {
        }
        const data_ = await property_listing.findByIdAndUpdate(
          da._id,
          { frontPageImg },
          { new: true }
        );
        if (!data_)
          return res.status(HTTP.SUCCESS).send({
            status: false,
            code: HTTP.BAD_REQUEST,
            message: "Unable to update data!",
            data: {},
          });
      }
    }

    let indoor = JSON.parse(req.body.indoor_features);

    await property_listing.findByIdAndUpdate(
      _id,
      {
        property_type,
        listing_type,
        status,
        new_or_established_checked,
        lead_agent,
        authority,
        price,
        price_display,
        price_display_checked,
        name,
        email,
        phone_number,
        unit,
        street_address_number,
        street_address_name,
        suburb,
        municipality,
        auction_result,
        maximum_bid,
        Bedrooms,
        Bathrooms,
        Ensuites,
        toilets,
        garage_spaces,
        carport_spaces,
        open_spaces,
        energy_efficiensy_rating,
        living_areas,
        house_size,
        house_size_square,
        land_size,
        land_size_square,
        other_features,
        show_actual_price,
        show_text_instead_of_price,
        Hide_the_price_and_display_contact_agent,
        send_vendor_the_property_live_email_when_listing_is_published,
        send_vendor_a_weekly_campaign_activity_report_email,
        hide_street_address_on_listing,
        hide_street_view,
        outdoor_features: req.body.outdoor_features,
        indoor_features: indoor,
        hc_air_conditioning,
        hc_ducted_heating,
        hc_hydronic_heating,
        hc_ducted_cooling,
        hc_gas_heating,
        hc_open_fireplace,
        hc_split_system_air_conditioning,
        hc_split_system_heating,
        hc_evaporative_cooling,
        hc_reverse_cycle_air_conditioning,
        eff_solar_hot_water,
        eff_water_tank,
        eff_grey_water_system,
        eff_solar_panels,
        climate_energy,
        heading,
        discription,
        video_url,
        online_tour_1,
        online_tour_2,
        agency_listing_url,
        inspection_times,
      },
      { new: true }
    );

    return res.status(HTTP.SUCCESS).send({
      status: true,
      code: HTTP.SUCCESS,
      message: "Property updated",
      data: {},
    });
  } catch (error) {
    console.log(error);
    return res.status(HTTP.SUCCESS).send({
      status: false,
      code: HTTP.INTERNAL_SERVER_ERROR,
      message: "Something went wrong!",
      data: {},
    });
  }
}

//============================================================= View Property Of Agency ========================================================================================

async function viewAgencyProperty(req, res) {
  try {
    let filterPropertyList = [];

    const id = req.Data;

    let properties;

    if (req.query.role == "agency") {
      properties = await property_listing.find({ agency_id: id });
      if (!properties) {
        return res.status(HTTP.SUCCESS).send({
          status: false,
          code: HTTP.NOT_FOUND,
          message: "No Agents available!",
          data: {},
        });
      }
    }
    if (req.query.role == "agent") {
      properties = await property_listing.find({ lead_agent: id });

      if (!properties) {
        return res.status(HTTP.SUCCESS).send({
          status: false,
          code: HTTP.NOT_FOUND,
          message: "No Agents available!",
          data: {},
        });
      }
    }

    for (const data of properties) {
      filterPropertyList.push({
        lead_agent: data.lead_agent,
        price: data.price,
        price_display_checked: data.price_display_checked,
        price_display: data.price_display,
        Bedrooms: data.Bedrooms,
        Bathrooms: data.Bathrooms,
        garage_spaces: data.garage_spaces,
        property_type: data.property_type,
        frontPageImg: data.frontPageImg,
        listing_type: data.listing_type,
        createdAt: data.createdAt,
        id: data._id,
        street_address_name: data.street_address_name,
        street_address_number: data.street_address_number,
        email: data.email,
        status: data.status,
        suburb: data.suburb,
      });
    }

    filterPropertyList.sort((a, b) => (a.createdAt < b.createdAt) ? 1 : -1);

    return res.status(HTTP.SUCCESS).send({
      status: true,
      code: HTTP.SUCCESS,
      message: "Property details.",
      data: filterPropertyList,
    });
  } catch (err) {
    console.log(err);
    return res.status(HTTP.SUCCESS).send({
      status: false,
      code: HTTP.INTERNAL_SERVER_ERROR,
      message: "Something went wrong!",
      data: {},
    });
  }
}
//=========================================================== Veiw Agency Property(user-side) ===================================================================================

async function propertyByAgency(req, res) {
  try {
    const objectId = mongoose.Types.ObjectId;
    var id = new objectId(req.body.id);
    // var id = mongoose.Types.ObjectId(req.body.id);

    const properties = await property_listing.find({ agency_id: id });

    let arr = [];
    for (const data of properties) {
      arr.push({
        lead_agent: data.lead_agent,
        price: data.price,
        Bedrooms: data.Bedrooms,
        Bathrooms: data.Bathrooms,
        garage_spaces: data.garage_spaces,
        property_type: data.property_type,
        frontPageImg: data.frontPageImg,
        createdAt: data.createdAt,
        id: data._id,
        email: data.email,
        status: data.status,
        suburb: data.suburb,
        address: data.street_address_number + " " + data.street_address_name,
        location: data.location,
      });
    }
    return res.status(HTTP.SUCCESS).send({
      status: true,
      code: HTTP.SUCCESS,
      message: "Property details.",
      data: arr,
    });
  } catch (err) {
    console.log(err);
    return res.status(HTTP.SUCCESS).send({
      status: false,
      code: HTTP.INTERNAL_SERVER_ERROR,
      message: "Something went wrong!",
      data: {},
    });
  }
}

// =========================================================== View All Property ================================================================================================

async function viewAllProperty(req, res) {
  try {
    listings = [];
    let search = await property_listing
      .find({ $and: [{ status: req.body.status }, { agent_delet_key: true }] })
      .populate("agency_id");
    if (search.length == 0)
      return res.status(HTTP.SUCCESS).send({
        status: false,
        code: HTTP.NOT_FOUND,
        message: "No Propaty available!",
        data: {},
      });

    for (const data of search) {
      const agent = await admin_agent.findOne({ _id: data.lead_agent });
      var agentData = {
        name: agent.name,
        profileImg: agent.profileImg,
        agencyLogo: data.agency_id.agencyMediumLogo,
      };
      listings.push({
        lead_agent: agentData,
        price: data.price,
        price_display_checked: data.price_display_checked,
        price_display: data.price_display,
        Bedrooms: data.Bedrooms,
        Bathrooms: data.Bathrooms,
        carport_spaces: data.carport_spaces,
        land_size: data.land_size,
        property_type: data.property_type,
        frontPageImg: data.frontPageImg,
        createdAt: data.createdAt,
        id: data._id,
        street_address_name: data.street_address_name,
        street_address_number: data.street_address_number,
        email: data.email,
        status: data.status,
        inspection_time: data.inspection_time,
        agencyLogo: data.agency_id.agencyMediumLogo,
        createdAt: data.createdAt
      });
    }
    listings.sort((a, b) => (a.createdAt < b.createdAt) ? 1 : -1);
    return res.status(HTTP.SUCCESS).send({
      status: true,
      code: HTTP.SUCCESS,
      message: "Property details.",
      data: listings,
    });
  } catch (err) {
    console.log(err);
    return res.status(HTTP.SUCCESS).send({
      status: false,
      code: HTTP.INTERNAL_SERVER_ERROR,
      message: "Something went wrong!",
      data: {},
    });
  }
}


//==================================================================================
const getEnquiries = async (req, res) => {
  try {
    let listings = await sendEnquirys.find({ agent_id: req.Data });
    listings.sort((a, b) => (a.createdAt < b.createdAt) ? 1 : -1);
    return res.status(HTTP.SUCCESS).send({
      status: true,
      code: HTTP.SUCCESS,
      message: "Enquiries details.",
      data: listings,
    });
  } catch (err) {
    console.log(err);
    return res.status(HTTP.SUCCESS).send({
      status: false,
      code: HTTP.INTERNAL_SERVER_ERROR,
      message: "Something went wrong!",
      data: {},
    });
  }
}
//==================================================================================
const getAppraisal = async (req, res) => {
  try {
    let listings = await sendPropertyDetail.find({ agent_id: req.Data });
    listings.sort((a, b) => (a.createdAt < b.createdAt) ? 1 : -1);
    return res.status(HTTP.SUCCESS).send({
      status: true,
      code: HTTP.SUCCESS,
      message: "Enquiries details.",
      data: listings,
    });
  } catch (err) {
    console.log(err);
    return res.status(HTTP.SUCCESS).send({
      status: false,
      code: HTTP.INTERNAL_SERVER_ERROR,
      message: "Something went wrong!",
      data: {},
    });
  }
}
//===============================================================================================================================================================================

module.exports = {
  sendPropertyDetails,
  agentReview,
  agencyReview,
  sendEnquiry,

  //Agency Listing ---------------->
  propertyListing,
  viewProperty,
  viewAgencyProperty,
  propertyByAgency,
  propertyUpdate,
  viewAllProperty,
  getEnquiries,
  getAppraisal
};
