const express = require("express");
const router = express.Router();
const advertiseController = require('../controllers/advertise.controller');
const { AdvertiseValidator, AddAdvertiseValidator } = require("../validator/advertiseValidator");
const ErrorHandlerValidator = require("../validator/errorHandlerValidator");
const { authAgency } = require("../middlewares/verifyToken");

router.post('/advertise', AdvertiseValidator, ErrorHandlerValidator, advertiseController.addAdvertise)

router.get('/advertise/totalCount', authAgency, advertiseController.getAdvertiseCount)
router.get('/advertise/list', authAgency, advertiseController.getAdvertiseList)
router.get('/advertise/all/list', authAgency, advertiseController.getAdvertiseAllList)
router.post('/advertise/status/:id', advertiseController.statusUpdate);
router.post('/advertise/add', authAgency, AddAdvertiseValidator, ErrorHandlerValidator, advertiseController.createAdvertise)
router.get('/advertise/delete/:id', authAgency, advertiseController.deleteAdvertise)
router.post('/advertise/update/:id', authAgency, advertiseController.updateAdvertise)

router.get('/advertise/:id', advertiseController.getAdvertiseDetail);

router.get('/advertise/ads/list', authAgency, advertiseController.getAdvertiseAdsList)
router.post('/advertise/ads/status/:id', authAgency, advertiseController.updateAdvertiseStatus)

module.exports = router;