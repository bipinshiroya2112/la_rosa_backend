const express = require("express");
const router = express.Router();
const adminController = require('../controllers/admin_controller');
const { authAgency } = require("../middlewares/verifyToken");
const { create } = require("../models/register");
const agent_img = require("../middlewares/agent.upload");
const upload = require("../middlewares/upload");
const multer = require("multer");
const uploadWithOutFile = multer({
  limits: {
    fileSize: 50 * 1024 * 1024,
    fieldSize: 50 * 1024 * 1024,
  },
  storage: multer.memoryStorage(),
});
const property_upload = require("../middlewares/property.upload");

// =========================  page :- 1 =========================
// admin default sign up
// admin login

// =========================  view page :- 2 =========================
router.get('/admin/TotalCount', authAgency, adminController.TotalCount);
router.get('/admin/ViewAllAgency', authAgency, adminController.ViewAllAgency);
router.get('/admin/SelectAgency', authAgency, adminController.ViewAllAgency);
router.get('/admin/ViewAllAgent', authAgency, adminController.ViewAllAgent);
router.get('/admin/ViewAllproperty', authAgency, adminController.ViewAllproperty);

//=========================  page :- 3 =========================
router.post('/admin/Agency/create', authAgency, upload, adminController.Create);
router.post('/admin/Agency/publish/:id', authAgency, adminController.publishUpdate);
router.post('/admin/Agency/edit/:id', authAgency, upload, adminController.AgencyEdit);
router.post('/admin/Agency/delete/:id', authAgency, adminController.AgencyDelete);
router.get('/admin/Agency/view/:id', authAgency, adminController.ViewAgencyByid);
router.get('/admin/Listing/view/:id', authAgency, adminController.ViewAgencyOfproperty);

//=========================  page :- 4 =========================
// router.post('/admin/Agent/:id', authAgency, adminController.Agent);
router.post('/admin/Agent/create', agent_img.fields([{ name: "profileImg", maxCount: 2 }, { name: "coverProfileImg", maxCount: 2 }]), adminController.AgentCreate);
router.get('/admin/Agent/view/:id', authAgency, adminController.agentView);
router.post('/admin/Agent/publish/:id', authAgency, adminController.publishAgentUpdate);
router.post('/admin/Agent/edit/:id', authAgency, agent_img.fields([{ name: "profileImg", maxCount: 2 }, { name: "coverProfileImg", maxCount: 2 }]), adminController.agentEdit);
router.post('/admin/Agent/delete/:id', authAgency, adminController.agentDelete);

//=========================  page :- 5 =========================
router.post('/admin/Listing/create', upload, authAgency, adminController.ListingCreate);
router.post('/admin/Listing/view/:id', authAgency, adminController.listingView);
router.post('/admin/Listing/edit/:id', upload, authAgency, adminController.Listingedit);
router.post('/admin/Listing/delete/:id', authAgency, adminController.propertyDelete);

//=============================== user ============================
router.get("/admin/ViewAllUser", authAgency, adminController.viewallUser);
router.post("/admin/User/delete/:id", authAgency, adminController.Userdelete);
router.post('/userBlock/:id', adminController.userBlock);

//=============================== blog ============================
router.post('/admin/blog', authAgency, uploadWithOutFile.none(), adminController.createBlog)
router.get('/admin/blog', authAgency, adminController.getBlog)
router.get('/admin/blog/:id', authAgency, adminController.getByIdBlog)
router.put('/admin/blog/:id', authAgency, uploadWithOutFile.none(), adminController.updateBlog)
router.delete('/admin/blog/:id', authAgency, adminController.deleteBlog)

module.exports = router;