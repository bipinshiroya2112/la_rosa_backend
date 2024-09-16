const AdvertiseUserModel = require('../models/advertise_user.model')
const HTTP = require("../../constants/responseCode.constant");
const STATUS = require('../../constants/status.constant');
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
        role: 'advertise',
        phoneNumber: details.phoneNumber,
        firstName: details.fullName,
      });

      var sendMailData = {
        file_template: "./public/EmailTemplates/create_client.html",
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
  try {
    const { address } = req.query
    const currentAddress = address.toLowerCase();
    const topAds = await AdvertiseListModel.aggregate([{
      $match: {
        advertiseType: "top",
        city: { $in: [currentAddress] }
      }
    }, { $sort: { createdAt: -1 } }]);

    const verticalAds = await AdvertiseListModel.aggregate([{
      $match: {
        advertiseType: "vertical",
        city: { $in: [currentAddress] }
      }
    },
    { $sort: { createdAt: -1 } }]);

    const betweenAds = await AdvertiseListModel.aggregate([{
      $match: {
        advertiseType: "between",
        city: { $in: [currentAddress] }
      }
    },
    { $sort: { createdAt: -1 } }]);

    return res.status(HTTP.SUCCESS).json({
      status: true,
      code: HTTP.SUCCESS,
      message: "get Ads list successfully.",
      data: { topAds, verticalAds, betweenAds },
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
  getAdvertiseAdsList
}
