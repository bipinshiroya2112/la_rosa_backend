const { body } = require('express-validator');

const AdvertiseValidator = [
  body('advertiseType').notEmpty().withMessage('Advertise type is required'),
  body('companyName').notEmpty().withMessage('Company name is required'),
  body('email').notEmpty().withMessage('email is required').isEmail().withMessage('Enter a valid email address'),
  body('fullName').notEmpty().withMessage('Full name is required'),
  body('phoneNumber').notEmpty().withMessage('Phone number is required'),
]

module.exports = AdvertiseValidator
