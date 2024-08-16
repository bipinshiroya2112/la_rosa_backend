const express = require("express");
const router = express.Router();
const advertiseController = require('../controllers/advertise.controller');
const AdvertiseValidator = require("../validator/advertiseValidator");
const ErrorHandlerValidator = require("../validator/errorHandlerValidator");

// add advertise 
router.post('/advertise', AdvertiseValidator, ErrorHandlerValidator, advertiseController.addAdvertise)

// get advertise
router.get('/advertise/list', advertiseController.getListAdvertise);
router.post('/advertise/status/:id', advertiseController.statusUpdate);

module.exports = router;