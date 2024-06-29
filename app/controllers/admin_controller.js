const express = require("express");
const mongoose = require("mongoose");
const HTTP = require("../../constants/responseCode.constant");
const Register = require("../models/register");
const admin_agent = require("../models/admin.agent");
const property_listing = require("../models/property_listing");
const adminagencyController = require("../controllers/admin_agency_controller");
const { sendEmailOTP } = require("../../public/partials/utils");
const { log } = require("handlebars");
const { array } = require("../middlewares/agent.upload");
const bcrypt = require("bcrypt");
const { hashSync } = require("bcrypt");
const axios = require("axios");
const fs = require("fs");
const path = require("path");
var unirest = require("unirest");

async function TotalCount(req, res) {
  try {
    if (req.Data) {
      var agency_data = await Register.find({ role: "agency" });
      // console.log("🚀 ~ TotalCount ~ agency_data:", agency_data)
      var agent_data = await admin_agent.find({ role: "agent" });
      var property_data = await property_listing.find({});
      var user_data = await Register.find({ role: "user" });

      return res
        .status(HTTP.SUCCESS)
        .send({
          status: true,
          code: HTTP.SUCCESS,
          message: "Total Count",
          agency: agency_data.length,
          agent: agent_data.length,
          property: property_data.length,
          user: user_data.length,
        });
    } else {
      return res
        .status(HTTP.SUCCESS)
        .send({
          status: false,
          code: HTTP.UNAUTHORIZED,
          message: "Access denied. Please log in to continue.",
          data: {},
        });
    }
  } catch (error) {
    console.log(error);
    return res
      .status(HTTP.SUCCESS)
      .send({
        success: false,
        code: HTTP.INTERNAL_SERVER_ERROR,
        message: "Something went wrong!",
        data: {},
      });
  }
}

async function ViewAllAgency(req, res) {
  try {
    var data = [];
    if (req.Data) {
      var agency_data = await Register.find({ role: "agency" });
      for (data_s of agency_data) {
        data.push({
          id: data_s.id,
          principal_name: data_s.principal_name,
          display_email: data_s.email,
          agencyLargeLogo: data_s.agencyLargeLogo,
          publish: data_s.publish,
        });
        // console.log("🚀 ~ file: admin_controller.js:45 ~ ViewAllAgency ~ data:", data)
      }
      data.sort((a, b) => (a.createdAt < b.createdAt) ? 1 : -1);
      return res
        .status(HTTP.SUCCESS)
        .send({
          status: true,
          code: HTTP.SUCCESS,
          message: "Agency details.",
          data: data,
        });
    } else {
      return res
        .status(HTTP.SUCCESS)
        .send({
          status: false,
          code: HTTP.UNAUTHORIZED,
          message: "Access denied. Please log in to continue.",
          data: data,
        });
    }
  } catch (error) {
    console.log(error);
    return res
      .status(HTTP.SUCCESS)
      .send({
        success: false,
        code: HTTP.INTERNAL_SERVER_ERROR,
        message: "Something went wrong!",
        data: {},
      });
  }
}

async function ViewAllAgent(req, res) {
  try {
    if (req.Data) {
      let lead_agent = await admin_agent.find({ role: "agent" });

      // Create a new object with the response data
      lead_agent.sort((a, b) => (a.createdAt < b.createdAt) ? 1 : -1);
      return res
        .status(HTTP.SUCCESS)
        .send({
          status: true,
          code: HTTP.SUCCESS,
          message: "agent details.",
          lead_agent,
        });
    } else {
      return res
        .status(HTTP.SUCCESS)
        .send({
          status: false,
          code: HTTP.UNAUTHORIZED,
          message: "Please authenticate yourself",
          data: {},
        });
    }
  } catch (error) {
    console.log(error);
    return res
      .status(HTTP.SUCCESS)
      .send({
        success: false,
        code: HTTP.INTERNAL_SERVER_ERROR,
        message: "Something went wrong!",
        data: {},
      });
  }
}

async function ViewAllproperty(req, res) {
  try {
    if (req.Data) {
      var property_data = await property_listing
        .find({ role: "property" })
        .populate({
          path: "lead_agent",
          select: "first_name last_name"
        });
      property_data.sort((a, b) => (a.createdAt < b.createdAt) ? 1 : -1);
      return res
        .status(HTTP.SUCCESS)
        .send({
          status: true,
          code: HTTP.SUCCESS,
          message: "Agency details.",
          data: property_data,
        });
    } else {
      return res
        .status(HTTP.SUCCESS)
        .send({
          status: false,
          code: HTTP.UNAUTHORIZED,
          message: "Access denied. Please log in to continue.",
          data: {},
        });
    }
  } catch (error) {
    console.log(error);
    return res
      .status(HTTP.SUCCESS)
      .send({
        success: false,
        code: HTTP.INTERNAL_SERVER_ERROR,
        message: "Something went wrong!",
        data: {},
      });
  }
}

async function Create(req, res) {
  try {
    if (req.Data) {
      const password = hashSync(req.body.password.trim(), 8);
      // console.log("🚀 ~ file: admin_controller.js:96 ~ Create ~ password:", password)
      let {
        email,
        role,
        street,
        suburb_area,
        postcode,
        state_region,
        country,
        mailing_address_street,
        mailing_address_suburb_area,
        mailing_address_postcode,
        mailing_address_state_region,
        mailing_address_country,
        phone,
        web,
        facebook_page,
        twitter_profile_url,
        principal_name,
        display_email,
        // office_description,
        // primary_color,
        // secondary_color,
        // text_color
      } = req.body;

      if (
        !street ||
        !suburb_area ||
        !postcode ||
        !state_region ||
        !country ||
        !phone ||
        !display_email
      ) {
        return res
          .status(HTTP.SUCCESS)
          .send({
            status: false,
            code: HTTP.NOT_FOUND,
            message: "All fields are required!",
            data: {},
          });
      }

      if (!email.includes("@")) {
        return res
          .status(HTTP.SUCCESS)
          .send({
            status: false,
            code: HTTP.BAD_REQUEST,
            message: "email is invalid!",
            data: {},
          });
      }

      // if (postcode.length < 5 || postcode.length >= 12) {
      //     return res.status(HTTP.SUCCESS).send({ "status": false, 'code': HTTP.BAD_REQUEST, "message": "Please enter a strong password", data: {} })
      // }

      const userExists = await Register.findOne({
        $or: [{ email: req.body.email }],
      });
      // console.log("🚀 ~ file: admin_controller.js:135 ~ Create ~ userExists:", userExists)
      if (userExists)
        return res
          .status(HTTP.SUCCESS)
          .send({
            status: false,
            code: HTTP.BAD_REQUEST,
            message: "User Exists. Please Sign In.",
            data: {},
          });

      // for (data of req.files.agencySmallLogo) {
      //     var agencySmallLogo = "uploads/agency_image/" + data.filename;
      // }

      // for (data of req.files.agencyMediumLogo) {
      //     var agencyMediumLogo = "uploads/agency_image/" + data.filename;
      // }

      // for (data of req.files.agencyLargeLogo) {
      //     var agencyLargeLogo = "uploads/agency_image/" + data.filename;
      // }

      // for (data of req.files.heroImg) {
      //     var heroImg = "uploads/agency_image/" + data.filename;
      // }

      await new Register({
        email,
        password,
        role,
        street,
        suburb_area,
        postcode,
        state_region,
        country,
        mailing_address_street,
        mailing_address_suburb_area,
        mailing_address_postcode,
        mailing_address_state_region,
        mailing_address_country,
        phone,
        web,
        facebook_page,
        twitter_profile_url,
        principal_name,
        display_email,
        // office_description,
        // agencySmallLogo,
        // agencyMediumLogo,
        // agencyLargeLogo,
        // heroImg,
        // primary_color,
        // secondary_color,
        // text_color
      }).save();
      return res
        .status(HTTP.SUCCESS)
        .send({
          status: true,
          code: HTTP.SUCCESS,
          message: "agency register.",
          data: {},
        });
    } else {
      return res
        .status(HTTP.SUCCESS)
        .send({
          status: false,
          code: HTTP.UNAUTHORIZED,
          message: "Access denied. Please log in to continue.",
          data: {},
        });
    }
  } catch (e) {
    console.log(e);
    return res
      .status(HTTP.SUCCESS)
      .send({
        status: false,
        code: HTTP.INTERNAL_SERVER_ERROR,
        message: "Something went wrong!",
        data: {},
      });
  }
}

