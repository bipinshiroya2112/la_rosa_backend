const multer = require("multer");

const multerStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/property_image");
  },
  filename: (req, file, cb) => {
    const ext = file.mimetype.split("/")[1];
    cb(null, `/${file.fieldname}-${Date.now()}.${file.originalname}`);
  },
});

const maxSize = 50 * 1024 * 1024; //1 * 1000 * 1000;

const upload = multer({
  storage: multerStorage,
  limits: { fileSize: maxSize },

  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(jpg|jpeg|png|svg|pdf|mp4|webp|avif)$/)) {
      return cb(new Error("Please upload a valid image file"));
    }
    cb(undefined, true);
  },
}).fields([
  { name: "propertyImg", maxCount: 30 },
  { name: "florePlansImg", maxCount: 5 },
  { name: "frontPageImg", maxCount: 5 },
  { name: "statementOfInfo", maxCount: 5 }
])
module.exports = upload
