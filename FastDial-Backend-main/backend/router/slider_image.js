const express = require("express");
const router = express.Router();
const multer = require("multer");
const upload = multer({ storage: multer.memoryStorage() });
const customersController = require("../controllers/cutomers/customersdataController");

router.get("/data/getsliderimages", customersController.getSLIDER_IMAGES);

router.post(
  "/data/insertsliderimage",
  upload.array("images"),
  customersController.insertSLIDER_IMAGES
);

router.put(
  "/data/updatesliderimage",
  upload.single("image"),
  customersController.updateSLIDER_IMAGES
);

router.delete(
  "/data/deletesliderimage/:id",
  customersController.deleteSLIDER_IMAGES
);

module.exports = router;