async function publishUpdate(req, res) {
  try {
    if (req.Data) {
      var id = req.params.id;
      // console.log("🚀 ~ file: admin_controller.js:221 ~ publishUpdate ~ id:", id)
      const data = await Register.findById(id, {});
      // console.log("🚀 ~ file: admin_controller.js:223 ~ publishUpdate ~ data:", data)

      if (data.publish === false) {
        await Register.findByIdAndUpdate(id, { publish: true });
      } else {
        await Register.findByIdAndUpdate(id, { publish: false });
      }

      return res
        .status(HTTP.SUCCESS)
        .send({
          status: true,
          code: HTTP.SUCCESS,
          message: "Agency details.",
          data: {},
        });
    } else {
      return res
        .status(HTTP.SUCCESS)
        .send({
          status: false,
          code: HTTP.UNAUTHORIZED,
          message: "Access denied. Please log in to continue.",
          data: {},
        });
    }
  } catch (error) {
    console.log(error);
    return res
      .status(HTTP.SUCCESS)
      .send({
        success: false,
        code: HTTP.INTERNAL_SERVER_ERROR,
        message: "Something went wrong!",
        data: {},
      });
  }
}

async function AgencyEdit(req, res) {
  try {
    var id = req.params.id;
    console.log("🚀 ~ file: admin_controller.js:244 ~ AgencyEdit ~ id:", id)
    let {
      email,
      street,
      suburb_area,
      postcode,
      state_region,
      country,
      mailing_address_street,
      mailing_address_suburb_area,
      mailing_address_postcode,
      mailing_address_state_region,
      mailing_address_country,
      fax,
      phone,
      web,
      facebook_page,
      twitter_profile_url,
      principal_name,
      display_email,
      office_description,
      primary_color,
      secondary_color,
      text_color,
    } = req.body;

    let {
      agencySmallLogo,
      agencyMediumLogo,
      agencyLargeLogo,
      commercialAgencySmallLogo,
      commercialAgencyMediumLogo,
      commercialAgencyLargeLogo,
      commercialAgencyExtraLargeLogo,
      heroImg,
    } = req.files;

    if (req.Data) {
      // console.log("🚀 ~ file: admin_controller.js:272 ~ AgencyEdit ~ req.Data:", req.Data)
      if (!req.files) {
        await Register.findByIdAndUpdate(
          id,
          {
            email,
            street,
            suburb_area,
            postcode,
            state_region,
            country,
            mailing_address_street,
            mailing_address_suburb_area,
            mailing_address_postcode,
            mailing_address_state_region,
            mailing_address_country,
            fax,
            phone,
            web,
            facebook_page,
            twitter_profile_url,
            principal_name,
            display_email,
            office_description,
            primary_color,
            secondary_color,
            text_color,
          },
          { new: true }
        );
        // console.log(" ---------------- No Image --------------->");
      } else {
        await Register.findByIdAndUpdate(
          id,
          {
            email,
            street,
            suburb_area,
            postcode,
            state_region,
            country,
            mailing_address_street,
            mailing_address_suburb_area,
            mailing_address_postcode,
            mailing_address_state_region,
            mailing_address_country,
            fax,
            phone,
            web,
            facebook_page,
            twitter_profile_url,
            principal_name,
            display_email,
            office_description,
            primary_color,
            secondary_color,
            text_color,
          },
          { new: true }
        );
        const agencyDetail = await Register.findById(id);
        if (req.files.agencySmallLogo) {
          if (req.files.agencySmallLogo !== null) {
            // console.log(doc, "-------------------->");
            if (agencyDetail.agencySmallLogo) {
              fs.unlinkSync(
                path.join(__dirname, "..", "..", agencyDetail.agencySmallLogo)
              );
            }
            for (data of req.files.agencySmallLogo) {
              agencySmallLogo = "uploads/agency_image/" + data.filename;
              // console.log("🚀 ~ file: blog.controller.js:556 ~ editBlog ~ outsideImg", agencySmallLogo);
              await Register.findByIdAndUpdate(
                id,
                { agencySmallLogo: agencySmallLogo },
                { new: true }
              ),
                function (err, docs) {
                  if (err) {
                    console.log(err);
                  }
                };
            }
          } else {
            var imagePath = "";
            if (agencyDetail.agencySmallLogo) {
              imagePath = agencyDetail.agencySmallLogo;
            }
            for (data of req.files.agencySmallLogo) {
              await Register.findByIdAndUpdate(
                id,
                { agencySmallLogo: imagePath },
                { new: true }
              ),
                function (err, docs) {
                  if (err) {
                    console.log(err);
                  }
                };
            }
          }
        }
        if (req.files.agencyMediumLogo) {
          if (req.files.agencyMediumLogo !== null) {
            // console.log(agencyDetail.agencySmallLogo, "-------------------->123");
            if (agencyDetail.agencyMediumLogo) {
              fs.unlinkSync(
                path.join(__dirname, "..", "..", agencyDetail.agencyMediumLogo)
              );
            }
            for (data of req.files.agencyMediumLogo) {
              agencyMediumLogo = "uploads/agency_image/" + data.filename;
              console.log(
                "🚀 ~ file: blog.controller.js:589 ~ editBlog ~ outsideImg",
                agencyMediumLogo
              );
              await Register.findByIdAndUpdate(
                id,
                { agencyMediumLogo: agencyMediumLogo },
                { new: true }
              ),
                function (err, docs) {
                  if (err) {
                    console.log(err);
                  }
                };
            }
          } else {
            // console.log(doc, "--------------------><--------------------");
            var imagePath = "";
            if (agencyDetail.agencyMediumLogo) {
              imagePath = agencyDetail.agencyMediumLogo;
            }
            for (data of req.files.agencyMediumLogo) {
              await Register.findByIdAndUpdate(
                id,
                { agencyMediumLogo: imagePath },
                { new: true }
              ),
                function (err, docs) {
                  if (err) {
                    console.log(err);
                  }
                };
            }
          }
        }
        if (req.files.agencyLargeLogo) {
          if (req.files.agencyLargeLogo !== null) {
            if (agencyDetail.agencyLargeLogo) {
              fs.unlinkSync(
                path.join(__dirname, "..", "..", agencyDetail.agencyLargeLogo)
              );
            }
            for (data of req.files.agencyLargeLogo) {
              agencyLargeLogo = "uploads/agency_image/" + data.filename;
              console.log(
                "🚀 ~ file: blog.controller.js:621 ~ editBlog ~ outsideImg",
                agencyLargeLogo
              );
              await Register.findByIdAndUpdate(
                id,
                { agencyLargeLogo: agencyLargeLogo },
                { new: true }
              ),
                function (err, docs) {
                  if (err) {
                    console.log(err);
                  }
                };
            }
          } else {
            var imagePath = "";
            if (agencyDetail.agencyLargeLogo) {
              imagePath = agencyDetail.agencyLargeLogo;
            }
            for (data of req.files.agencyLargeLogo) {
              await Register.findByIdAndUpdate(
                id,
                { agencyLargeLogo: imagePath },
                { new: true }
              ),
                function (err, docs) {
                  if (err) {
                    console.log(err);
                  }
                };
            }
          }
        }
        if (req.files.commercialAgencySmallLogo) {
          if (req.files.commercialAgencySmallLogo !== null) {
            if (agencyDetail.commercialAgencySmallLogo) {
              fs.unlinkSync(
                path.join(
                  __dirname,
                  "..",
                  "..",
                  agencyDetail.commercialAgencySmallLogo
                )
              );
            }
            for (data of req.files.commercialAgencySmallLogo) {
              commercialAgencySmallLogo =
                "uploads/agency_image/" + data.filename;
              await Register.findByIdAndUpdate(
                id,
                { commercialAgencySmallLogo: commercialAgencySmallLogo },
                { new: true }
              ),
                function (err, docs) {
                  if (err) {
                    console.log(err);
                  }
                };
            }
          } else {
            var imagePath = "";
            if (agencyDetail.commercialAgencySmallLogo) {
              imagePath = agencyDetail.commercialAgencySmallLogo;
            }
            for (data of req.files.commercialAgencySmallLogo) {
              await Register.findByIdAndUpdate(
                id,
                { commercialAgencySmallLogo: imagePath },
                { new: true }
              ),
                function (err, docs) {
                  if (err) {
                    console.log(err);
                  }
                };
            }
          }
        }
        if (req.files.commercialAgencyMediumLogo) {
          if (req.files.commercialAgencyMediumLogo !== null) {
            if (agencyDetail.commercialAgencyMediumLogo) {
              fs.unlinkSync(
                path.join(
                  __dirname,
                  "..",
                  "..",
                  agencyDetail.commercialAgencyMediumLogo
                )
              );
            }
            for (data of req.files.commercialAgencyMediumLogo) {
              commercialAgencyMediumLogo =
                "uploads/agency_image/" + data.filename;
              await Register.findByIdAndUpdate(
                id,
                { commercialAgencyMediumLogo: commercialAgencyMediumLogo },
                { new: true }
              ),
                function (err, docs) {
                  if (err) {
                    console.log(err);
                  }
                };
            }
          } else {
            var imagePath = "";
            if (agencyDetail.commercialAgencyMediumLogo) {
              imagePath = agencyDetail.commercialAgencyMediumLogo;
            }
            for (data of req.files.commercialAgencyMediumLogo) {
              await Register.findByIdAndUpdate(
                id,
                { commercialAgencyMediumLogo: imagePath },
                { new: true }
              ),
                function (err, docs) {
                  if (err) {
                    console.log(err);
                  }
                };
            }
          }
        }
        if (req.files.commercialAgencyLargeLogo) {
          if (req.files.commercialAgencyLargeLogo !== null) {
            if (agencyDetail.commercialAgencyLargeLogo) {
              fs.unlinkSync(
                path.join(
                  __dirname,
                  "..",
                  "..",
                  agencyDetail.commercialAgencyLargeLogo
                )
              );
            }
            for (data of req.files.commercialAgencyLargeLogo) {
              commercialAgencyLargeLogo =
                "uploads/agency_image/" + data.filename;
              await Register.findByIdAndUpdate(
                id,
                { commercialAgencyLargeLogo: commercialAgencyLargeLogo },
                { new: true }
              ),
                function (err, docs) {
                  if (err) {
                    console.log(err);
                  }
                };
            }
          } else {
            var imagePath = "";
            if (agencyDetail.commercialAgencyLargeLogo) {
              imagePath = agencyDetail.commercialAgencyLargeLogo;
            }
            for (data of req.files.commercialAgencyLargeLogo) {
              await Register.findByIdAndUpdate(
                id,
                { commercialAgencyLargeLogo: imagePath },
                { new: true }
              ),
                function (err, docs) {
                  if (err) {
                    console.log(err);
                  }
                };
            }
          }
        }
        if (req.files.commercialAgencyExtraLargeLogo) {
          if (req.files.commercialAgencyExtraLargeLogo !== null) {
            if (agencyDetail.commercialAgencyExtraLargeLogo) {
              fs.unlinkSync(
                path.join(
                  __dirname,
                  "..",
                  "..",
                  agencyDetail.commercialAgencyExtraLargeLogo
                )
              );
            }
            for (data of req.files.commercialAgencyExtraLargeLogo) {
              commercialAgencyExtraLargeLogo =
                "uploads/agency_image/" + data.filename;
              await Register.findByIdAndUpdate(
                id,
                {
                  commercialAgencyExtraLargeLogo:
                    commercialAgencyExtraLargeLogo,
                },
                { new: true }
              ),
                function (err, docs) {
                  if (err) {
                    console.log(err);
                  }
                };
            }
          } else {
            var imagePath = "";
            if (agencyDetail.commercialAgencyExtraLargeLogo) {
              imagePath = agencyDetail.commercialAgencyExtraLargeLogo;
            }
            for (data of req.files.commercialAgencyExtraLargeLogo) {
              await Register.findByIdAndUpdate(
                id,
                { commercialAgencyExtraLargeLogo: imagePath },
                { new: true }
              ),
                function (err, docs) {
                  if (err) {
                    console.log(err);
                  }
                };
            }
          }
        }
        if (req.files.heroImg) {
          if (req.files.heroImg !== null) {
            if (agencyDetail.heroImg) {
              fs.unlinkSync(path.join(__dirname, "..", "..", agencyDetail.heroImg));
            }
            for (data of req.files.heroImg) {
              heroImg = "uploads/agency_image/" + data.filename;
              await Register.findByIdAndUpdate(
                id,
                { heroImg: heroImg },
                { new: true }
              ),
                function (err, docs) {
                  if (err) {
                    console.log(err);
                  }
                };
            }
          } else {
            var imagePath = "";
            if (agencyDetail.heroImg) {
              imagePath = agencyDetail.heroImg;
            }
            for (data of req.files.heroImg) {
              await Register.findByIdAndUpdate(
                id,
                { heroImg: imagePath },
                { new: true }
              ),
                function (err, docs) {
                  if (err) {
                    console.log(err);
                  }
                };
            }
          }
        }
        return res
          .status(HTTP.SUCCESS)
          .send({
            status: true,
            code: HTTP.SUCCESS,
            message: "Agent registered.",
            data: {},
          });
      }
    } else {
      return res
        .status(HTTP.SUCCESS)
        .send({
          status: false,
          code: HTTP.UNAUTHORIZED,
          message: "Access denied. Please log in to continue.",
          data: {},
        });
    }
  } catch (error) {
    console.log(error);
    return res
      .status(HTTP.SUCCESS)
      .send({
        success: false,
        code: HTTP.INTERNAL_SERVER_ERROR,
        message: "Something went wrong!",
        data: {},
      });
  }
}

