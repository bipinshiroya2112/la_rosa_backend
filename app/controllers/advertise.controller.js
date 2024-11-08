const AdvertiseUserModel = require('../models/advertise_user.model')
const HTTP = require("../../constants/responseCode.constant");
const STATUS = require('../../constants/status.constant');
const ROLE = require('../../constants/role.constant');
const Register = require('../models/register')
var generator = require('generate-password');
const { genSaltSync, hashSync, compareSync } = require("bcrypt");
const { sendAdvertiseEmail } = require('../../public/partials/utils');
const AdvertiseListModel = require('../models/advertise_list.model');

const addAdvertise = async (req, res) => {
  try {
    let { advertiseType, companyName, email, fullName, phoneNumber } = req.body;
    // check email exist in register detail
    const RegisterExists = await Register.findOne({ $or: [{ email: email }] });
    if (RegisterExists) {
      return res.status(HTTP.SUCCESS).send({
        status: false,
        code: HTTP.BAD_REQUEST,
        message: "Email already exists",
        data: {},
      });
    }
    await AdvertiseUserModel.create({ advertiseType, companyName, email, fullName, phoneNumber, status: STATUS.PENDING })
    return res.status(HTTP.SUCCESS).json({
      status: true,
      code: HTTP.SUCCESS,
      message: "advertise enquiry submitted.",
      data: {},
    });

  } catch (error) {
    console.error("Error add advertise:", error);
    return res.status(HTTP.SUCCESS).json({
      status: false,
      code: HTTP.INTERNAL_SERVER_ERROR,
      error: "Internal Server Error",
    });
  }
}

const getListAdvertise = async (req, res) => {
  try {
    const details = await AdvertiseUserModel.find({});
    return res.status(HTTP.SUCCESS).json({
      status: true,
      code: HTTP.SUCCESS,
      message: "Advertise list get successfully.",
      data: details,
    });
  } catch (error) {
    console.error("Error advertise list", error);
    res.status(HTTP.SUCCESS).json({
      status: false,
      code: HTTP.INTERNAL_SERVER_ERROR,
      error: "Internal Server Error",
    });
  }
}

const getAdvertiseDetail = async (req, res) => {
  try {
    const { id } = req.params;

    const details = await AdvertiseListModel.find({ _id: id });
    return res.status(HTTP.SUCCESS).json({
      status: true,
      code: HTTP.SUCCESS,
      message: "Get advertise successfully.",
      data: details,
    });
  } catch (error) {
    console.error("Error advertise ", error);
    res.status(HTTP.SUCCESS).json({
      status: false,
      code: HTTP.INTERNAL_SERVER_ERROR,
      error: "Internal Server Error",
    });
  }
}

const statusUpdate = async (req, res) => {
  try {
    const { id } = req.params;
    const { updateStatus } = req.body;

    const details = await AdvertiseUserModel.findOneAndUpdate(
      { _id: id },
      { $set: { status: updateStatus } },
      { new: true }
    );

    if (!details) {
      return res.status(HTTP.NOT_FOUND).json({
        status: false,
        code: HTTP.NOT_FOUND,
        error: "Advertise detail not found.",
      });
    }

    if (updateStatus === 'active') {
      const password = generator.generate({
        length: 8,
        numbers: true,
        symbols: true,
        lowercase: true,
        uppercase: true,
        strict: true
      });

      const salt = genSaltSync(10);

      await Register.create({
        email: details.email,
        password: hashSync(password, salt),
        role: ROLE.ADVERTISE,
        phoneNumber: details.phoneNumber,
        firstName: details.fullName,
      });

      var sendMailData = {
        file_template: "./public/EmailTemplates/advertiseUser.html",
        subject: "Congratulation dear vendor Laro-sa",
        to: details.email || null,
        password: password,
        email: details.email
      };

      try {
        const emailResponse = await sendAdvertiseEmail(sendMailData);
        return res.status(HTTP.SUCCESS).send({
          status: true,
          code: HTTP.SUCCESS,
          message: "Advertise status updated. Please check your email.",
          data: emailResponse,
        });
      } catch (err) {
        console.error(err);
        return res.status(HTTP.BAD_REQUEST).send({
          status: false,
          code: HTTP.BAD_REQUEST,
          message: "Unable to send email!",
          data: {},
        });
      }
    }

    return res.status(HTTP.SUCCESS).json({
      status: true,
      code: HTTP.SUCCESS,
      message: "Advertise status updated.",
      data: {},
    });

  } catch (error) {
    console.error("Error advertise status", error);
    return res.status(HTTP.INTERNAL_SERVER_ERROR).json({
      status: false,
      code: HTTP.INTERNAL_SERVER_ERROR,
      error: "Internal Server Error",
    });
  }
};

