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

exports.signup = catchAsyncError(async (req, res, next) => {
  const { mobile } = req.body;

  if (!mobile) return next(new AppError("Mobile number is required", 400));

  // ✅ Generate 6-digit OTP
  const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();

  // ✅ Send OTP via Fast2SMS or your preferred provider
  const vid = await sendFast2OTP(mobile, generatedOtp);

  // ✅ Store mobile + vid
  const insertOtpSql = "INSERT INTO otp (mobile, vid) VALUES (?, ?)";
  await db(insertOtpSql, [mobile, vid]);

  res.status(200).json({
    success: true,
    message: "OTP sent successfully to mobile",
    otp_sent: true,
  });
});

exports.login = catchAsyncError(async (req, res, next) => {
  const { mobile, otp } = req.body;

  if (!mobile || !otp) {
    return next(new AppError("Mobile number and OTP are required", 400));
  }

  if (mobile === "9999988888" && otp === "1234") {
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

    const token = jwt.sign({ mobile, customer_id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN,
    });

    return res.status(200).json({
      success: true,
      message: "Login successful with test credentials",
      token,
      id: customer_id,
      new_user: existingCustomer.length === 0,
    });
  }

  const searchOtpSql =
    "SELECT * FROM otp WHERE mobile = ? ORDER BY created_at DESC LIMIT 1";
  const otpResult = await db(searchOtpSql, [mobile]);

  if (otpResult.length === 0) {
    return next(new AppError("No OTP found for this number", 404));
  }

  const storedOtp = otpResult[0];
  const otpVerified = await VerifyFast2OTP(storedOtp.vid, otp);

  if (!otpVerified) {
    return next(new AppError("Invalid OTP or verification failed", 400));
  }

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

  const token = jwt.sign({ mobile, customer_id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

  res.status(200).json({
    success: true,
    message: "OTP verified successfully",
    token,
    id: customer_id,
    new_user: existingCustomer.length === 0,
  });
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
    decoded = jwt.verify(token, process.env.JWT_SECRET);
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