async function AgencyDelete(req, res) {
  try {
    if (req.Data) {
      var id = req.params.id;
      await Register.findByIdAndDelete(id, {});
      return res
        .status(HTTP.SUCCESS)
        .send({
          status: true,
          code: HTTP.SUCCESS,
          message: "Agency delete",
          data: {},
        });
    } else {
      return res
        .status(HTTP.SUCCESS)
        .send({
          status: false,
          code: HTTP.UNAUTHORIZED,
          message: "Access denied. Please log in to continue.",
          data: {},
        });
    }
  } catch (error) {
    console.log(error);
    return res
      .status(HTTP.SUCCESS)
      .send({
        success: false,
        code: HTTP.INTERNAL_SERVER_ERROR,
        message: "Something went wrong!",
        data: {},
      });
  }
}

async function ViewAgencyByid(req, res) {
  try {
    var id = req.params.id;
    if (req.Data) {
      var agency_data = await Register.findById(id, {});
      return res
        .status(HTTP.SUCCESS)
        .send({
          status: true,
          code: HTTP.SUCCESS,
          message: "Agency details.",
          data: agency_data,
        });
    } else {
      return res
        .status(HTTP.SUCCESS)
        .send({
          status: false,
          code: HTTP.UNAUTHORIZED,
          message: "Access denied. Please log in to continue.",
          data: data,
        });
    }
  } catch (error) {
    console.log(error);
    return res
      .status(HTTP.SUCCESS)
      .send({
        success: false,
        code: HTTP.INTERNAL_SERVER_ERROR,
        message: "Something went wrong!",
        data: {},
      });
  }
}

