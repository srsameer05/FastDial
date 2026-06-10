const express = require("express");
const router = express.Router();

const authController = require("../controllers/vendors/authController");
const vendorController = require("../controllers/vendors/vendordataController");
const blockIfNotSubscribed = require("../middlewares/blockunsubscribe");

router.post("/signup", authController.insertVendor);
router.post("/login", authController.loginVendor);

router.get(
  "/data/service_with_category",
  vendorController.service_with_category
);

router.post("/login/forgetPassword", authController.forgetPassword);
router.put("/login/updatePassword", authController.updatePassword);
router.post("/login/verifyOtp", authController.verifyOtp);

router.use(authController.protect);

router.get("/data/getvendors", vendorController.getvendors);
router.put("/data/updatevendors", vendorController.updatevendors);
router.delete("/data/deletevendors/:vendor_id", vendorController.deletevendors);
router.delete("/data/deletevendor", vendorController.deletevendorswithoutid);

router.get("/getadmin", vendorController.getadmin);

router.get(
  "/data/getvendorprofile/:vendor_id",
  vendorController.getVendorProfile
);

router.post(
  "/data/insertvendorscomplaints",
  vendorController.insertvendorscomplaints
);
router.get("/data/getvendorscomplaints", vendorController.getvendorscomplaints);
router.put(
  "/data/updatevendorscomplaints",
  vendorController.updatevendorscomplaints
);
router.delete(
  "/data/deletevendorscomplaints/:vend_comp_id",
  vendorController.deletevendorscomplaints
);

// get customer services ------>
router.get(
  "/data/getcustomerservices/:vendor_id",
  vendorController.getcustomerservices
);

router.get(
  "/data/getacceptedbookings/:vendor_id",
  vendorController.getAcceptedBookings
);

router.get(
  "/data/getCompletedBookings/:vendor_id",
  vendorController.getCompletedBookings
);
router.get(
  "/data/getCancelledBookings/:vendor_id",
  vendorController.getCancelledBookings
);

router.get(
  "/data/getCancelledBookingsCount/:vendor_id",
  vendorController.getCancelledBookingsPerMonth
);

router.get(
  "/data/getCompletedBookingsCount/:vendor_id",
  vendorController.getCompletedBookingsPerMonth
);

router.get(
  "/data/getTotalServiceRequestsPerMonthCount/:vendor_id",
  vendorController.getTotalServiceRequestsPerMonth
);

router.get(
  "/data/getVendorEarnings/:vendor_id",
  vendorController.getVendorEarnings
);

router.put("/data/updateservicebooking", vendorController.updateservicebooking);

router.get("/data/getSUBSCRIPTIONS", vendorController.getSUBSCRIPTIONS);
router.put("/data/updateSUBSCRIPTIONS", vendorController.updateSUBSCRIPTIONS);

router.post("/create-order", vendorController.createSubscriptionPayment);
router.post("/verifypayment", vendorController.verifyPayment);
router.get(
  "/getvendorpaymentdetails/:vendor_id",
  vendorController.getVendorPayments
);
router.get("/data/getvendorpaymentdetail", vendorController.getVendorPayment);

router.get("/data/getVENDOR_SERVICES", vendorController.getVENDOR_SERVICES);

router.delete(
  "/data/deleteVENDOR_SERVICES/:id",
  vendorController.deleteVENDOR_SERVICES
);

router.get("/data/getSERVICES", vendorController.getSERVICES);
router.put("/data/updateSERVICES", vendorController.updateSERVICES);

router.get(
  "/data/getSERVICE_CATEGORIES",
  vendorController.getSERVICE_CATEGORIES
);
router.get("/data/getCUSTOMERS", vendorController.getCUSTOMERS);
router.get(
  "/data/getbookedcustomers",
  vendorController.getCustomersWithBookingsForVendor
);

router.get("/data/getvendor_services", vendorController.getVENDOR_SERVICES);

router.put(
  "/data/updatevendor_services",
  vendorController.updateVENDOR_SERVICES
);

router.get(
  "/data/getcustomerreview/:vendor_id",
  vendorController.getCustomerReviews
);

router.get("/data/getallcustomerreview", vendorController.getAllReviews);

router.get(
  "/data/paymentdetails/:customer_id",
  vendorController.getPaymentDetails
);

router.get(
  "/data/paymentdetail/:customer_id",
  vendorController.getPaymentDetail
);

router.get(
  "/data/checkVendorSubscriptionStatus",
  vendorController.checkVendorSubscriptionStatus
);

// Real-time location tracking routes
router.post("/tracking/start", vendorController.startLocationTracking);
router.post("/tracking/update", vendorController.updateLocation);
router.post("/tracking/stop", vendorController.stopLocationTracking);

router.get(
  "/data/vendorsubscription",
  vendorController.vendor_subscription_view
);

module.exports = router;