const createAdvertise = async (req, res) => {
  try {
    const { advertiseType, title, city, description, link, companyLogoImage, advertiseImage } = req.body
    const typeLimits = {
      top: 1,
      between: 10,
      vertical: 10,
    };
    const limit = typeLimits[advertiseType];
    if (limit === undefined) {
      return res.status(HTTP.SUCCESS).json({
        status: false,
        code: HTTP.BAD_REQUEST,
        message: "Invalid advertise type provided.",
      });
    }
    const existingAdsCount = await AdvertiseListModel.countDocuments({
      advertiseType,
      city: { $in: city },
    });
    if (existingAdsCount >= limit) {
      return res.status(HTTP.SUCCESS).json({
        status: false,
        code: HTTP.SUCCESS,
        message: `Advertisement type is occupied for this location`,
      });
    }
    await AdvertiseListModel.create({
      advertiseType,
      title,
      city,
      description,
      link,
      companyLogoImage,
      advertiseImage,
      addedBy: req.Data
    })
    return res.status(HTTP.SUCCESS).json({
      status: true,
      code: HTTP.SUCCESS,
      message: "Advertise add successfully.",
      data: {},
    });
  } catch (error) {
    console.error("Error add advertise", error);
    return res.status(HTTP.INTERNAL_SERVER_ERROR).json({
      status: false,
      code: HTTP.INTERNAL_SERVER_ERROR,
      error: "Internal Server Error",
    });
  }
}

const getAdvertiseList = async (req, res) => {
  try {
    if (req.Data) {
      const result = await AdvertiseListModel.find({ addedBy: req.Data });
      result.sort((a, b) => (a.createdAt < b.createdAt) ? 1 : -1);
      return res.status(HTTP.SUCCESS).json({
        status: true,
        code: HTTP.SUCCESS,
        message: "get Advertise list successfully.",
        data: result,
      });
    } else {
      const result = await AdvertiseUserModel.find({});
      result.sort((a, b) => (a.createdAt < b.createdAt) ? 1 : -1);
      return res.status(HTTP.SUCCESS).json({
        status: true,
        code: HTTP.SUCCESS,
        message: "get Advertise list successfully.",
        data: result,
      });
    }
  } catch (error) {
    console.error("Error advertise list", error);
    return res.status(HTTP.INTERNAL_SERVER_ERROR).json({
      status: false,
      code: HTTP.INTERNAL_SERVER_ERROR,
      error: "Internal Server Error",
    });
  }
}

const getAdvertiseAllList = async (req, res) => {
  try {
    if (req.user.role !== ROLE.ADMIN) {
      return res.status(HTTP.SUCCESS).send({
        success: false,
        code: HTTP.UNAUTHORIZED,
        message: "Access Denied! Unauthorized User",
        data: {},
      });
    }
    const result = await AdvertiseListModel.find({});
    result.sort((a, b) => (a.createdAt < b.createdAt) ? 1 : -1);
    return res.status(HTTP.SUCCESS).json({
      status: true,
      code: HTTP.SUCCESS,
      message: "get Advertise list successfully.",
      data: result,
    });
  } catch (error) {
    console.error("Error advertise list", error);
    return res.status(HTTP.INTERNAL_SERVER_ERROR).json({
      status: false,
      code: HTTP.INTERNAL_SERVER_ERROR,
      error: "Internal Server Error",
    });
  }
}

