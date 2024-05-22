const multer = require("multer");
const AVATAR_PATH = ("/uploads/agency_image");
const path = require("path")



const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "..","..", AVATAR_PATH))
  },
  filename: function (req, file, cb) {
    const ext = file.mimetype.split("/")[1];
    cb(null, `${file.fieldname}-${Date.now()}.${ext}`)
  }
})

const upload = multer({
  storage: storage
}).fields([
    { name : "agencySmallLogo"},
    { name : "agencyMediumLogo"},
    { name : "agencyLargeLogo"},
    { name : "commercialAgencySmallLogo"},
    { name : "commercialAgencyMediumLogo"},
    { name : "commercialAgencyLargeLogo"},
    { name : "commercialAgencyExtraLargeLogo"},
    { name : "heroImg"}
]);


module.exports = upload