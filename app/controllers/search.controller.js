const express = require("express");
const mongoose = require("mongoose");
const admin_agent = require("../models/admin.agent");
const admin = require("../models/savesearch.model");
const adminagencyController = require("./admin_agency_controller");
const agency_listing = require("../models/property_listing");
const property_listing = require("../models/property_listing");
const HTTP = require("../../constants/responseCode.constant");
const { ObjectId } = require("mongodb");

//======================================================== Search Agents =========================================================================================

async function searchAgent(req, res) {
  console.log(req.body);
  let search = await admin_agent.find({
    $or: [
      { first_name: { $regex: req.body.first_name, $options: "i" } },
      { last_name: { $regex: req.body.last_name, $options: "i" } },
      { job_title: { $regex: req.body.job_title, $options: "i" } },
    ],
  });

  res.status(200).send(search);
}

//======================================================= Search Property ========================================================================================

// async function searchProperty(req, res) {
//   try {
//     const properties = await property_listing.find({});

//     const query = req.body;
//     // console.log("🚀 ~ searchProperty ~ query:", query);
//     let filteredProperties;

//     if (query) {
//       filteredProperties = properties.filter((property) => {
//         // console.log(property.land_size_square);
//         // console.log(
//         //   "🚀 ~ searchProperty ~ filteredProperties:",
//         //   Number(property.land_size_square) >= Number(query.size_of_land)
//         // );
//         return (
//           property.status.includes(query.status) &&
//           property.new_or_established_checked.includes(
//             query.new_or_established_checked
//           ) &&
//           property.property_type.includes(query.property_type) &&
//           property.Bedrooms.includes(query.Bedrooms) &&
//           Number(property.price) >= Number(query.price_min) &&
//           Number(property.price) <= Number(query.price_max) &&
//           Number(property.land_size_square) >= Number(query.size_of_land) &&
//           property.indoor_features.some((feature) =>
//             feature.includes(query.indoor_features)
//           ) &&
//           property.outdoor_features.some((feature) =>
//             feature.includes(query.outdoor_features)
//           ) &&
//           property.climate_energy.some((feature) =>
//             feature.includes(query.climate_energy)
//           )
//         );
//       });
//     }
//     console.log(
//       "🚀 ~ searchProperty ~ filteredProperties:",
//       filteredProperties
//     );
//     return res.status(HTTP.SUCCESS).send({
//       status: true,
//       code: HTTP.INTERNAL_SERVER_ERROR,
//       message: "Buy/123",
//       data: filteredProperties,
//     });
//   } catch (error) {
//     console.log("🚀 ~ searchProperty ~ error:", error);
//     return res.status(HTTP.SUCCESS).send({
//       status: false,
//       code: HTTP.INTERNAL_SERVER_ERROR,
//       message: "Something went wrong!",
//       data: {},
//     });
//   }
// }
// async function searchProperty(req, res) {
//   try {
//     const query = req.body;
//     console.log("🚀 ~ searchProperty ~ query:", query);

//     const pipeline = [];

//     pipeline.push({
//       $match: {
//         status: query.status,
//         new_or_established_checked: query.new_or_established_checked,
//         property_type: query.property_type,
//         Bedrooms: query.Bedrooms,
//         Bathrooms: query.Bathrooms,
//         price: {
//           $gte: Number(query.price_min),
//           $lte: Number(query.price_max)
//         },
//         land_size: {
//           $gte: Number(query.size_of_land)
//         },
//         outdoor_features: {
//           $elemMatch: { $in: query.outdoor_features}
//         },
//         indoor_features: {
//           $elemMatch: { $in: query.indoor_features }
//         },
//         climate_energy: {
//           $elemMatch: { $in: query.climate_energy }
//         }
//       }
//     });

//     const filteredProperties = await property_listing.aggregate(pipeline)

//     console.log("🚀 ~ searchProperty ~ filteredProperties:", filteredProperties.length);
//     return res.status(HTTP.SUCCESS).send({ "status": true, 'code': HTTP.INTERNAL_SERVER_ERROR, "message": "Buy/123", data: filteredProperties });
//   } catch (error) {
//     console.log("🚀 ~ searchProperty ~ error:", error);
//     return res.status(HTTP.SUCCESS).send({ "status": false, 'code': HTTP.INTERNAL_SERVER_ERROR, "message": "Something went wrong!", data: {} });
//   }
// }
// async function searchProperty(req, res) {
//   try {
//     const query = req.body;
//     console.log("🚀 ~ searchProperty ~ query:", query);

