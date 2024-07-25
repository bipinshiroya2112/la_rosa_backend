const { validationResult } = require('express-validator');
const { BAD_REQUEST, SUCCESS } = require('../../constants/responseCode.constant');

const ErrorHandlerValidator = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMsg = errors.array().reduce((acc, err) => {
      acc[err.param] = err.msg;
      return acc;
    }, {});
    return res.status(SUCCESS).json({
      status: false,
      code: BAD_REQUEST,
      message: errorMsg.undefined
    });
  }
  next();
};

module.exports = ErrorHandlerValidator;