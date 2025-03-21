const express = require("express");
const router = express.Router();
const adminagencyController = require("../controllers/admin_agency_controller");
const searchController = require("../controllers/search.controller");
const propertyController = require("../controllers/property.controller");
const image_upload = require("../middlewares/upload");
const authadmin = require("../middlewares/verifyToken");
const upload = require("../middlewares/upload");
const {
  verifyToken,
  verifyResetPasswordToken,
} = require("../middlewares/verifyToken.js");
const { authAgency } = require("../middlewares/verifyToken.js");
const agent_img = require("../middlewares/agent.upload");
const property_upload = require("../middlewares/property.upload");
const passport = require("passport");

//======================== admin ===========================================

// router.post('/defaultAdmin', adminagencyController.deafultAdminsignup)
router.post("/admin/sign-in", adminagencyController.signin);
router.post("/admin/forgot-password", adminagencyController.forgotPassword);
router.post("/admin/update-password", adminagencyController.updatePassword);
router.post("/admin/reset-password", adminagencyController.setNewPassword);

//============================== agency =====================================

router.post("/agentadmin/Signup", adminagencyController.agencySignup);
router.post("/agentadmin/Signin", adminagencyController.agencySignin);
router.post(
  "/agentadmin/ForgotPassword",
  adminagencyController.agencyFPassword
);
router.post(
  "/agentadmin/SetNewPassword",
  adminagencyController.agencySetpassword
);

router.post(
  "/agentadmin/agentSetpassword",
  adminagencyController.agentSetpassword
);

router.get("/agentadmin/viewAllAgency", adminagencyController.viewAllAgency);

//============================== Agency Profile Manage =======================

// router.post('/AgencyProfile/Register',image_upload, adminagencyController.AgencyProfileRagister);
router.post(
  "/agency/ViewProfile",
  authAgency,
  adminagencyController.agencyViewProfile
);
router.post("/agency/ViewProfile_U", adminagencyController.agencyViewProfile_U);
router.post(
  "/agency/UpdateProfile",
  authAgency,
  adminagencyController.agencyUpdateProfile
);
router.post("/agency/Delete", authAgency, adminagencyController.agencyDelete);

//=================== Page : 21 Agency branding and images ====================

// router.post('/agency/branding', upload, adminagencyController.Agency_Branding_img)
// router.post('/agency/brandingView', authAgency, adminagencyController.Agency_Branding_View)
router.post(
  "/agency/branding_Update",
  upload,
  authAgency,
  adminagencyController.Agency_Branding_Update
);

//============================== agent Profile Manage ========================

router.post(
  "/Agency_Agent/Register",
  upload,
  authAgency,
  adminagencyController.agentregister
);
router.post(
  "/Agency_Agent/ViewProfile",
  upload,
  adminagencyController.agentViewProfile
);
router.post(
  "/Agency_Agent/UpdateProfile",
  upload,
  adminagencyController.agentUpdateProfile
);
router.post("/Agency_Agent/Delete", adminagencyController.agentDelete);
router.post(
  "/Agency_Agent/viewAllAgentsOfAgency",
  authAgency,
  adminagencyController.viewAllAgentsOfAgency
);
router.post(
  "/Agency_Agent/viewAllAgentsOfAgency_U",
  adminagencyController.viewAllAgentsOfAgency_U
);
router.post(
  "/Agency_Agent/viewAllAgents/:key",
  adminagencyController.viewAllAgents
);

//============================== Agency property listing =====================

router.post(
  "/Agency/property_listing",
  property_upload,
  authAgency,
  propertyController.propertyListing
);
router.post("/Agency/viewProperty", propertyController.viewProperty);
router.get(
  "/Agency/viewAgencyProperty",
  authAgency,
  propertyController.viewAgencyProperty
);
router.post("/Agency/propertyByAgency", propertyController.propertyByAgency);
router.post(
  "/Agency/property_update",
  property_upload,
  authAgency,
  propertyController.propertyUpdate
);
router.post("/Agency/viewAllProperty", propertyController.viewAllProperty);

//============================== Search user ====================================

router.post("/searchAgent", searchController.searchAgent);
router.post("/searchByAddress", searchController.searchByAddress);
router.post("/searchByAllAddress", searchController.searchByAllAddress);
router.post("/searchProperty", searchController.searchProperty);
router.post("/sortProperty", searchController.sortProperty);
router.post("/sortAgent", searchController.sortAgent);
router.post("/searchAgentBySuburb", searchController.searchAgentBySuburb);

router.post("/searchAgentsInSuburb", searchController.searchAgentsInSuburb);

//========================= agency sort properties ===============================

router.post("/sorting", adminagencyController.sortBy);
// router.post('/sortByAgent', authAgency, adminagencyController.sortByAgent);

router.post("/map/property", adminagencyController.mapsearch);

router.post("/map/agent", adminagencyController.mapAgent);

router.post("/vendorEmail", adminagencyController.vendorEmail);

module.exports = router;