async function ViewAgencyOfproperty(req, res) {
  try {
    var id = req.params.id;
    if (req.Data) {
      var property_data = await property_listing.find({ agency_id: id });
      return res
        .status(HTTP.SUCCESS)
        .send({
          status: true,
          code: HTTP.SUCCESS,
          message: "Agency delete",
          data: property_data,
        });
    } else {
      return res
        .status(HTTP.SUCCESS)
        .send({
          status: false,
          code: HTTP.UNAUTHORIZED,
          message: "Access denied. Please log in to continue.",
          data: {},
        });
    }
  } catch (error) {
    console.log(error);
    return res
      .status(HTTP.SUCCESS)
      .send({
        success: false,
        code: HTTP.INTERNAL_SERVER_ERROR,
        message: "Something went wrong!",
        data: {},
      });
  }
}

// async function Agent(req, res) {
//     try {
//         // console.log(req.params.id);
//         var id = req.params.id;
//         if (req.Data) {
//             var agent_data = await admin_agent.find({ _id: id });
//             return res.status(HTTP.SUCCESS).send({ status: true, code: HTTP.SUCCESS, message: "Agency delete", data: agent_data });
//         } else {
//             return res.status(HTTP.SUCCESS).send({ status: false, code: HTTP.UNAUTHORIZED, message: "Access denied. Please log in to continue.", data: {} });
//         }
//     } catch (error) {
//         console.log(error);
//         return res.status(HTTP.SUCCESS).send({ success: false, code: HTTP.INTERNAL_SERVER_ERROR, message: "Something went wrong!", data: {} });
//     }
// }

async function AgentCreate(req, res) {
  try {
    let {
      agency_id,
      job_title,
      email,
      confirm_email,
      mobile_number,
      business_number,
      first_name,
      last_name,
      start_year_in_industry,
      license_number,
      about_me,
      taglines,
      awards,
      specialties,
      community_involvement,
      video_title,
      video_URL,
      twitter_profile_URL,
      facebook_profile_URL,
      linkedIn_profile_URL,
      role,
      residential_sales,
      residential_property_management,
      weakly_update,
      reviews,
    } = req.body;

    let { profileImg, coverProfileImg } = req.files;

    if (!req.body.agency_id) {
      return res
        .status(HTTP.SUCCESS)
        .send({
          status: false,
          code: HTTP.BAD_REQUEST,
          message: "Agency Detail is required",
          data: {},
        });
    }

    if (!req.body.email) {
      return res
        .status(HTTP.SUCCESS)
        .send({
          status: false,
          code: HTTP.BAD_REQUEST,
          message: "Email is required",
          data: {},
        });
    }

    if (!req.body.first_name) {
      return res
        .status(HTTP.SUCCESS)
        .send({
          status: false,
          code: HTTP.BAD_REQUEST,
          message: "first_name is required",
          data: {},
        });
    }

    if (!req.files.profileImg) {
      return res
        .status(HTTP.SUCCESS)
        .send({
          status: false,
          code: HTTP.BAD_REQUEST,
          message: "profile Img required",
          data: {},
        });
    }

    if (!req.files.coverProfileImg) {
      return res
        .status(HTTP.SUCCESS)
        .send({
          status: false,
          code: HTTP.BAD_REQUEST,
          message: "cover ProfileImg  is required",
          data: {},
        });
    }

    var name = first_name + " " + last_name;

    if (email !== confirm_email)
      return res
        .status(HTTP.SUCCESS)
        .send({
          status: false,
          code: HTTP.BAD_REQUEST,
          message: "Email and confirm email does not match",
        });

    var img_data = req.files.profileImg;
    var imgSecond_data = req.files.coverProfileImg;
    // console.log("🚀 ~ file: admin_controller.js:676 ~ AgentCreate ~ req.files:", req.files);

    for (data of img_data) {
    }
    var pro = "uploads/agent" + data.filename;
    for (datas of imgSecond_data) {
    }
    var co = "uploads/agent" + datas.filename;

    // return false;

    // var photo = req.files.profileImg.find((item) => item);
    // var profileImg = "uploads/agent" + photo.filename;

    // var profile = req.files.coverProfileImg.find((item) => item);
    // var coverProfileImg = "uploads/agent" + profile.filename;

    if (!start_year_in_industry || !license_number) {
      return res
        .status(HTTP.SUCCESS)
        .send({
          status: false,
          code: HTTP.NOT_FOUND,
          message: "All fields are required!",
          data: {},
        });
    }

    if (!email.includes("@")) {
      return res
        .status(HTTP.SUCCESS)
        .send({
          status: false,
          code: HTTP.BAD_REQUEST,
          message: "email is invalid!",
          data: {},
        });
    }

    const userExists = await admin_agent.findOne({
      $or: [{ email: req.body.email }],
    });
    if (userExists)
      return res
        .status(HTTP.SUCCESS)
        .send({
          status: false,
          code: HTTP.BAD_REQUEST,
          message: "Agent with this email is already exist",
          data: {},
        });

    // console.log(req.Data, " ----------------------------------------");

    var agencyId_Data = req.Data;
    // console.log(agencyId_Data, "------------ line:- 929---------------------->");

    // console.log(req.body)

    // var logo = await Register.findById(req.Data, {});
    // var logo_data = logo.agencySmallLogo;

    await new admin_agent({
      agency_id,
      job_title,
      email,
      confirm_email,
      mobile_number,
      business_number,
      profileImg: pro,
      first_name,
      last_name,
      name,
      start_year_in_industry,
      license_number,
      about_me,
      taglines,
      awards,
      specialties,
      community_involvement,
      coverProfileImg: co,
      video_title,
      video_URL,
      twitter_profile_URL,
      facebook_profile_URL,
      linkedIn_profile_URL,
      role,
      residential_sales,
      residential_property_management,
      weakly_update,
      Admin_id: agencyId_Data,
      reviews,
    }).save();

    return res
      .status(HTTP.SUCCESS)
      .send({ status: true, code: HTTP.SUCCESS, message: "Agent registered." });
  } catch (e) {
    console.log(e);
    return res
      .status(HTTP.SUCCESS)
      .send({
        status: false,
        code: HTTP.INTERNAL_SERVER_ERROR,
        message: "Something went wrong!",
        data: {},
      });
  }
}

