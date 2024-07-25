const express = require("express");
const router = express.Router();
const userControllers = require("../controllers/user.controller");
const userdetaislControllers = require("../controllers/userdetails.controller");
const propertyControllers = require("../controllers/property.controller");

const {
  verifyToken,
  verifyResetPasswordToken,
  authagency,
} = require("../middlewares/verifyToken");
const { authUser } = require("../middlewares/verifyToken");
const { auth } = require("../middlewares/verifyToken");
const ErrorHandlerValidator = require("../validator/errorHandlerValidator");
const AdvertiseValidator = require("../validator/advertiseValidator");

//=============================== Authentication ===================================
// signup
router.post("/signup", userControllers.signup);
router.get("/dashboard", userControllers.dashboard);

//signin user
router.post("/signin", userControllers.Login);
router.post("/login-with-google", userControllers.loginWithGoogle);
router.post("/login-with-facebook", userControllers.loginWithFacebook);
router.post("/forgotPassword", userControllers.forgotPassword);
router.post("/updatePassword", authUser, userControllers.updatePassword);

router.post("/setNewPassword", userControllers.setNewPassword);

// router.post('/logout', authUser, userControllers.logout)

router.post("/logout", authUser, userControllers.logout);
router.post("/logoutFromAll", authUser, userControllers.logoutFromAll);

//=================== User Details ======================================

// router.post('/userData', userdetaislControllers.userData)
router.post("/verifyOtp", userControllers.verifyOtp);
router.post("/resendOtp", userControllers.resendOtp);
router.get("/search/:key", userdetaislControllers.searchUser);

//=================== Manage user profile ================================

router.get("/getUserProfile", authUser, userControllers.getUserProfile);
router.put("/updateProfile", authUser, userControllers.updateProfile);
router.post("/verifyMail", authUser, userControllers.verifyMail);

// =================== Property Details===================================

router.post("/sendPropertyDetails", propertyControllers.sendPropertyDetails);
router.post("/agentReview/:id", propertyControllers.agentReview);
router.post("/agencyReview", propertyControllers.agencyReview);
router.post("/sendEnquiry", authUser, propertyControllers.sendEnquiry);
// router.post('/inspection', propertyControllers.inspection);
router.post("/addToFavorites", authUser, userControllers.addToFavorites);
router.post("/savedProperty", authUser, userControllers.savedProperty);

router.get("/inspection", userControllers.inspection);

router.get("/get/enquiries", authagency, propertyControllers.getEnquiries);
router.get("/get/appraisal", authagency, propertyControllers.getAppraisal);

router.post("/SaveSearch", auth, userControllers.SaveSearch);
router.post("/SearchShow", auth, userControllers.SearchShow);
router.post("/Searchdelete/:id", auth, userControllers.Searchdelete);
router.post("/NumberOfPropertiesSold", userControllers.NumberOfPropertiesSold);
router.post(
  "/Property_sales_as_lead_agent",
  userControllers.Property_sales_as_lead_agent
);
router.post("/Number_of_reviews", userControllers.Number_of_reviews);
router.post("/Years_experience", userControllers.Years_experience);

router.post("/comparision", userControllers.compareAgents);

router.post("/contact_us", userControllers.contact_us);
router.get("/propaties", userControllers.propaties);
router.get("/latestagent", userControllers.latestAgent);

router.post('/advertise', AdvertiseValidator, ErrorHandlerValidator, userControllers.addAdvertise)

router.post("/deleteAccount", userControllers.deleteAccount);
router.get("/signOutAll", userControllers.signOutAll);
router.get("/propertyData/:id", userControllers.propertyData);
module.exports = router;
