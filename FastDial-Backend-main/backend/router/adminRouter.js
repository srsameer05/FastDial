const express = require("express");
const router = express.Router();

const authController = require("../controllers/admin/authController");
const adminController = require("../controllers/admin/admindataController");

router.post("/signup", authController.insertAdmin);
router.post("/login", authController.loginAdmin);

router.post("/login/forgetPassword", authController.forgetPassword);
router.put("/login/updatePassword", authController.updatePassword);
router.post("/login/verifyOtp", authController.verifyOtp);

router.use(authController.protect);

router.get(
  "/data/getSERVICE_CATEGORIES",
  adminController.getSERVICE_CATEGORIES,
);

router.post(
  "/data/insertSERVICE_CATEGORIES",
  adminController.insertSERVICE_CATEGORIES,
);

router.put(
  "/data/updateSERVICE_CATEGORIES",
  adminController.updateSERVICE_CATEGORIES,
);
router.delete(
  "/data/deleteSERVICE_CATEGORIES/:service_cat_id",
  adminController.deleteSERVICE_CATEGORIES,
);

router.get("/data/getSERVICES", adminController.getSERVICES);

router.post("/data/insertSERVICES", adminController.insertSERVICES);

router.put("/data/updateSERVICES", adminController.updateSERVICES);

router.delete(
  "/data/deleteSERVICES/:service_id",
  adminController.deleteSERVICES,
);

router.get("/data/getvendorscomplaints", adminController.getvendorscomplaints);

router.get("/data/getvendors", adminController.getvendors);

router.get(
  "/data/getcustomerservicedetails",
  adminController.getcustomerservice,
);

router.put("/data/updateservicebooking", adminController.updateservicebooking);

router.get("/data/getSUBSCRIPTIONS", adminController.getSUBSCRIPTIONS);
router.post("/data/insertSUBSCRIPTIONS", adminController.insertSUBSCRIPTIONS);
router.put("/data/updateSUBSCRIPTIONS", adminController.updateSUBSCRIPTIONS);
router.delete(
  "/data/deleteSUBSCRIPTIONS/:subscription_id",
  adminController.deleteSUBSCRIPTIONS,
);

router.get("/data/getcustomers", adminController.getcustomers);

router.get(
  "/data/getCUSTOMERCOMPLAINTS",
  adminController.getCUSTOMERCOMPLAINTS,
);

router.get("/data/getADMINS", adminController.getADMINS);
router.put("/data/updatevendors", adminController.updatevendors);

router.get("/data/getvendors_approve", adminController.getApprovedVendors);
router.get("/data/getVendorsToAssign", adminController.getVendorsToAssign);
router.get("/data/getvendors_reject", adminController.getRejectedVendors);
router.get("/data/getvendors_pending", adminController.getPendingVendors);

router.post("/data/insertvendor", adminController.insertvendor);
router.get(
  "/data/paymentdetails/:customer_id",
  adminController.getPaymentDetails,
);

router.get("/data/allpaymentdetails", adminController.getAllPaymentDetails);

router.get("/data/getvendorpaymentdetails", adminController.getVendorPayments);

router.get("/data/getADMINS", adminController.getADMINS);

router.get("/data/getallreview", adminController.getAllReviews);
router.get(
  "/data/getReviewsByVendorId/:vendor_id",
  adminController.getReviewsByVendorId,
);

router.get("/data/getblockvendors", adminController.getBlockedVendors);
router.get(
  "/data/getVendorsWithSubscription",
  adminController.getVendorsWithSubscription,
);

router.get("/data/getfreetrialvendors", adminController.getActiveVendors);

router.get(
  "/data/getVendorsCompletedTrialNoPurchase",
  adminController.getVendorsCompletedTrialNoPurchase,
);

module.exports = router;