async function agentDelete(req, res) {
  try {
    var id = req.params.id;
    if (req.Data) {
      await admin_agent.findByIdAndDelete(id, {});
      return res
        .status(HTTP.SUCCESS)
        .send({ status: true, code: HTTP.SUCCESS, message: "Agent delete" });
    } else {
      return res
        .status(HTTP.SUCCESS)
        .send({
          status: false,
          code: HTTP.UNAUTHORIZED,
          message: "Access denied. Please log in to continue.",
          data: {},
        });
    }
  } catch (error) {
    console.log(error);
    return res
      .status(HTTP.SUCCESS)
      .send({
        success: false,
        code: HTTP.INTERNAL_SERVER_ERROR,
        message: "Something went wrong!",
        data: {},
      });
  }
}

async function agentView(req, res) {
  try {
    // console.log(req.params.id);
    var id = req.params.id;
    if (req.Data) {
      var agent_data = await admin_agent.findById(id, {}, { new: true });
      // console.log(agent_data);
      return res
        .status(HTTP.SUCCESS)
        .send({
          status: true,
          code: HTTP.SUCCESS,
          message: "Agent view",
          data: agent_data,
        });
    } else {
      return res
        .status(HTTP.SUCCESS)
        .send({
          status: false,
          code: HTTP.UNAUTHORIZED,
          message: "Access denied. Please log in to continue.",
          data: {},
        });
    }
  } catch (error) {
    console.log(error);
    return res
      .status(HTTP.SUCCESS)
      .send({
        success: false,
        code: HTTP.INTERNAL_SERVER_ERROR,
        message: "Something went wrong!",
        data: {},
      });
  }
}

async function publishAgentUpdate(req, res) {
  try {
    if (req.Data) {
      var id = req.params.id;
      const data = await admin_agent.findById(id, {});

      if (data.publish === false) {
        await admin_agent.findByIdAndUpdate(id, { publish: true });
      } else {
        await admin_agent.findByIdAndUpdate(id, { publish: false });
      }

      return res
        .status(HTTP.SUCCESS)
        .send({
          status: true,
          code: HTTP.SUCCESS,
          message: "Agent details.",
          data: {},
        });
    } else {
      return res
        .status(HTTP.SUCCESS)
        .send({
          status: false,
          code: HTTP.UNAUTHORIZED,
          message: "Access denied. Please log in to continue.",
          data: {},
        });
    }
  } catch (error) {
    console.log(error);
    return res
      .status(HTTP.SUCCESS)
      .send({
        success: false,
        code: HTTP.INTERNAL_SERVER_ERROR,
        message: "Something went wrong!",
        data: {},
      });
  }
}

async function agentEdit(req, res) {
  try {
    var id = req.params.id;
    if (req.Data) {
      if (!req.files) {
        const update = await admin_agent.findByIdAndUpdate(
          id,
          { $set: req.body },
          { new: true }
        );
        // console.log("🚀 ~ file: admin_controller.js:845 ~ agentEdit ~ update:", update)
        return res
          .status(HTTP.SUCCESS)
          .send({
            status: true,
            code: HTTP.SUCCESS,
            message: "agent update",
            data: update,
          });
      } else {
        await admin_agent.findByIdAndUpdate(
          id,
          { $set: req.body },
          { new: true }
        );

        const doc = await admin_agent.findById(id, {}, { new: true });

        if (req.files.profileImg) {
          if (req.files.profileImg !== null) {
            // console.log(doc, "-------------------->");
            if (doc.profileImg) {
              fs.unlinkSync(path.join(__dirname, "..", "..", doc.profileImg));
            }
            for (data of req.files.profileImg) {
              profileImg = "uploads/agent" + data.filename;
              console.log(
                "🚀 ~ file: blog.controller.js:556 ~ editBlog ~ outsideImg",
                profileImg
              );
              await admin_agent.findByIdAndUpdate(
                id,
                { profileImg },
                { new: true }
              ),
                function (err, docs) {
                  if (err) {
                    console.log(err);
                  }
                };
            }
          } else {
            //console.log(doc, "--------------------><------------------------");
            var imagePath = "";
            if (doc.profileImg) {
              imagePath = doc.profileImg;
            }
            for (data of req.files.profileImg) {
              await admin_agent.findByIdAndUpdate(
                id,
                { profileImg: imagePath },
                { new: true }
              ),
                function (err, docs) {
                  if (err) {
                    console.log(err);
                  }
                };
            }
          }
        }
        if (req.files.coverProfileImg) {
          if (req.files.coverProfileImg !== null) {
            // console.log(doc.coverProfileImg, "-------------------->123");
            if (doc.coverProfileImg) {
              fs.unlinkSync(
                path.join(__dirname, "..", "..", doc.coverProfileImg)
              );
            }
            for (data of req.files.coverProfileImg) {
              coverProfileImg = "uploads/agent" + data.filename;
              // console.log("🚀 ~ file: blog.controller.js:589 ~ editBlog ~ outsideImg",coverProfileImg);
              await admin_agent.findByIdAndUpdate(
                id,
                { coverProfileImg: coverProfileImg },
                { new: true }
              ),
                function (err, docs) {
                  if (err) {
                    console.log(err);
                  }
                };
            }
          } else {
            // console.log(doc, "--------------------><--------------------");
            var imagePath = "";
            if (doc.coverProfileImg) {
              imagePath = doc.coverProfileImg;
            }
            for (data of req.files.coverProfileImg) {
              await admin_agent.findByIdAndUpdate(
                id,
                { coverProfileImg: imagePath },
                { new: true }
              ),
                function (err, docs) {
                  if (err) {
                    console.log(err);
                  }
                };
            }
          }
        }

        return res.status(HTTP.SUCCESS).send({
          status: true,
          code: HTTP.SUCCESS,
          message: "Agent updated.",
          data: {},
        });

        // return res.status(HTTP.SUCCESS).send({ status: true, code: HTTP.SUCCESS, message: "agent update" });
      }
    } else {
      return res
        .status(HTTP.SUCCESS)
        .send({
          status: false,
          code: HTTP.UNAUTHORIZED,
          message: "Access denied. Please log in to continue.",
          data: {},
        });
    }
  } catch (error) {
    console.log(error);
    return res
      .status(HTTP.SUCCESS)
      .send({
        success: false,
        code: HTTP.INTERNAL_SERVER_ERROR,
        message: "Something went wrong!",
        data: {},
      });
  }
}

