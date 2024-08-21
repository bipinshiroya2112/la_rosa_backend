const express = require("express");
const router = express.Router();
const advertiseController = require('../controllers/advertise.controller');
const { AdvertiseValidator, AddAdvertiseValidator } = require("../validator/advertiseValidator");
const ErrorHandlerValidator = require("../validator/errorHandlerValidator");
const { authUser } = require("../middlewares/verifyToken");

// add advertise 
router.post('/advertise', AdvertiseValidator, ErrorHandlerValidator, advertiseController.addAdvertise)

// get advertise
router.get('/advertise/list', advertiseController.getListAdvertise);
router.post('/advertise/status/:id', advertiseController.statusUpdate);

// add advertise
router.post('/advertise/add', authUser, AddAdvertiseValidator, ErrorHandlerValidator, advertiseController.createAdvertise)

module.exports = router;