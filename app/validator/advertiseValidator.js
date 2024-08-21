const { body } = require('express-validator');

const AdvertiseValidator = [
  body('advertiseType').notEmpty().withMessage('Advertise type is required'),
  body('companyName').notEmpty().withMessage('Company name is required'),
  body('email').notEmpty().withMessage('email is required').isEmail().withMessage('Enter a valid email address'),
  body('fullName').notEmpty().withMessage('Full name is required'),
  body('phoneNumber').notEmpty().withMessage('Phone number is required'),
]

const AddAdvertiseValidator = [
  body('advertiseType').notEmpty().withMessage('Advertise type is required'),
  body('title').notEmpty().withMessage('Title is required'),
  body('city').notEmpty().withMessage('City is required'),
  body('description').notEmpty().withMessage('Description is required'),
  body('link').notEmpty().withMessage('Link is required'),
  body('companyLogoImage').notEmpty().withMessage('Company logo is required'),
  body('advertiseImage').notEmpty().withMessage('Advertise property image is required'),
]

module.exports = { AdvertiseValidator, AddAdvertiseValidator }