async function ListingCreate(req, res) {
  try {
    if (req.Data) {
      let {
        listing_type,
        property_type,
        agency_id,
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
        // other_features,

        established_property,
        new_construction,
        show_actual_price,
        show_text_instead_of_price,
        Hide_the_price_and_display_contact_agent,
        send_vendor_the_property_live_email_when_listing_is_published,
        send_vendor_a_weekly_campaign_activity_report_email,
        hide_street_address_on_listing,
        hide_street_view,
        indoor_features,
        outdoor_features,
        heating_cooling,
        eco_friendly,
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
        statementOfInfo,
        frontPageImg
      } = req.body;

      console.log("---BODY----->>>", req.body);

      // var { propertyImg, florePlansImg, frontPageImg, statementOfInfo } =
      //   req.files;

      if (!propertyImg || !florePlansImg || !statementOfInfo || !frontPageImg) {
        return res
          .status(HTTP.SUCCESS)
          .send({
            success: false,
            code: HTTP.NOT_ALLOWED,
            message: "upload All Images and File",
            data: {},
          });
      }

      if (price_display_checked == 'show_text_instead_of_price' && price_display.length == 0) {
        return res
          .status(HTTP.SUCCESS)
          .send({
            status: false,
            code: HTTP.NOT_FOUND,
            message: "Please enter display details.",
            data: {},
          });
      }

      if (
        // !Bedrooms ||
        // !Bathrooms ||
        !price ||
        !property_type ||
        !new_or_established_checked ||
        !lead_agent
      ) {
        return res
          .status(HTTP.SUCCESS)
          .send({
            status: false,
            code: HTTP.NOT_FOUND,
            message: "All fields are required!",
            data: {},
          });
      }

      // inspection_times = JSON.parse(inspection_times);
      var agent = JSON.parse(lead_agent);
      // var propertyImg = [];

      // for (const data of req.files.propertyImg) {
      //   propertyImg.push("uploads/property_image" + data.filename);
      // }

      // var plan = req.files.florePlansImg.find((item) => item);
      // var florePlansImg = "uploads/property_image" + plan.filename;

      // var statement = req.files.statementOfInfo.find((item) => item);
      // var statementOfInfo = "uploads/property_image" + statement.filename;

      // var frontPage = req.files.frontPageImg.find((item) => item);
      // var frontPageImg = "uploads/property_image" + frontPage.filename;

      var agencyId_Data = req.Data;

      inspection_times = JSON.parse(inspection_times);
      let indoor = JSON.parse(req.body.indoor_features);
      let outdoor = JSON.parse(req.body.outdoor_features);
      let heating = JSON.parse(req.body.heating_cooling);
      let eco = JSON.parse(req.body.eco_friendly);
      let climate = JSON.parse(req.body.climate_energy);
      let propertyImage = JSON.parse(req.body.propertyImg);
      let florImage = JSON.parse(req.body.florePlansImg);
      let statementPdf = JSON.parse(req.body.statementOfInfo);
      let frontImage = JSON.parse(req.body.frontPageImg);

      const locationData =
        street_address_number +
        "," +
        street_address_name +
        "," +
        suburb +
        ", " +
        municipality;
      const geoData = await adminagencyController.geocode(locationData);
      console.log("🚀 ~ ListingCreate ~ geoData:", geoData);

      if (req.body.status == "Sold") {
        const agentData = await admin_agent.findById({ _id: agent });
        let totalPrice = agentData.medianPrice + Number(req.body.price);
        let soldCount = agentData.property_sold + 1;
        console.log("🚀 ~ Listingedit ~ totalPrice:", totalPrice);
        console.log("🚀 ~ Listingedit ~ req.body.price:", req.body.price);
        console.log("🚀 ~ Listingedit ~ soldCount:", soldCount);
        agentData.medianPrice = totalPrice / soldCount;
        agentData.property_sold += 1;
        await agentData.save();
      }

      await new property_listing({
        agency_id,
        listing_type,
        property_type,
        status,
        new_or_established_checked,
        lead_agent: agent,
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
        location: {
          type: "Point",
          coordinates: [parseFloat(geoData.lng), parseFloat(geoData.lat)],
        },
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
        // other_features,

        established_property,
        new_construction,
        show_actual_price,
        show_text_instead_of_price,
        Hide_the_price_and_display_contact_agent,
        send_vendor_the_property_live_email_when_listing_is_published,
        send_vendor_a_weekly_campaign_activity_report_email,
        hide_street_address_on_listing,
        hide_street_view,

        outdoor_features: outdoor,
        indoor_features: indoor,
        heating_cooling: heating,
        eco_friendly: eco,
        climate_energy: climate,
        heading,
        discription,
        video_url,
        online_tour_1,
        online_tour_2,
        agency_listing_url,
        inspection_times,
        propertyImg: propertyImage,
        florePlansImg: florImage,
        frontPageImg: frontImage,
        statementOfInfo: statementPdf,
      }).save();

      if (
        (send_vendor_the_property_live_email_when_listing_is_published = true)
      ) {
        const newOtp = "Congratulations! your property is live now on La-Rosa";
        var sendMailData = {
          file_template: "./public/EmailTemplates/welcome.html",
          subject: "Congratulatiopn dear vendor Laro-sa",
          to: email ? email : null,
          // "username": `${checkVerified.firstname}`,0
          property: `${newOtp}`,
        };

        sendEmailOTP(sendMailData)
          .then((val) => {
            return res
              .status(HTTP.SUCCESS)
              .send({
                status: true,
                code: HTTP.SUCCESS,
                message: "Please check your email.",
                data: val,
              });
          })
          .catch((err) => {
            console.log(err);
            return res
              .status(HTTP.SUCCESS)
              .send({
                status: false,
                code: HTTP.BAD_REQUEST,
                message: "Unable to send email!",
                data: {},
              });
          });

        return res
          .status(HTTP.SUCCESS)
          .send({
            status: true,
            code: HTTP.SUCCESS,
            message: "Email send to the vendor!",
            data: {},
          });
      }

      return res
        .status(HTTP.SUCCESS)
        .send({
          status: true,
          code: HTTP.SUCCESS,
          message: "Property listed successfully",
          data: {},
        });
    } else {
      return res
        .status(HTTP.SUCCESS)
        .send({
          status: false,
          code: HTTP.UNAUTHORIZED,
          message: "Access denied. Please log in to continue.",
          data: {},
        });
    }
  } catch (error) {
    console.log(error);
    return res
      .status(HTTP.SUCCESS)
      .send({
        success: false,
        code: HTTP.INTERNAL_SERVER_ERROR,
        message: "Something went wrong!",
        data: {},
      });
  }
}

