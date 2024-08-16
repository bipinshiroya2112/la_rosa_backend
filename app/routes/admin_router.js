const express = require("express");
const router = express.Router();
const adminController = require('../controllers/admin_controller');
const { authagency } = require("../middlewares/verifyToken");
const { create } = require("../models/register");
const agent_img = require("../middlewares/agent.upload");
const upload = require("../middlewares/upload");
const property_upload = require("../middlewares/property.upload");

// =========================  page :- 1 =========================
// admin default sign up
// admin login

// =========================  view page :- 2 =========================
router.get('/admin/TotalCount', authagency, adminController.TotalCount);
router.get('/admin/ViewAllAgency', authagency, adminController.ViewAllAgency);
router.get('/admin/SelectAgency', authagency, adminController.ViewAllAgency);
router.get('/admin/ViewAllAgent', authagency, adminController.ViewAllAgent);
router.get('/admin/ViewAllproperty', authagency, adminController.ViewAllproperty);

//=========================  page :- 3 =========================
router.post('/admin/Agency/create', authagency, upload, adminController.Create);
router.post('/admin/Agency/publish/:id', authagency, adminController.publishUpdate);
router.post('/admin/Agency/edit/:id', authagency, upload, adminController.AgencyEdit);
router.post('/admin/Agency/delete/:id', authagency, adminController.AgencyDelete);
router.get('/admin/Agency/view/:id', authagency, adminController.ViewAgencyByid);
router.get('/admin/Listing/view/:id', authagency, adminController.ViewAgencyOfproperty);

//=========================  page :- 4 =========================
// router.post('/admin/Agent/:id', authagency, adminController.Agent);
router.post('/admin/Agent/create', agent_img.fields([{ name: "profileImg", maxCount: 2 }, { name: "coverProfileImg", maxCount: 2 }]), adminController.AgentCreate);
router.get('/admin/Agent/view/:id', authagency, adminController.agentView);
router.post('/admin/Agent/publish/:id', authagency, adminController.publishAgentUpdate);
router.post('/admin/Agent/edit/:id', authagency, agent_img.fields([{ name: "profileImg", maxCount: 2 }, { name: "coverProfileImg", maxCount: 2 }]), adminController.agentEdit);
router.post('/admin/Agent/delete/:id', authagency, adminController.agentDelete);

//=========================  page :- 5 =========================
router.post('/admin/Listing/create', upload, authagency, adminController.ListingCreate);
router.post('/admin/Listing/view/:id', authagency, adminController.listingView);
router.post('/admin/Listing/edit/:id', upload, authagency, adminController.Listingedit);
router.post('/admin/Listing/delete/:id', authagency, adminController.propertyDelete);

//=============================== user ============================
router.get("/admin/ViewAllUser", authagency, adminController.viewallUser);
router.post("/admin/User/delete/:id", authagency, adminController.Userdelete);
router.post('/userBlock/:id', adminController.userBlock);

module.exports = router;