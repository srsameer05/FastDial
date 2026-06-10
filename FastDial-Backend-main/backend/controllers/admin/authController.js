const { promisify } = require("util");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const db = require("../../database/db");
const AppError = require("../../utils/appError");
const catchAsyncError = require("../../utils/catchAsyncError");
const { sendFast2OTP, VerifyFast2OTP } = require("../../middlewares/fast2sms");

const DEFAULT_ADMIN_EMAIL = process.env.DEFAULT_ADMIN_EMAIL || "admin@quickserve.local";
const DEFAULT_ADMIN_NAME = process.env.DEFAULT_ADMIN_NAME || "Default Admin";
const DEFAULT_ADMIN_PASSWORD = process.env.DEFAULT_ADMIN_PASSWORD || "Admin@12345";
const DEFAULT_ADMIN_PHONE = process.env.DEFAULT_ADMIN_PHONE || "9999999999";

const ensureDefaultAdminExists = async () => {
  const existingAdmin = await db("SELECT admin_id FROM ADMINS WHERE email = ?", [
    DEFAULT_ADMIN_EMAIL,
  ]);

  if (existingAdmin.length > 0) {
    return;
  }

  const hashedPassword = await bcrypt.hash(DEFAULT_ADMIN_PASSWORD, 10);
  await db(
    "INSERT INTO ADMINS (admin_name, email, password, phone, image) VALUES (?, ?, ?, ?, ?)",
    [DEFAULT_ADMIN_NAME, DEFAULT_ADMIN_EMAIL, hashedPassword, DEFAULT_ADMIN_PHONE, null],
  );
};

// exports.insertAdmin = catchAsyncError(async (req, res, next) => {
//   const { admin_name, email, password, phone } = req.body;

//   if (!admin_name || !email || !password) {
//     return next(new AppError("All required fields must be provided", 400));
//   }

//   const checkQuery = "SELECT * FROM ADMINS WHERE email = ?";
//   const existingAdmin = await db(checkQuery, [email]);

//   if (existingAdmin.length > 0) {
//     return next(new AppError("Admin with this email already exists", 400));
//   }

//   const hashedPassword = await bcrypt.hash(password, 10);
//   const insertQuery = `
//     INSERT INTO ADMINS (admin_name, email, password, phone)
//     VALUES (?, ?, ?, ?)
//   `;
//   await db(insertQuery, [admin_name, email, hashedPassword, phone || null]);

//   res.status(201).json({ message: "Admin added successfully!" });
// });

exports.insertAdmin = catchAsyncError(async (req, res, next) => {
  const { admin_name, email, password, phone, image } = req.body;
  console.log(req.body);

  if (!admin_name || !email || !password) {
    return next(new AppError("All required fields must be provided", 400));
  }

  const existingAdmin = await db("SELECT * FROM ADMINS WHERE email = ?", [
    email,
  ]);

  if (existingAdmin.length > 0) {
    return next(new AppError("Admin with this email already exists", 400));
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  await db(
    `INSERT INTO ADMINS (admin_name, email, password, phone, image) VALUES (?, ?, ?, ?, ?)`,
    [admin_name, email, hashedPassword, phone || null, image || null],
  );

  res.status(201).json({ message: "Admin added successfully!" });
});

exports.loginAdmin = catchAsyncError(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new AppError("Email and password are required", 400));
  }

  await ensureDefaultAdminExists();

  const checkQuery = "SELECT * FROM ADMINS WHERE email = ?";
  const admins = await db(checkQuery, [email]);

  if (admins.length === 0) {
    return next(new AppError("Invalid credentials", 401));
  }

  const admin = admins[0];
  const isMatch = await bcrypt.compare(password, admin.password);

  if (!isMatch) {
    return next(new AppError("Invalid credentials", 401));
  }

  const token = jwt.sign(
    { id: admin.admin_id, name: admin.admin_name },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN,
    },
  );

  res.status(200).json({
    message: "Login successful",
    token,
    admin: {
      id: admin.admin_id,
      name: admin.admin_name,
      email: admin.email,
    },
  });
});

exports.forgetPassword = catchAsyncError(async (req, res, next) => {
  const { phone } = req.body;
  const searchUserSql = "SELECT * FROM ADMINS WHERE phone = ?";
  let searchResult = await db(searchUserSql, [phone]);

  if (searchResult.length === 0) {
    return res.status(401).send({ message: "No admin found" });
  }
  await sendFast2OTP(phone);
  res.status(200).send({ message: "OTP sent!" });
});

exports.verifyOtp = catchAsyncError(async (req, res, next) => {
  const { phone, otp } = req.body;
  if (!phone || !otp) {
    return res.status(400).json({ message: "phone and OTP are required." });
  }

  const searchOtpSql =
    "SELECT * FROM otp WHERE mobile = ? ORDER BY created_at DESC LIMIT 1";
  let otpResult = await db(searchOtpSql, [phone]);

  if (otpResult.length === 0) {
    return next(new AppError("No OTP found for this phone.", 404));
  }

  const storedOtp = otpResult[0];

  try {
    const otpVerified = await VerifyFast2OTP(storedOtp.vid, otp);
    if (otpVerified) {
      return res.status(200).json({ message: "OTP verified successfully." });
    } else {
      return next(new AppError("Invalid OTP or verification failed.", 400));
    }
  } catch (error) {
    return next(
      new AppError("OTP verification failed. Please try again later.", 500),
    );
  }
});

exports.updatePassword = catchAsyncError(async (req, res, next) => {
  const { phone, password } = req.body;
  if (!phone || !password) {
    return res.status(400).send({ message: "phone and password are required" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const updateStatement = "UPDATE ADMINS SET password = ? WHERE phone = ?";
  const searchResult = await db(updateStatement, [hashedPassword, phone]);

  if (searchResult.affectedRows === 0) {
    return res.status(404).send({ message: "Admin not found" });
  }

  res.status(200).send({ message: "Password updated successfully!" });
});

exports.protect = catchAsyncError(async (req, res, next) => {
  // 1) Get the token from the Authorization header
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

  // 2) Verify the token
  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    return next(new AppError("Invalid or expired token", 401));
  }
  console.log(decoded);

  // 3) Check if user still exists
  const searchUserSql = `SELECT * FROM ADMINS  WHERE admin_id  = ?`;
  const searchResult = await db(searchUserSql, [decoded.id]); // FIXED: Pass ID as an array
  const currentUser = searchResult[0];

  if (!currentUser) {
    return next(
      new AppError("The user belonging to this token no longer exists.", 401),
    );
  }

  // 4) Grant access to the protected route3
  req.user = currentUser;
  next();
});
