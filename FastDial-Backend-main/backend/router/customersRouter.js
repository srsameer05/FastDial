const express = require("express");
const router = express.Router();
const multer = require("multer");
const upload = multer({ storage: multer.memoryStorage() }); // memory storage for AWS S3 uploads
const authController = require("../controllers/cutomers/authController");
const customersController = require("../controllers/cutomers/customersdataController");

router.post("/signup", authController.signup);
router.post("/login", authController.login);
router.get("/data/getSERVICES", customersController.getSERVICES);

router.get(
  "/data/getSERVICE_CATEGORIES",
  customersController.getSERVICE_CATEGORIES,
);

// router.post("/login/forgetPassword", authController.forgetPassword);
// router.put("/login/updatePassword", authController.updatePassword);
// router.post("/login/verifyOtp", authController.verifyOtp);
router.use(authController.protect);
router.post("/registercustomer", customersController.registerCustomer);

router.get("/data/getcustomers", customersController.getcustomers);

router.get("/data/getcustomer", customersController.getCustomerByToken);
router.delete("/data/deletecustomers/:id", customersController.deletecustomers);
router.delete("/data/deletecustomer", customersController.deletecustomer);

router.put("/data/updatecustomer", customersController.updatecustomers);

// SERVICEBOOKINGS----->

router.post(
  "/data/insertservicebooking",
  customersController.insertservicebooking,
);
router.get("/data/getservicebooking", customersController.getservicebooking);
router.put(
  "/data/updateservicebooking",
  customersController.updateservicebooking,
);
router.delete(
  "/data/deleteservicebooking/:booking_id",
  customersController.deleteservicebooking,
);

router.post(
  "/data/insertCUSTOMERCOMPLAINTS",
  customersController.insertCUSTOMERCOMPLAINTS,
);
router.get(
  "/data/getCUSTOMERCOMPLAINTS",
  customersController.getCUSTOMERCOMPLAINTS,
);
router.put(
  "/data/updateCUSTOMERCOMPLAINTS",
  customersController.updateCUSTOMERCOMPLAINTS,
);
router.delete(
  "/data/deleteCUSTOMERCOMPLAINTS/:complaint_id",
  customersController.deleteCUSTOMERCOMPLAINTS,
);

// get services provided by admin--->

router.get(
  "/data/getcustomerservicedetails",
  customersController.getcustomerservice,
);
// get service categories------>

// paymnets--------->
router.post("/initiate", customersController.initiatePayment);
router.post("/verify", customersController.verifyPayment);
router.get("/getallpayments", customersController.getAllPayments);

router.post(
  "/initiatepayment",
  customersController.initiatePaymentFromServicesTable,
);
router.post(
  "/verifypayment",
  customersController.verifyPaymentFromServicesTable,
);
router.get(
  "/getpaymentsdetails",
  customersController.getServicesTablePaymentDetails,
);

router.get("/data/paymentdetails", customersController.getPaymentDetails);

router.get("/data/getPaymentDetail", customersController.getPaymentDetail);

router.get(
  "/data/getVENDORS_SERVICES_BY_CATEGORY/:service_cat_id",
  customersController.getVendorsByServiceCategory,
);

router.get("/data/getvendors", customersController.getvendors);
router.get(
  "/data/getVendorsForCustomer",
  customersController.getVendorsForCustomer,
);

router.get("/data/getsliderimages", customersController.getSLIDER_IMAGES);

router.post(
  "/data/insertsliderimage",
  upload.array("images"),
  customersController.insertSLIDER_IMAGES,
);

router.put(
  "/data/updatesliderimage",
  upload.single("image"),
  customersController.updateSLIDER_IMAGES,
);

router.delete(
  "/data/deletesliderimage/:id",
  customersController.deleteSLIDER_IMAGES,
);

router.get(
  "/data/getallvendorwithservices",
  customersController.getAllVendorsWithServices,
);

router.post("/data/bookinglater", customersController.bookServiceLater);

router.get("/data/getREVIEWS", customersController.getREVIEWS);

router.post("/data/insertREVIEWS", customersController.insertREVIEWS);

router.put("/data/updateREVIEWS", customersController.updateREVIEWS);

router.delete(
  "/data/deleteREVIEWS/:review_id",
  customersController.deleteREVIEWS,
);

router.get(
  "/data/getcompletedbookings",
  customersController.getCompletedBookingwithoutid,
);

router.get(
  "/data/getcompletedbooking/:customer_id",
  customersController.getCompletedBookingwithid,
);

// router.get(
//   "/data/getcompletedbooking",
//   customersController.getCompletedBooking
// );
router.get(
  "/data/getcancelledbookings",
  customersController.getCancelledBookingwithoutid,
);
router.get(
  "/data/getcancelledbooking/:customer_id",
  customersController.getCancelledBookingwithid,
);
// getUpcomingServiceBookings

router.get(
  "/data/getUpcomingServiceBookings/:customer_id",
  customersController.getUpcomingServiceBookings,
);
router.get(
  "/data/getUpcomingServiceBooking",
  customersController.getUpcomingServiceBooking,
);

router.post("/data/insertaddress", customersController.insertcustomer_address);
router.get(
  "/data/getcustomeraddress",
  customersController.getCustomerAddresses,
);

router.delete(
  "/data/deleteaddress/:address_id",
  customersController.deleteCustomerAddress,
);
router.put("/data/updateaddress", customersController.updateCustomerAddress);

router.post("/data/addfavourite", customersController.addFavouriteService);
router.get("/data/getfavourites", customersController.getFavouriteServices);
router.delete(
  "/data/removefavourite/:service_id",
  customersController.removeFavouriteService,
);

router.post("/tracking/start", customersController.startLocationTracking);
router.post("/tracking/update", customersController.updateLocation);
router.post("/tracking/stop", customersController.stopLocationTracking);

router.get("/data/getnotifications", customersController.getNotifications);
router.put(
  "/data/marknotificationread",
  customersController.markNotificationRead,
);

router.get(
  "/data/getVendorLocationTracking/:booking_id",
  customersController.getVendorLocationTracking,
);
module.exports = router;