//     const pipeline = [];

//     const matchStage = {};

//     if (query.status !== undefined) {
//       matchStage.status = query.status;
//     }

//     if (query.new_or_established_checked !== undefined) {
//       matchStage.new_or_established_checked = query.new_or_established_checked;
//     }

//     if (query.property_type.length > 0) {
//       matchStage.property_type = { $in: query.property_type };
//     }

//     if (query.Bedrooms !== undefined) {
//       matchStage.Bedrooms = query.Bedrooms;
//     }

//     if (query.Bathrooms !== undefined) {
//       matchStage.Bathrooms = query.Bathrooms;
//     }

//     if (query.price_min && query.price_max) {
//       matchStage.price = {
//         $gte: Number(query.price_min),
//         $lte: Number(query.price_max),
//       };
//     }

//     // if (query.size_of_land !== undefined) {
//     //   matchStage.land_size = {
//     //     $gte: Number(query.size_of_land)
//     //   };
//     // }

//     if (query.outdoor_features && query.outdoor_features.length > 0) {
//       matchStage.outdoor_features = {
//         $elemMatch: { $in: query.outdoor_features },
//       };
//     }

//     if (query.indoor_features && query.indoor_features.length > 0) {
//       matchStage.indoor_features = {
//         $elemMatch: { $in: query.indoor_features },
//       };
//     }

//     if (query.climate_energy && query.climate_energy.length > 0) {
//       matchStage.climate_energy = {
//         $elemMatch: { $in: query.climate_energy },
//       };
//     }

//     if (Object.keys(matchStage).length > 0) {
//       pipeline.push({ $match: matchStage });
//     }
//     console.log(matchStage, "------------------------>>>>>");

//     const filteredProperties = await property_listing.aggregate(pipeline);

//     console.log(
//       "🚀 ~ searchProperty ~ filteredProperties:",
//       filteredProperties.length
//     );
//     return res.status(HTTP.SUCCESS).send({
//       status: true,
//       code: HTTP.INTERNAL_SERVER_ERROR,
//       message: "Buy/123",
//       data: filteredProperties,
//     });
//   } catch (error) {
//     console.log("🚀 ~ searchProperty ~ error:", error);
//     return res.status(HTTP.SUCCESS).send({
//       status: false,
//       code: HTTP.INTERNAL_SERVER_ERROR,
//       message: "Something went wrong!",
//       data: {},
//     });
//   }
// }

async function searchProperty(req, res) {
  try {
    const query = req.body;
    console.log("🚀 ~ searchProperty ~ query:", query);
    listings = [];
    const pipeline = [];

    const matchStage = {};

    // Check if any field is defined in the query
    const isAnyFieldDefined = Object.values(query).some(
      (value) => value !== undefined
    );

    if (isAnyFieldDefined) {
      if (query.status !== undefined) {
        matchStage.status = query.status;
      }

      if (query.new_or_established_checked !== undefined) {
        matchStage.new_or_established_checked =
          query.new_or_established_checked;
      }

      if (query.property_type.length > 0) {
        matchStage.property_type = { $in: query.property_type };
      }

      if (query.Bedrooms !== undefined) {
        if (query.Bedrooms != 'any') {
          matchStage.Bedrooms = query.Bedrooms;
        }
      }

      if (query.Bathrooms !== undefined) {
        if (query.Bathrooms != 'any') {
          matchStage.Bathrooms = query.Bathrooms;
        }
      }

      if (query.price_min && query.price_max) {
        matchStage.price = {
          $gte: Number(query.price_min),
          $lte: Number(query.price_max),
        };
      }

      // Add conditions for other fields as needed

      if (Object.keys(matchStage).length > 0) {
        pipeline.push({ $match: matchStage });
      }

      // console.log(matchStage, "------------------------>>>>>");
      // console.log("------------------------>>>>>", pipeline);

      const filteredProperties = await property_listing.aggregate(pipeline);
      for (const data of filteredProperties) {
        const agent = await admin_agent.findOne({ _id: data.lead_agent });
        var agentData = {
          name: agent.name,
          profileImg: agent.profileImg,
          agencyLogo: data.agency_id.agencyMediumLogo,
        };
        listings.push({
          lead_agent: agentData,
          price: data.price,
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
        });
      }
      return res.status(HTTP.SUCCESS).send({
        status: true,
        code: HTTP.SUCCESS,
        message: "Properties found",
        data: listings,
      });
    } else {
      // No search criteria provided, return an empty array
      return res.status(HTTP.SUCCESS).send({
        status: true,
        code: HTTP.SUCCESS,
        message: "No search criteria provided",
        data: [],
      });
    }
  } catch (error) {
    console.log("🚀 ~ searchProperty ~ error:", error);
    return res.status(HTTP.INTERNAL_SERVER_ERROR).send({
      status: false,
      code: HTTP.INTERNAL_SERVER_ERROR,
      message: "Something went wrong!",
      data: {},
    });
  }
}

