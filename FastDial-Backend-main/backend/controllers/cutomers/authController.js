// node and express imports
const { promisify } = require("util");

// third party imports
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

// local imports
const db = require("../../database/db");
const AppError = require("../../utils/appError");
const catchAsyncError = require("../../utils/catchAsyncError");
const { sendFast2OTP, VerifyFast2OTP } = require("../../middlewares/fast2sms");

const OTP_PROVIDER_FAILURE_MESSAGE =
  "Unable to send/verify OTP right now. Please try again shortly.";
const LOCAL_OTP_TTL_MS = 5 * 60 * 1000;
const localOtpStore = new Map();
const JWT_SECRET = process.env.JWT_SECRET || "local-dev-jwt-secret";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";
const DEFAULT_DUMMY_OTP = process.env.DUMMY_OTP || "123456";

const shouldUseLocalOtpFallback = () =>
  process.env.ENABLE_LOCAL_OTP_FALLBACK === "true" ||
  process.env.NODE_ENV !== "production" ||
  !process.env.SMS_ID ||
  !process.env.SMS_PASS ||
  !process.env.SMS_EMAIL;

const isDummyOtpAllowed = () =>
  process.env.DUMMY_OTP_ENABLED === "true" || process.env.NODE_ENV !== "production";

const issueCustomerLoginResponse = async (mobile, res) => {
  const searchCustomerSql = "SELECT * FROM CUSTOMERS WHERE mobile = ?";
  const existingCustomer = await db(searchCustomerSql, [mobile]);

  let customer_id;

  if (existingCustomer.length === 0) {
    const insertCustomerSql = "INSERT INTO CUSTOMERS (mobile) VALUES (?)";
    const result = await db(insertCustomerSql, [mobile]);
    customer_id = result.insertId;
  } else {
    customer_id = existingCustomer[0].customer_id;
  }

  const token = jwt.sign({ mobile, customer_id }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });

  return res.status(200).json({
    success: true,
    message: "OTP verified successfully",
    token,
    id: customer_id,
    new_user: existingCustomer.length === 0,
  });
};

exports.signup = catchAsyncError(async (req, res, next) => {
  const { mobile } = req.body;

  if (!mobile) return next(new AppError("Mobile number is required", 400));

  // Send OTP and persist verification ID in otp table.
  try {
    await sendFast2OTP(mobile);
  } catch (error) {
    if (!shouldUseLocalOtpFallback()) {
      return next(new AppError(OTP_PROVIDER_FAILURE_MESSAGE, 502));
    }

    const localOtp = String(Math.floor(100000 + Math.random() * 900000));
    localOtpStore.set(mobile, {
      otp: localOtp,
      expiresAt: Date.now() + LOCAL_OTP_TTL_MS,
    });
    console.log(`[LOCAL_OTP_FALLBACK] Mobile: ${mobile}, OTP: ${localOtp}`);

    return res.status(200).json({
      success: true,
      message: "OTP generated using local fallback",
      otp_sent: true,
      fallback: true,
      debug_otp: process.env.NODE_ENV !== "production" ? localOtp : undefined,
    });
  }

  res.status(200).json({
    success: true,
    message: "OTP sent successfully to mobile",
    otp_sent: true,
  });
});

exports.login = catchAsyncError(async (req, res, next) => {
  const { mobile, otp } = req.body;
  const normalizedOtp = String(otp || "").trim();

  if (!mobile || !normalizedOtp) {
    return next(new AppError("Mobile number and OTP are required", 400));
  }

  if (isDummyOtpAllowed() && normalizedOtp === DEFAULT_DUMMY_OTP) {
    return issueCustomerLoginResponse(mobile, res);
  }

  const localOtpEntry = localOtpStore.get(mobile);
  if (localOtpEntry) {
    if (Date.now() > localOtpEntry.expiresAt) {
      localOtpStore.delete(mobile);
      return next(new AppError("OTP expired. Please request a new OTP", 400));
    }

    if (normalizedOtp !== localOtpEntry.otp) {
      return next(new AppError("Invalid OTP", 400));
    }

    localOtpStore.delete(mobile);
    return issueCustomerLoginResponse(mobile, res);
  }

  const searchOtpSql =
    "SELECT * FROM otp WHERE mobile = ? ORDER BY created_at DESC LIMIT 1";
  const otpResult = await db(searchOtpSql, [mobile]);

  if (otpResult.length === 0) {
    return next(new AppError("No OTP found for this number", 404));
  }

  const storedOtp = otpResult[0];
  let otpVerified = false;
  try {
    otpVerified = await VerifyFast2OTP(storedOtp.vid, normalizedOtp);
  } catch (error) {
    return next(new AppError(OTP_PROVIDER_FAILURE_MESSAGE, 502));
  }

  if (!otpVerified) {
    return next(new AppError("Invalid OTP or verification failed", 400));
  }

  return issueCustomerLoginResponse(mobile, res);
});

exports.protect = catchAsyncError(async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return next(
      new AppError("You are not logged in! Please log in to get access.", 401),
    );
  }

  let decoded;
  try {
    decoded = jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return next(new AppError("Invalid or expired token", 401));
  }
  console.log("Decoded Token:", decoded);

  const searchUserSql = `SELECT * FROM CUSTOMERS WHERE mobile = ?`;
  const searchResult = await db(searchUserSql, [decoded.mobile]);
  const currentUser = searchResult[0];

  if (!currentUser) {
    return next(
      new AppError("The user belonging to this token no longer exists.", 401),
    );
  }

  req.user = currentUser;
  next();
});