async function listingView(req, res) {
  try {
    var id = req.params.id;

    if (req.Data) {
      const property_data = await property_listing.findById({ _id: id });
      return res
        .status(HTTP.SUCCESS)
        .send({
          status: true,
          code: HTTP.SUCCESS,
          message: "property View",
          data: property_data,
        });
    } else {
      return res
        .status(HTTP.SUCCESS)
        .send({
          status: false,
          code: HTTP.UNAUTHORIZED,
          message: "Access denied. Please log in to continue.",
          data: {},
        });
    }
  } catch (error) {
    console.log(error);
    return res
      .status(HTTP.SUCCESS)
      .send({
        success: false,
        code: HTTP.INTERNAL_SERVER_ERROR,
        message: "Something went wrong!",
        data: {},
      });
  }
}

async function Listingedit(req, res) {
  try {
    if (req.body) {
      var id = req.params.id;
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
        // other_features,

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
        heating_cooling,
        eco_friendly,
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
        statementOfInfo,
        frontPageImg
      } = req.body;

      // let { propertyImg, florePlansImg, statementOfInfo, frontPageImg } =
      //   req.files;
      // var data_id = await property_listing.findOne({ agency_id: req.Data });
      inspection_times;

      // let agent = JSON.parse(lead_agent)
      // console.log("🚀 ~ Listingedit ~ agent:",lead_agent)

      if (price_display_checked == 'show_text_instead_of_price' && price_display.length == 0) {
        return res
          .status(HTTP.SUCCESS)
          .send({
            status: false,
            code: HTTP.NOT_FOUND,
            message: "Please enter display details.",
            data: {},
          });
      }

      if (!lead_agent) {
        return res
          .status(HTTP.SUCCESS)
          .send({
            success: false,
            code: HTTP.NOT_ALLOWED,
            message: "lead Agent is required",
            data: {},
          });
      }

      let indoor = JSON.parse(req.body.indoor_features);
      let outdoor = JSON.parse(req.body.outdoor_features);
      let heating = JSON.parse(req.body.heating_cooling);
      let eco = JSON.parse(req.body.eco_friendly);
      let climate = JSON.parse(req.body.climate_energy);
      inspection_times = JSON.parse(inspection_times);

      const locationData =
        req.body.street_address_number +
        "," +
        req.body.street_address_name +
        "," +
        req.body.suburb +
        ", " +
        req.body.municipality;
      const geoData = await adminagencyController.geocode(locationData);
      console.log("🚀 ~ ListingCreate ~ geoData:", geoData);

      if (req.body.status == "Sold") {
        const agentData = await admin_agent.findById({ _id: lead_agent });
        let totalPrice = agentData.medianPrice + Number(req.body.price);
        let soldCount = agentData.property_sold + 1;
        console.log("🚀 ~ Listingedit ~ totalPrice:", totalPrice);
        console.log("🚀 ~ Listingedit ~ req.body.price:", req.body.price);
        console.log("🚀 ~ Listingedit ~ soldCount:", soldCount);
        agentData.medianPrice = totalPrice / soldCount;
        agentData.property_sold += 1;
        await agentData.save();
      }
      let propertyImage = JSON.parse(req.body.propertyImg);
      let florImage = JSON.parse(req.body.florePlansImg);
      let statementPdf = JSON.parse(req.body.statementOfInfo);
      let frontImage = JSON.parse(req.body.frontPageImg);

      if (propertyImage.length > 0 || florImage.length > 0 ||
        statementPdf.length > 0 || frontImage.length > 0) {
        console.log("image update success")
        var arrayData = [];
        // console.log(typeof data);

        // for (var i of data) {
        //   arrayData.push("uploads/property_image" + i.filename);
        // }

        // plan = req.files.florePlansImg.find((item) => item);
        // florePlansImg = "uploads/property_image" + plan.filename;

        // statement = req.files.statementOfInfo.find((item) => item);
        // statementOfInfo = "uploads/property_image" + statement.filename;

        // frontPage = req.files.frontPageImg.find((item) => item);
        // frontPageImg = "uploads/property_image" + frontPage.filename;

        var doc = await property_listing.findById(id, {});

        var arr = [];
        arr.push(doc);

        // for (da of arr) {
        //   console.log(da._id);
        // }

        // var first = da.propertyImg;
        // var second = doc.florePlansImg;
        // var third = doc.statementOfInfo;
        // var fourth = doc.frontPageImg;

        // var firsts = [first];
        // var seconds = [second];
        // var thirds = [third];
        // var fourths = [fourth];

        // var firstsData = firsts.toString();
        // var secondsData = seconds.toString();
        // var thirdsData = thirds.toString();
        // var fourthsData = fourths.toString();

        // for (property of firsts) {
        //   // console.log(property);
        // }

        // for (pro of property) {
        //   // console.log(pro,"===============> final data");
        // }

        if (propertyImg.length > 0) {
          const data_ = await property_listing.findByIdAndUpdate(
            id,
            { propertyImg: propertyImage },
            { new: true }
          );
          if (!data_)
            return res
              .status(HTTP.SUCCESS)
              .send({
                status: false,
                code: HTTP.BAD_REQUEST,
                message: "Unable to update data!",
                data: {},
              });
        }
        if (florImage.length > 0) {
          const data_ = await property_listing.findByIdAndUpdate(
            id,
            { florePlansImg: florImage },
            { new: true }
          );
          if (!data_)
            return res
              .status(HTTP.SUCCESS)
              .send({
                status: false,
                code: HTTP.BAD_REQUEST,
                message: "Unable to update data!",
                data: {},
              });
        }
        if (statementPdf.length > 0) {
          const data_ = await property_listing.findByIdAndUpdate(
            id,
            { statementOfInfo: statementPdf },
            { new: true }
          );
          if (!data_)
            return res
              .status(HTTP.SUCCESS)
              .send({
                status: false,
                code: HTTP.BAD_REQUEST,
                message: "Unable to update data!",
                data: {},
              });
        }
        if (frontImage.length > 0) {
          const data_ = await property_listing.findByIdAndUpdate(
            id,
            { frontPageImg: frontImage },
            { new: true }
          );
          if (!data_)
            return res
              .status(HTTP.SUCCESS)
              .send({
                status: false,
                code: HTTP.BAD_REQUEST,
                message: "Unable to update data!",
                data: {},
              });
        }
        const updateData = await property_listing.findByIdAndUpdate(id, {
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
          location: {
            type: "Point",
            coordinates: [parseFloat(geoData.lng), parseFloat(geoData.lat)],
          },
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
          // other_features,
          established_property,
          new_construction,
          show_actual_price,
          show_text_instead_of_price,
          Hide_the_price_and_display_contact_agent,
          send_vendor_the_property_live_email_when_listing_is_published,
          send_vendor_a_weekly_campaign_activity_report_email,
          hide_street_address_on_listing,
          hide_street_view,
          outdoor_features: outdoor,
          indoor_features: indoor,
          climate_energy: climate,
          heating_cooling: heating,
          eco_friendly: eco,
          heading,
          discription,
          video_url,
          online_tour_1,
          online_tour_2,
          agency_listing_url,
          inspection_times,
        }, { new: true });

        if (updateData) {
          console.log("updateData", updateData)
          return res
            .status(HTTP.SUCCESS)
            .send({
              status: true,
              code: HTTP.SUCCESS,
              message: "Profile update",
            });
        }
      } else {
        console.log("image not update")
        const updateData = await property_listing.findByIdAndUpdate(id, {
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
          // other_features,
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
          climate_energy,
          heating_cooling,
          eco_friendly,
        },
          { new: true });
        if (updateData) {
          return res
            .status(HTTP.SUCCESS)
            .send({
              status: true,
              code: HTTP.SUCCESS,
              message: "Profile update",
            });
        }
      }
    } else {
      return res
        .status(HTTP.SUCCESS)
        .send({
          status: false,
          code: HTTP.UNAUTHORIZED,
          message: "Access denied. Please log in to continue.",
          data: {},
        });
    }
  } catch (error) {
    console.log(error);
    return res
      .status(HTTP.SUCCESS)
      .send({
        success: false,
        code: HTTP.INTERNAL_SERVER_ERROR,
        message: "Something went wrong!",
        data: {},
      });
  }
}