const getAdvertiseCount = async (req, res) => {
  try {
    if (req.Data) {
      const topList = await AdvertiseListModel.find({ addedBy: req.Data, advertiseType: "top" });
      const bannerList = await AdvertiseListModel.find({ addedBy: req.Data, advertiseType: "between" });
      const verticalList = await AdvertiseListModel.find({ addedBy: req.Data, advertiseType: "vertical" });

      return res.status(HTTP.SUCCESS).json({
        status: true,
        code: HTTP.SUCCESS,
        message: "Advertise count successfully.",
        data: {
          totalAdvertise: topList.length + bannerList.length + verticalList.length,
          topListLength: topList.length,
          bannerListLength: bannerList.length,
          verticalListLength: verticalList.length,
        },
      });
    }
  } catch (error) {
    console.error("Error advertise count", error);
    return res.status(HTTP.INTERNAL_SERVER_ERROR).json({
      status: false,
      code: HTTP.INTERNAL_SERVER_ERROR,
      error: "Internal Server Error",
    });
  }
}

const deleteAdvertise = async (req, res) => {
  try {
    const { id } = req.params;
    await AdvertiseListModel.deleteOne({ _id: id });
    return res.status(HTTP.SUCCESS).json({
      status: true,
      code: HTTP.SUCCESS,
      message: "Advertise deleted successfully.",
      data: {},
    });
  } catch (error) {
    console.error("Error advertise list", error);
    return res.status(HTTP.INTERNAL_SERVER_ERROR).json({
      status: false,
      code: HTTP.INTERNAL_SERVER_ERROR,
      error: "Internal Server Error",
    });
  }
}

const updateAdvertise = async (req, res) => {
  try {
    const { id } = req.params;
    const { advertiseType, title, city, description, link, companyLogoImage, advertiseImage } = req.body
    await AdvertiseListModel.updateOne({ _id: id }, {
      advertiseType,
      title,
      city,
      description,
      link,
      companyLogoImage,
      advertiseImage,
    });
    return res.status(HTTP.SUCCESS).json({
      status: true,
      code: HTTP.SUCCESS,
      message: "Advertise Updated successfully.",
      data: {},
    });
  } catch (error) {
    console.error("Error advertise update", error);
    return res.status(HTTP.INTERNAL_SERVER_ERROR).json({
      status: false,
      code: HTTP.INTERNAL_SERVER_ERROR,
      error: "Internal Server Error",
    });
  }
}