// =========================================================== Serach Property By Address ======================================================================================

async function searchByAddress(req, res) {
  try {
    console.log(req.body);
    listings = [];
    const search = await property_listing
      .find({
        $or: [
          {
            street_address_number: {
              $regex: new RegExp("^" + req.body.key.trim(), "i"),
            },
            status: req?.body?.status,
          },
          {
            street_address_name: {
              $regex: new RegExp("^" + req.body.key.trim(), "i"),
            },
            status: req?.body?.status,
          },
          {
            suburb: { $regex: new RegExp("^" + req.body.key.trim(), "i") },
            status: req?.body?.status,
          },
          {
            municipality: {
              $regex: new RegExp("^" + req.body.key.trim(), "i"),
            },
            status: req?.body?.status,
          },
        ],
      })
      .populate("agency_id");

    for (const data of search) {
      const agent = await admin_agent.findOne({ _id: data.lead_agent });
      console.log(
        "🚀 ~ file: property.controller.js:1070 ~ viewAllProperty ~ agent:",
        agent
      );

      var agentData = {
        name: agent.name,
        profileImg: agent.profileImg,
        agencyLogo: data.agency_id.agencyMediumLogo,
      };
      console.log(
        "🚀 ~ file: property.controller.js:689 ~ viewAllProperty ~ agentData:",
        agentData
      );

      listings.push({
        lead_agent: agentData,
        price: data.price,
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
      });
    }
    console.log("🚀 ~ searchByAddress ~ search:", search);
    return res.status(HTTP.SUCCESS).send({
      status: true,
      code: HTTP.INTERNAL_SERVER_ERROR,
      message: "Properties",
      data: listings,
    });
  } catch (error) {
    console.log("🚀 ~ searchByAddress ~ error:", error);
    return res.status(HTTP.SUCCESS).send({
      status: false,
      code: HTTP.INTERNAL_SERVER_ERROR,
      message: "Something went wrong!",
      data: {},
    });
  }
}

// ====================================================== search all property by address =================================================================

async function searchByAllAddress(req, res) {
  try {
    const searchQuery = req?.body?.search;

    // Constructing a regex pattern to match partial address
    const regex = new RegExp(searchQuery?.trim(), "i"); // 'i' flag for case-insensitive matching

    // Searching for posts based on partial address match
    const search = await property_listing.find({
      street_address_name: { $regex: regex },
    });

    console.log("🚀 ~ searchByAddress ~ search:", search);
    return res.status(HTTP.SUCCESS).send({
      status: true,
      code: HTTP.SUCCESS,
      message: "Properties",
      data: search,
    });
  } catch (error) {
    console.log("🚀 ~ searchByAddress ~ error:", error);
    return res.status(HTTP.SUCCESS).send({
      status: false,
      code: HTTP.INTERNAL_SERVER_ERROR,
      message: "Something went wrong!",
      data: {},
    });
  }
}

// =========================================================== Sort Property =================================================================================================

