const { validationResult } = require('express-validator');
const HTTP = { SUCCESS: 200, NOT_ALLOWED: 405 };

const ErrorHandlerValidator = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMsg = errors.array().reduce((acc, err) => {
      acc[err.param] = err.msg;
      return acc;
    }, {});
    return res.status(HTTP.NOT_ALLOWED).json({
      status: false,
      code: HTTP.NOT_ALLOWED,
      message: errorMsg.undefined
    });
  }
  next();
};

module.exports = ErrorHandlerValidator;