const getAdvertiseAdsList = async (req, res) => {
  const { address } = req.query;
  const currentAddress = address.toLowerCase();

  try {
    // Fetch ads by type filtered by address and sorted by creation date
    const topAds = await AdvertiseListModel.aggregate([
      { $match: { advertiseType: "top", approved_status: STATUS.APPROVED, city: { $in: [currentAddress] } } },
      { $sort: { createdAt: -1 } },
      { $limit: 1 }
    ]);

    const verticalAds = await AdvertiseListModel.aggregate([
      { $match: { advertiseType: "vertical", approved_status: STATUS.APPROVED, city: { $in: [currentAddress] } } },
      { $sort: { createdAt: -1 } },
      { $limit: 1 }
    ]);

    const betweenAds = await AdvertiseListModel.aggregate([
      { $match: { advertiseType: "between", approved_status: STATUS.APPROVED, city: { $in: [currentAddress] } } },
      { $sort: { createdAt: -1 } }
    ]);

    // Function to group ads for weekly rotation
    const groupAdsWeekly = (ads) => {
      const grouped = [];
      const adsPerGroup = 7;
      for (let i = 0; i < ads.length; i += adsPerGroup) {
        grouped.push(ads.slice(i, i + adsPerGroup));
      }
      return grouped;
    };

    // Group each ad type into weekly sets
    const groupedTopAds = groupAdsWeekly(topAds);
    const groupedVerticalAds = groupAdsWeekly(verticalAds);
    const groupedBetweenAds = groupAdsWeekly(betweenAds);

    // Determine current week in the month
    const currentDate = new Date();
    const currentDay = currentDate.getDate();
    let currentWeekIndex = Math.floor((currentDay - 1) / 7);

    // Function to get current week ads, resetting if needed
    const getCurrentWeekAds = (groupedAds) => {
      if (currentWeekIndex >= groupedAds.length) {
        currentWeekIndex = 0; // Reset to the first group if we exceed available groups
      }
      return groupedAds[currentWeekIndex] || [];
    };

    // Get ads for the current week for each type
    const currentWeekTopAds = getCurrentWeekAds(groupedTopAds);
    const currentWeekVerticalAds = getCurrentWeekAds(groupedVerticalAds);
    const currentWeekBetweenAds = getCurrentWeekAds(groupedBetweenAds);

    // Set status to true if ads haven’t been shown this week
    const updateStatus = async (ads) => {
      const hasShown = ads.some(ad => ad.status === true);
      if (!hasShown) {
        for (const ad of ads) {
          await AdvertiseListModel.updateOne({ _id: ad._id }, { status: true });
        }
      }
    };

    await updateStatus(currentWeekTopAds);
    await updateStatus(currentWeekVerticalAds);
    await updateStatus(currentWeekBetweenAds);

    return res.status(HTTP.SUCCESS).json({
      status: true,
      code: HTTP.SUCCESS,
      message: "Ads list fetched successfully.",
      data: {
        topAds: currentWeekTopAds,
        verticalAds: currentWeekVerticalAds,
        betweenAds: currentWeekBetweenAds
      }
    });
  } catch (error) {
    console.error("Error fetching ads:", error);
    return res.status(HTTP.INTERNAL_SERVER_ERROR).json({
      status: false,
      code: HTTP.INTERNAL_SERVER_ERROR,
      error: "Internal Server Error",
    });
  }
}
const updateAdvertiseStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body
    if (!status) {
      return res.status(HTTP.BAD_REQUEST).send({
        status: false,
        code: HTTP.BAD_REQUEST,
        message: "status required!",
        data: {},
      });
    }
    if (req.user.role === ROLE.ADMIN) {
      const updateAds = await AdvertiseListModel.updateOne({ _id: id }, { approved_status: status }, { new: true })
      if (updateAds.modifiedCount == 0) {
        return res.status(HTTP.NOT_FOUND).send({
          status: false,
          code: HTTP.BAD_REQUEST,
          message: "ads details not found!",
          data: {},
        });
      }
      return res.status(HTTP.SUCCESS).json({
        status: true,
        code: HTTP.SUCCESS,
        message: "Ads status updated.",
        data: {},
      });
    } else {
      return res.status(HTTP.SUCCESS).send({
        success: false,
        code: HTTP.UNAUTHORIZED,
        message: "Access Denied! Unauthorized User",
        data: {},
      });
    }
  } catch (error) {
    console.error("Error fetching ads status update:", error);
    return res.status(HTTP.INTERNAL_SERVER_ERROR).json({
      status: false,
      code: HTTP.INTERNAL_SERVER_ERROR,
      error: "Internal Server Error",
    });
  }
}

module.exports = {
  addAdvertise,
  getListAdvertise,
  statusUpdate,
  createAdvertise,
  getAdvertiseList,
  getAdvertiseCount,
  deleteAdvertise,
  getAdvertiseDetail,
  updateAdvertise,
  getAdvertiseAdsList,
  updateAdvertiseStatus,
  getAdvertiseAllList
}