async function sortProperty(req, res) {
  try {
    console.log("🚀 ~ sortProperty ~ req.body", req.body);

    if (req.body.sort_by == "priceAsending") {
      const properties = await property_listing
        .find({ status: req.body.status })
        .sort({ price: 1 });

      return res.status(HTTP.SUCCESS).send({
        status: true,
        code: HTTP.SUCCESS,
        message: "Properties",
        data: properties,
      });
    }
    if (req.body.sort_by == "priceDescending") {
      const properties = await property_listing
        .find({ status: req.body.status })
        .sort({ price: -1 });

      return res.status(HTTP.SUCCESS).send({
        status: true,
        code: HTTP.SUCCESS,
        message: "Properties",
        data: properties,
      });
    }
    if (req.body.sort_by == "dateAsending") {
      const properties = await property_listing
        .find({ status: req.body.status })
        .sort({ createdAt: 1 });

      return res.status(HTTP.SUCCESS).send({
        status: true,
        code: HTTP.SUCCESS,
        message: "Properties",
        data: properties,
      });
    }
    if (req.body.sort_by == "dateDescending") {
      const properties = await property_listing
        .find({ status: req.body.status })
        .sort({ createdAt: -1 });
      console.log("🚀 ~ sortProperty ~ properties:", properties.length);

      return res.status(HTTP.SUCCESS).send({
        status: true,
        code: HTTP.SUCCESS,
        message: "Properties",
        data: properties,
      });
    }
    if (req.body.sort_by == "DE") {
      var currentDate = new Date();
      const listing = await property_listing.find({ status: req.body.status });

      let arr = [];
      for (let data of listing) {
        if (data.inspection_times.length !== 0) {
          for (let i = 0; i < data.inspection_times.length; i++) {
            let time = data.inspection_times[i].show_date;
            let storedTime = new Date(time);
            console.log("🚀 ~ inspection ~ storedTime:", storedTime);

            if (storedTime > currentDate) {
              arr.push(data);
              console.log("🚀 ~ sortProperty ~ arr:", arr);
              console.log("-------->");
            }
          }
        }
      }

      return res.status(HTTP.SUCCESS).send({
        status: true,
        code: HTTP.SUCCESS,
        message: "inspections",
        data: arr,
      });
    }
  } catch (error) {
    console.log("🚀 ~ searchByAddress ~ error:", error);
    return res.status(HTTP.SUCCESS).send({
      status: false,
      code: HTTP.INTERNAL_SERVER_ERROR,
      message: "Something went wrong!",
      data: {},
    });
  }
}

//================================================================  sort agent   ===========================================================================

