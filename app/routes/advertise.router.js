const express = require("express");
const router = express.Router();
const advertiseController = require('../controllers/advertise.controller');
const { AdvertiseValidator, AddAdvertiseValidator } = require("../validator/advertiseValidator");
const ErrorHandlerValidator = require("../validator/errorHandlerValidator");
const { authagency } = require("../middlewares/verifyToken");

router.post('/advertise', AdvertiseValidator, ErrorHandlerValidator, advertiseController.addAdvertise)

router.get('/advertise/totalCount', authagency, advertiseController.getAdvertiseCount)
router.get('/advertise/list', authagency, advertiseController.getAdvertiseList)
router.get('/advertise/all/list', authagency, advertiseController.getAdvertiseAllList)
router.post('/advertise/status/:id', advertiseController.statusUpdate);
router.post('/advertise/add', authagency, AddAdvertiseValidator, ErrorHandlerValidator, advertiseController.createAdvertise)
router.get('/advertise/delete/:id', authagency, advertiseController.deleteAdvertise)
router.post('/advertise/update/:id', authagency, advertiseController.updateAdvertise)

router.get('/advertise/:id', advertiseController.getAdvertiseDetail);

router.get('/advertise/ads/list', authagency, advertiseController.getAdvertiseAdsList)
router.post('/advertise/ads/status/:id', authagency, advertiseController.updateAdvertiseStatus)

module.exports = router;