async function propertyDelete(req, res) {
  try {
    var id = req.params.id;

    if (req.Data) {
      await property_listing.findByIdAndDelete(id);
      return res
        .status(HTTP.SUCCESS)
        .send({ status: true, code: HTTP.SUCCESS, message: "property delete" });
    } else {
      return res
        .status(HTTP.SUCCESS)
        .send({
          status: false,
          code: HTTP.UNAUTHORIZED,
          message: "Access denied. Please log in to continue.",
          data: {},
        });
    }
  } catch (error) {
    console.log(error);
    return res
      .status(HTTP.SUCCESS)
      .send({
        success: false,
        code: HTTP.INTERNAL_SERVER_ERROR,
        message: "Something went wrong!",
        data: {},
      });
  }
}

async function viewallUser(req, res) {
  try {
    if (req.Data) {
      var User_data = await Register.find({ role: "user" });
      var arr = [];

      for (data of User_data) {
        arr.push({
          id: data.id,
          email: data.email,
          role: data.role,
          isActive: data.isActive,
          createdAt: data.createdAt
        });
      }
      arr.sort((a, b) => (a.createdAt < b.createdAt) ? 1 : -1);
      return res
        .status(HTTP.SUCCESS)
        .send({
          status: true,
          code: HTTP.SUCCESS,
          message: "User details.",
          data: arr,
        });
    } else {
      return res
        .status(HTTP.SUCCESS)
        .send({
          status: false,
          code: HTTP.UNAUTHORIZED,
          message: "Access denied. Please log in to continue.",
          data: {},
        });
    }
  } catch (error) {
    console.log(error);
    return res
      .status(HTTP.SUCCESS)
      .send({
        success: false,
        code: HTTP.INTERNAL_SERVER_ERROR,
        message: "Something went wrong!",
        data: {},
      });
  }
}

async function Userdelete(req, res) {
  try {
    var id = req.params.id;
    if (req.Data) {
      await Register.findByIdAndDelete(id, {});
      return res
        .status(HTTP.SUCCESS)
        .send({ status: true, code: HTTP.SUCCESS, message: "User Delete." });
    } else {
      return res
        .status(HTTP.SUCCESS)
        .send({
          status: false,
          code: HTTP.UNAUTHORIZED,
          message: "Access denied. Please log in to continue.",
          data: {},
        });
    }
  } catch (error) {
    console.log(error);
    return res
      .status(HTTP.SUCCESS)
      .send({
        success: false,
        code: HTTP.INTERNAL_SERVER_ERROR,
        message: "Something went wrong!",
        data: {},
      });
  }
}

async function userBlock(req, res) {
  try {
    if (req.body) {
      var id = req.params.id;
      const data = await Register.findById(id, {});

      if (data.isActive === true) {
        await Register.findByIdAndUpdate(id, { isActive: false });
        return res
          .status(HTTP.SUCCESS)
          .send({
            status: true,
            code: HTTP.SUCCESS,
            message: "User block.",
            data: {},
          });
      } else {
        await Register.findByIdAndUpdate(id, { isActive: true });
      }

      return res
        .status(HTTP.SUCCESS)
        .send({
          status: true,
          code: HTTP.SUCCESS,
          message: "User Unblock.",
          data: {},
        });
    } else {
      return res
        .status(HTTP.SUCCESS)
        .send({
          status: false,
          code: HTTP.UNAUTHORIZED,
          message: "Access denied. Please log in to continue.",
          data: {},
        });
    }
  } catch (error) {
    console.log(error);
    return res
      .status(HTTP.SUCCESS)
      .send({
        success: false,
        code: HTTP.INTERNAL_SERVER_ERROR,
        message: "Something went wrong!",
        data: {},
      });
  }
}

//==============================================================  google map  ======================================================================

//===============================================================================================================================

module.exports = {
  TotalCount,
  ViewAllAgency,
  ViewAllAgent,
  ViewAllproperty,
  Create,
  publishUpdate,
  AgencyEdit,
  AgencyDelete,
  ViewAgencyByid,
  ViewAgencyOfproperty,
  // Agent,
  AgentCreate,
  agentDelete,
  agentView,
  publishAgentUpdate,
  agentEdit,
  ListingCreate,
  listingView,
  Listingedit,

  propertyDelete,
  viewallUser,
  Userdelete,
  userBlock,
};