const sortAgent = async (req, res) => {
  try {
    console.log("🚀 ~ sortAgent ~ req.body----------->>>>>>>>>>>>>", req.body);

    const sortBy = req.body.sort_by;

    if (sortBy == "number_of_properties_sold" || sortBy == "total_sales_across_all_suburbs") {
      const agents = await admin_agent.aggregate([
        {
          $lookup: {
            from: "registers",
            localField: "agency_id",
            foreignField: "_id",
            as: "agencyDetails",
          },
        },
        {
          $addFields: {
            agencySmallLogo: {
              $arrayElemAt: ["$agencyDetails.agencySmallLogo", 0],
            },
            primary_color: {
              $arrayElemAt: ["$agencyDetails.primary_color", 0],
            },
          },
        },
      ]).sort({ property_sold: -1 });

      return res.status(200).send({
        status: true,
        code: 200,
        message: "Properties",
        data: agents,
      });
    }

    if (sortBy == "suburb_sales_and_performance") {
      const suburb = req.body.suburb;
      const result = await property_listing.aggregate([
        { $match: { suburb: suburb, status: "sold" } },
        { $group: { _id: null, soldPrices: { $push: "$price" } } },
        {
          $project: {
            medianSoldPrice: {
              $cond: {
                if: { $eq: [{ $size: "$soldPrices" }, 0] },
                then: null,
                else: {
                  $let: {
                    vars: {
                      sortedSoldPrices: {
                        $sortArray: {
                          input: "$soldPrices",
                          sortBy: 1
                        }
                      }, count: { $size: "$soldPrices" }
                    },
                    in: {
                      $cond: [
                        { $eq: [{ $mod: ["$$count", 2] }, 0] },
                        {
                          $avg: [
                            { $arrayElemAt: ["$$sortedSoldPrices", { $divide: ["$$count", 2] }] },
                            { $arrayElemAt: ["$$sortedSoldPrices", { $subtract: [{ $divide: ["$$count", 2] }, 1] }] },
                          ],
                        },
                        { $arrayElemAt: ["$$sortedSoldPrices", { $floor: { $divide: ["$$count", 2] } }] },
                      ],
                    },
                  },
                },
              },
            },
          },
        },
      ]);

      if (result.length === 0) {
        return res.status(404).send({ status: false, code: 404, message: "Suburb not found or no properties sold in the suburb", data: {} });
      }

      const medianSoldPrice = result[0].medianSoldPrice;
      return res.status(200).send({ status: true, code: 200, message: "Median sold price for suburb", data: { suburb: suburb, medianSoldPrice: medianSoldPrice } });
    }

    if (sortBy == "property_sales_as_leadagent") {
      const sortedAgents = await admin_agent.aggregate([
        {
          $lookup: {
            from: "property_listings",
            localField: "_id",
            foreignField: "lead_agent",
            as: "properties",
          },
        },
        {
          $lookup: {
            from: "registers",
            localField: "agency_id",
            foreignField: "_id",
            as: "agencyDetails",
          },
        },
        {
          $addFields: {
            primary_color: {
              $arrayElemAt: ["$agencyDetails.primary_color", 0],
            },
            agencySmallLogo: {
              $arrayElemAt: ["$agencyDetails.agencySmallLogo", 0],
            },
          },
        },
        {
          $addFields: {
            leadPropertiesCount: { $size: "$properties" },
          },
        },
        { $sort: { leadPropertiesCount: -1 } },
      ]);

      return res.status(200).send({
        status: true,
        code: 200,
        message: "Properties",
        data: sortedAgents,
      });
    }

    if (sortBy == "number_of_reviews") {
      const sortedAgents = await admin_agent.aggregate([
        {
          $lookup: {
            from: "registers",
            localField: "agency_id",
            foreignField: "_id",
            as: "agencyDetails",
          },
        },
        {
          $addFields: {
            primary_color: {
              $arrayElemAt: ["$agencyDetails.primary_color", 0],
            },
            agencySmallLogo: {
              $arrayElemAt: ["$agencyDetails.agencySmallLogo", 0],
            },
            reviewsCount: { $size: "$reviews" },
          },
        },
        { $sort: { reviewsCount: -1 } },
        { $project: { agencyDetails: 0 } },
      ]);

      return res.status(200).send({
        status: true,
        code: 200,
        message: "Properties",
        data: sortedAgents,
      });
    }

    if (sortBy == "median_sold_price") {
      const agents = await admin_agent.aggregate([
        {
          $lookup: {
            from: "registers",
            localField: "agency_id",
            foreignField: "_id",
            as: "agencyDetails",
          },
        },
        {
          $addFields: {
            primary_color: {
              $arrayElemAt: ["$agencyDetails.primary_color", 0],
            },
            agencySmallLogo: {
              $arrayElemAt: ["$agencyDetails.agencySmallLogo", 0],
            },
          },
        },
      ]).sort({ medianPrice: -1 });

      return res.status(200).send({
        status: true,
        code: 200,
        message: "Properties",
        data: agents,
      });
    }

    if (sortBy == "years_experience") {
      const currentYear = new Date().getFullYear();

      const sortedAgents = await admin_agent.aggregate([
        {
          $addFields: {
            experience: { $subtract: [currentYear, "$start_year_in_industry"] },
          },
        },
        { $sort: { experience: -1 } },
        {
          $lookup: {
            from: "registers",
            localField: "agency_id",
            foreignField: "_id",
            as: "agencyDetails",
          },
        },
        {
          $addFields: {
            primary_color: {
              $arrayElemAt: ["$agencyDetails.primary_color", 0],
            },
            agencySmallLogo: {
              $arrayElemAt: ["$agencyDetails.agencySmallLogo", 0],
            },
          },
        },
      ]);

      return res.status(200).send({
        status: true,
        code: 200,
        message: "Properties",
        data: sortedAgents,
      });
    }

  } catch (error) {
    console.log("🚀 ~ sortAgent ~ error:", error);
    return res.status(500).send({
      status: false,
      code: 500,
      message: "Something went wrong!",
      data: {},
    });
  }
};


//================================================================  Search Agent By Suburb  ==========================================================================

