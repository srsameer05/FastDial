const express = require("express");
const uploadfile = require("../middlewares/s3bucket");
const AppError = require("../utils/appError");

const multer = require("multer");
const authController = require("../controllers/vendors/authController");

const upload = multer({ storage: multer.memoryStorage() });

const router = express.Router();
router.post("/upload/file", upload.single("image"), async (req, res) => {
  try {
    const url = await uploadfile(req);
    res.status(200).send({ url });
  } catch (error) {
    res.status(503).send({
      message: error.message || "File upload failed",
    });
  }
});

module.exports = router;
