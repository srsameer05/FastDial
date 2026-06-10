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
const sendMail = require("../../utils/sendMail");

exports.insertVendor = catchAsyncError(async (req, res, next) => {
  console.log("insertVendor called");

  const {
    vendor_name,
    vendor_email,
    vendor_password,
    vendor_mobile,
    name_of_bussiness,
    bussiness_category,
    fast_service_category_name,
    bussiness_proof_doc_url,
    gst_number,
    company_category,
    service_radius,
    bussiness_address,
    pincode,
    service_start_time,
    service_end_time,
    bussiness_desc,
    image_url,
    account_details,
    kyc_docs,
    services,
    vendor_address,
    whatsapp_number,
    annual_turnover,
  } = req.body;

  if (
    !vendor_name ||
    !vendor_email ||
    !vendor_password ||
    !name_of_bussiness ||
    !bussiness_category ||
    !Array.isArray(services) ||
    services.length === 0
  ) {
    console.log("Validation failed: missing required fields");
    return next(new AppError("All required fields must be provided", 400));
  }

  if (!/^\d{12}$/.test(kyc_docs?.aadhar)) {
    return next(new AppError("Aadhar number must be exactly 12 digits", 400));
  }

  if (!/^[A-Z]{5}[0-9]{4}[A-Z]$/.test(kyc_docs?.pan)) {
    return next(
      new AppError("PAN number must be a valid 10-character format", 400),
    );
  }

  const serviceRows = await db("SELECT service_name FROM SERVICES");
  const validServiceNames = serviceRows.map((row) => row.service_name);

  const invalidServices = services.filter(
    (service) => !validServiceNames.includes(service),
  );
  if (invalidServices.length > 0) {
    return next(
      new AppError(
        `Invalid services selected: ${invalidServices.join(", ")}`,
        400,
      ),
    );
  }

  const [existingVendor] = await db(
    "SELECT * FROM VENDORS WHERE vendor_email = ?",
    [vendor_email],
  );
  if (existingVendor) {
    return next(new AppError("Vendor with this email already exists", 400));
  }
  // Check duplicate PAN
  const [panExists] = await db(
    `SELECT vendor_id FROM VENDORS 
   WHERE JSON_UNQUOTE(JSON_EXTRACT(kyc_docs,'$.pan')) = ?`,
    [kyc_docs?.pan],
  );

  if (panExists) {
    return next(new AppError("PAN already registered", 400));
  }

  // Check duplicate Aadhar
  const [aadharExists] = await db(
    `SELECT vendor_id FROM VENDORS 
   WHERE JSON_UNQUOTE(JSON_EXTRACT(kyc_docs,'$.aadhar')) = ?`,
    [kyc_docs?.aadhar],
  );

  if (aadharExists) {
    return next(new AppError("Aadhar already registered", 400));
  }

  // Check duplicate Account Number
  const [accountExists] = await db(
    `SELECT vendor_id FROM VENDORS 
   WHERE JSON_UNQUOTE(JSON_EXTRACT(account_details,'$.accountNumber')) = ?`,
    [account_details?.accountNumber],
  );

  if (accountExists) {
    return next(new AppError("Account number already registered", 400));
  }

  const gstExists = await db(
    "SELECT vendor_id FROM VENDORS WHERE gst_number = ?",
    [gst_number],
  );

  if (gstExists.length > 0) {
    return next(new AppError("GST already registered", 400));
  }

  const hashedPassword = await bcrypt.hash(vendor_password, 10);

  const insertQuery = `
    INSERT INTO VENDORS (
      vendor_name, vendor_email, vendor_password, vendor_mobile,
      name_of_bussiness, bussiness_category, fast_service_category_name,
      bussiness_proof_doc_url, gst_number, company_category, service_radius,
      bussiness_address, pincode, service_start_time, service_end_time,
      bussiness_desc, image_url, account_details, kyc_docs, vendor_address,
      whatsapp_number, annual_turnover
    ) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const vendorResult = await db(insertQuery, [
    vendor_name,
    vendor_email,
    hashedPassword,
    vendor_mobile || null,
    name_of_bussiness,
    bussiness_category,
    fast_service_category_name || null,
    bussiness_proof_doc_url || null,
    gst_number || null,
    company_category || null,
    service_radius || null,
    bussiness_address ? JSON.stringify(bussiness_address) : null,
    pincode || null,
    service_start_time || null,
    service_end_time || null,
    bussiness_desc || null,
    image_url ? JSON.stringify(image_url) : JSON.stringify([]),
    account_details ? JSON.stringify(account_details) : JSON.stringify({}),
    kyc_docs ? JSON.stringify(kyc_docs) : JSON.stringify({}),
    vendor_address ? JSON.stringify(vendor_address) : null,
    whatsapp_number || null,
    annual_turnover || null,
  ]);

  const vendorId = vendorResult.insertId;

  for (const serviceName of services) {
    const serviceRow = await db(
      "SELECT service_id, service_description, service_price FROM SERVICES WHERE service_name = ?",
      [serviceName],
    );

    if (serviceRow?.service_id) {
      await db(
        `INSERT INTO VENDOR_SERVICES 
          (vendor_id, service_id, service_description, service_price) 
          VALUES (?, ?, ?, ?)`,
        [
          vendorId,
          serviceRow.service_id,
          serviceRow.service_description || null,
          serviceRow.service_price || 0.0,
        ],
      );
    }
  }

  const freeTrialRows = await db(
    "SELECT subscription_id, duration_in_days FROM SUBSCRIPTIONS WHERE subscription_name = 'Free Trial' LIMIT 1",
  );

  if (!freeTrialRows || freeTrialRows.length === 0) {
    console.error("Free Trial subscription not found");
    return next(new AppError("Free Trial subscription not found", 500));
  }

  const { subscription_id, duration_in_days } = freeTrialRows[0];

  await db(
    `INSERT INTO VENDOR_SUBSCRIPTIONS (vendor_id, subscription_id, expiry_date) 
     VALUES (?, ?, DATE_ADD(NOW(), INTERVAL ? DAY))`,
    [vendorId, subscription_id, duration_in_days],
  );

  try {
    await sendMail({
      to: vendor_email,
      subject: "Welcome to FastDial! Signup Successful",
      text: `Hello ${vendor_name},\n\nYour signup was successful! You can now log in and start using our services.`,
      html: `<p>Hello <b>${vendor_name}</b>,</p><p>Your signup was successful! You can now log in and start using our services.</p>`,
    });
  } catch (err) {
    console.error("Error sending signup email:", err);
  }

  res.status(201).json({
    message: "Vendor registered successfully with services & Free Trial!",
  });
});

exports.loginVendor = catchAsyncError(async (req, res, next) => {
  const { vendor_email, vendor_password } = req.body;

  if (!vendor_email || !vendor_password) {
    return next(new AppError("Email and password are required", 400));
  }

  const checkQuery = "SELECT * FROM VENDORS WHERE vendor_email = ?";
  const vendors = await db(checkQuery, [vendor_email]);

  if (vendors.length === 0) {
    return next(new AppError("Invalid credentials", 401));
  }

  const vendor = vendors[0];

  if (vendor.is_blocked) {
    return next(new AppError("Your account has been blocked.", 403));
  }

  const isMatch = await bcrypt.compare(vendor_password, vendor.vendor_password);
  if (!isMatch) {
    return next(new AppError("Invalid credentials", 401));
  }

  const token = jwt.sign(
    { id: vendor.vendor_id, email: vendor.vendor_email },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN,
    },
  );

  res.status(200).json({
    message: "Login successful",
    token,
    vendor: {
      id: vendor.vendor_id,
      name: vendor.vendor_name,
      email: vendor.vendor_email,
      mobile: vendor.vendor_mobile,
      business_name: vendor.name_of_bussiness,
      business_category: vendor.bussiness_category,
    },
  });
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
  const searchUserSql = `SELECT * FROM VENDORS  WHERE vendor_id = ?`;
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

// exports.forgetPassword = catchAsyncError(async (req, res, next) => {
//   const { vendor_mobile } = req.body;
//   console.log(vendor_mobile);
//   console.log(req);
//   const searchUserSql = `SELECT * FROM VENDORS WHERE vendor_mobile = ? `;
//   let searchResult = await db(searchUserSql, vendor_mobile);
//   if (searchResult.length === 0) {
//     return res.status(401).send({ message: "No users found" });
//   }
//   await sendFast2OTP(vendor_mobile);
//   res.status(200).send({ message: "OTP sent!" });
// });

// exports.verifyOtp = catchAsyncError(async (req, res, next) => {
//   const { mobile, otp_code } = req.body;

//   if (!mobile || !otp_code) {
//     return res.status(400).json({ message: "Phone and OTP are required." });
//   }

//   // Fetch the latest verification ID (vid) for the phone number
//   const searchOtpSql =
//     "SELECT * FROM otp WHERE mobile = ? ORDER BY created_at DESC LIMIT 1";
//   let otpResult = await db(searchOtpSql, [mobile]);
//   console.log("OTP result:", otpResult);

//   if (otpResult.length === 0) {
//     return next(new AppError("No OTP found for this phone number.", 404));
//   }

//   const storedOtp = otpResult[0];

//   try {
//     console.log("In try block");
//     const otpVerified = await VerifyFast2OTP(storedOtp.vid, otp_code);
//     console.log("OTP verified:", otpVerified);

//     if (otpVerified) {
//       const updateUserSql =
//         "UPDATE VENDORS SET is_verified = true WHERE vendor_mobile = ?";
//       await db(updateUserSql, [mobile]);

//       // Send response with success message
//       return res.status(200).json({ message: "OTP verified successfully." });
//     } else {
//       return next(new AppError("Invalid OTP or verification failed.", 400));
//     }
//   } catch (error) {
//     return next(
//       new AppError("OTP verification failed. Please try again later.", 500)
//     );
//   }
// });

// exports.updatePassword = catchAsyncError(async (req, res, next) => {
//   const { vendor_mobile, vendor_password } = req.body;

//   if (!vendor_mobile || !vendor_password) {
//     return res
//       .status(400)
//       .json({ message: "Mobile and password are required" });
//   }

//   try {
//     const salt = await bcrypt.genSalt(10);
//     const hashedPassword = await bcrypt.hash(vendor_password, salt);

//     const updateStatement =
//       "UPDATE VENDORS SET vendor_password = ? WHERE vendor_mobile = ?";
//     const searchResult = await db(updateStatement, [
//       hashedPassword,
//       vendor_mobile,
//     ]);

//     if (searchResult.affectedRows === 0) {
//       return res.status(404).json({ message: "User not found" });
//     }

//     res.status(200).json({
//       message: "Password updated successfully!",
//     });
//   } catch (error) {
//     return res
//       .status(500)
//       .json({ message: "Internal Server Error", error: error.message });
//   }
// });

exports.forgetPassword = catchAsyncError(async (req, res, next) => {
  const { vendor_mobile } = req.body;

  if (!vendor_mobile) {
    return res.status(400).json({ message: "Mobile number is required." });
  }

  const searchUserSql = "SELECT * FROM VENDORS WHERE vendor_mobile = ?";
  let searchResult = await db(searchUserSql, [vendor_mobile]);

  if (searchResult.length === 0) {
    return res.status(404).json({ message: "No users found." });
  }

  await sendFast2OTP(vendor_mobile);
  res.status(200).json({ message: "OTP sent successfully!" });
});

// Verify OTP
exports.verifyOtp = catchAsyncError(async (req, res, next) => {
  const { mobile, otp_code } = req.body;

  if (!mobile || !otp_code) {
    return res
      .status(400)
      .json({ message: "Mobile number and OTP are required." });
  }

  const searchOtpSql =
    "SELECT * FROM otp WHERE mobile = ? ORDER BY created_at DESC LIMIT 1";
  let otpResult = await db(searchOtpSql, [mobile]);

  if (otpResult.length === 0) {
    return next(new AppError("No OTP found for this phone number.", 404));
  }

  const storedOtp = otpResult[0];

  try {
    const otpVerified = await VerifyFast2OTP(storedOtp.vid, otp_code);
    if (otpVerified) {
      const updateUserSql =
        "UPDATE VENDORS SET is_verified = true WHERE vendor_mobile = ?";
      await db(updateUserSql, [mobile]);
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

// Update Password
exports.updatePassword = catchAsyncError(async (req, res, next) => {
  const { vendor_mobile, vendor_password } = req.body;

  if (!vendor_mobile || !vendor_password) {
    return res
      .status(400)
      .json({ message: "Mobile number and password are required." });
  }

  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(vendor_password, salt);

    const updateStatement =
      "UPDATE VENDORS SET vendor_password = ? WHERE vendor_mobile = ?";
    const updateResult = await db(updateStatement, [
      hashedPassword,
      vendor_mobile,
    ]);

    if (updateResult.affectedRows === 0) {
      return res.status(404).json({ message: "User not found." });
    }

    res.status(200).json({ message: "Password updated successfully!" });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
});