async function searchAgentBySuburb(req, res) {
  try {
    const key = req.body.key;
    // const agents = await admin_agent.aggregate([
    //   {
    //     $match: { $or: [{ suburb :{ $in : key }}, { municipality: key }] }
    //   },

    //   {
    //     $lookup: {
    //       from: "property_listings",
    //       localField: "_id",
    //       foreignField: "lead_agent",
    //       as: "properties"
    //     }
    //   },
    //   {
    //      $group: { _id: null, count: { $sum: 1 } }
    //   }

    // ])
    //============================================================================================

    //   let agentsData = []
    //   const data = await property_listing.find({ $or: [{ suburb: key }, { municipality: key }, { street_address_name: { $in: key } }] })

    //  let agent
    //   for (let i = 0; i<data.length; i++) {
    //     agent = await admin_agent.find({_id : data[i].lead_agent})
    //     console.log("🚀 ~ searchAgentBySuburb ~ agent:", data[i].lead_agent)

    //     agentsData.push({
    //       price: data[i].price,
    //       id: data[i]._id,
    //       frontPageImg: data[i].frontPageImg,
    //       suburb: data[i].suburb,
    //       street_address_number: data[i].street_address_number,
    //       street_address_name: data[i].street_address_name,
    //       municipality: data[i].municipality,
    //       lead_agent: data[i].lead_agent,
    //       agentImg : agent.profileImage
    //    })

    //   }

    return res.status(HTTP.SUCCESS).send({
      status: true,
      code: HTTP.SUCCESS,
      message: "Properties",
      data: data,
    });
  } catch (error) {
    console.log("🚀 ~ searchAgentBySuburb ~ error:", error);
    return res.status(HTTP.SUCCESS).send({
      status: false,
      code: HTTP.INTERNAL_SERVER_ERROR,
      message: "Something went wrong!",
      data: {},
    });
  }
}
//=============================================================================================================

async function searchAgentsInSuburb(req, res) {
  try {
    const suburb = req.body.suburb;

    const agents = await property_listing.aggregate([
      {
        $match: {
          $or: [
            { street_address_name: { $regex: suburb, $options: "i" } },
            { street_address_number: { $regex: suburb, $options: "i" } },
            { suburb: { $regex: suburb, $options: "i" } },
            { municipality: { $regex: suburb, $options: "i" } },
          ],
        },
      },
      {
        $group: {
          _id: "$lead_agent",
          property_ids: { $push: "$_id" },
        },
      },
      {
        $lookup: {
          from: "agents",
          localField: "_id",
          foreignField: "_id",
          as: "agent_details",
        },
      },
      {
        $lookup: {
          from: "registers",
          localField: "agent_details.agency_id",
          foreignField: "_id",
          as: "agency_details",
        },
      },
      {
        $unwind: "$agent_details",
      },
      {
        $lookup: {
          from: "property_listings",
          localField: "property_ids",
          foreignField: "_id",
          as: "property_details",
        },
      },
      {
        $project: {
          "agent_details._id": 1,
          "agent_details.name": 1,
          "agent_details.email": 1,
          "agent_details.reviews": 1,
          "agent_details.profileImg": 1,
          "agent_details.job_title": 1,
          "property_details.price": 1,
          "property_details.frontPageImg": 1,
          "property_details.address": 1,
          "property_details.status": 1,
          "property_details._id": 1,
          "agency_details._id": 1,
          "agency_details.principal_name": 1,
          "agency_details.agencySmallLogo": 1,
        },
      },
    ]);
    return res.status(HTTP.SUCCESS).send({
      status: true,
      code: HTTP.SUCCESS,
      message: "Properties",
      data: agents,
    });
  } catch (error) {
    console.log("🚀 ~ searchAgentsInSuburb ~ error:", error);
    return res.status(HTTP.SUCCESS).send({
      status: false,
      code: HTTP.INTERNAL_SERVER_ERROR,
      message: "Something went wrong!",
      data: {},
    });
  }
}

async function individualSuburb(req, res, next) {
  const suburb = req.body.suburb;

  const agents = await property_listing.aggregate([
    {
      $match: {
        $or: [
          { street_address_name: { $regex: suburb, $options: "i" } },
          { street_address_number: { $regex: suburb, $options: "i" } },
          { suburb: { $regex: suburb, $options: "i" } },
          { municipality: { $regex: suburb, $options: "i" } },
        ],
      },
    },
    {
      $group: {
        _id: "$lead_agent",
        property_ids: { $push: "$_id" },
      },
    },
    {
      $lookup: {
        from: "agents",
        foreignField: "_id",
        as: "agent_details",
      },
    },
    {
      $unwind: "$agent_details",
    },
    {
      $lookup: {
        from: "property_listings",
        localField: "property_ids",
        foreignField: "_id",
        as: "property_details",
      },
    },
  ]);
}

module.exports = {
  searchAgent,
  searchProperty,
  searchByAddress,
  sortProperty,
  sortAgent,
  searchAgentBySuburb,
  searchAgentsInSuburb,
  searchByAllAddress,
};
