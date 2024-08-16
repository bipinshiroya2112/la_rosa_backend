const AdvertiseModel = require('../models/advertise.model')
const HTTP = require("../../constants/responseCode.constant");
const STATUS = require('../../constants/status.constant');
const Register = require('../models/register')
var generator = require('generate-password');
const { genSaltSync, hashSync, compareSync } = require("bcrypt");
const { sendAdvertiseEmail } = require('../../public/partials/utils');

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
    await AdvertiseModel.create({ advertiseType, companyName, email, fullName, phoneNumber, status: STATUS.PENDING })
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
    const details = await AdvertiseModel.find({});
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

const statusUpdate = async (req, res) => {
  try {
    const { id } = req.params;
    const { updateStatus } = req.body;

    const details = await AdvertiseModel.findOneAndUpdate(
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
        firstName: details.fullName
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


module.exports = {
  addAdvertise,
  getListAdvertise,
  statusUpdate
}
