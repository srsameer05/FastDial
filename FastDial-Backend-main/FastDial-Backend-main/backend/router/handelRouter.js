const express = require("express");
const uploadfile = require("../middlewares/s3bucket");

const multer = require("multer");
const authController = require("../controllers/vendors/authController");

const upload = multer({ storage: multer.memoryStorage() });

const router = express.Router();
router.post("/upload/file", upload.single("image"), async (req, res) => {
  let url = await uploadfile(req);
  res.status(200).send({ url: url });
});

module.exports = router;
