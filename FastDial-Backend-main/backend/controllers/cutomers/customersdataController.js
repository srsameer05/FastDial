const db = require("../../database/db");
const AppError = require("../../utils/appError");
const catchAsyncError = require("../../utils/catchAsyncError");
const getData = require("../../database/dbquerieshandlers");
const uploadfile = require("../../middlewares/s3bucket");

const crypto = require("crypto");
const {
  generateInsertStatement,
  generateUpdateStatement,
} = require("../../database/sqlStatementGenarator");
const { getIO } = require("../../socket/socketServer");
const Razorpay = require("razorpay");

const getRazorpayClient = () => {
  const { RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET } = process.env;

  if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
    throw new Error(
      "Razorpay is not configured. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET.",
    );
  }

  return new Razorpay({
    key_id: RAZORPAY_KEY_ID,
    key_secret: RAZORPAY_KEY_SECRET,
  });
};
const AWS = require("aws-sdk");
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

const deleteImage = async (fileKey, bucketName) => {
  const params = {
    Bucket: bucketName,
    Key: fileKey,
  };

  try {
    if (!bucketName) {
      const fs = require("fs/promises");
      const path = require("path");
      const localFileName = path.basename(fileKey);
      const localPath = path.join(__dirname, "..", "..", "uploads", localFileName);
      await fs.unlink(localPath);
      return { deleted: true };
    }

    const result = await s3.deleteObject(params).promise();
    return result;
  } catch (error) {
    console.error("Error deleting image from S3:", error);
    throw error; // Re-throw error to be handled by the controller
  }
};

exports.registerCustomer = catchAsyncError(async (req, res, next) => {
  const { customer_id } = req.user;
  console.log("req.user", req.user);
  console.log("customer_id", customer_id);

  const {
    customer_name,
    customer_email,
    customer_country,
    gender,
    customer_address,
    customer_image,
  } = req.body;

  // Validate required fields
  if (
    !customer_name ||
    !customer_email ||
    !customer_country ||
    !gender ||
    !customer_address
  ) {
    return next(new AppError("All fields are required", 400));
  }

  // Prepare SQL to update customer profile
  const updateCustomerSql = `
    UPDATE CUSTOMERS
    SET 
      customer_name = ?, 
      customer_email = ?, 
      customer_country = ?, 
      gender = ?, 
      customer_address = ?, 
      customer_image = ?
    WHERE customer_id = ?
  `;

  // Execute query with data
  await db(updateCustomerSql, [
    customer_name,
    customer_email,
    customer_country,
    gender,
    JSON.stringify(customer_address),
    customer_image || null, // Optional: pass null if image is not provided
    customer_id,
  ]);

  // Send success response
  res.status(200).json({
    success: true,
    message: "Customer profile registered successfully",
    id: customer_id,
  });
});
exports.getcustomers = catchAsyncError(async (req, res, next) => {
  getData(req, res, "CUSTOMERS");
});

exports.getCustomerByToken = catchAsyncError(async (req, res, next) => {
  console.log(req);
  const customer_id = req.user.customer_id;
  console.log("customer_id", customer_id);
  const sql = "SELECT * FROM CUSTOMERS WHERE customer_id = ?";
  const result = await db(sql, [customer_id]);

  if (result.length === 0) {
    return next(new AppError("Customer not found", 404));
  }

  res.status(200).json({
    success: true,
    data: result[0],
  });
});

exports.deletecustomers = catchAsyncError(async (req, res, next) => {
  const id = req.params.id;
  if (!id) {
    return res.status(403).send({ message: "Please pass id to delete" });
  }
  const statement = `DELETE FROM CUSTOMERS WHERE customer_id= ?`;
  await db(statement, id);
  res.status(201).send({ message: "Resource deleted" });
});

exports.deletecustomer = catchAsyncError(async (req, res, next) => {
  const id = req.user.customer_id;
  if (!id) {
    return res.status(403).send({ message: "Please pass id to delete" });
  }
  const statement = `DELETE FROM CUSTOMERS WHERE customer_id= ?`;
  await db(statement, id);
  res.status(201).send({ message: "Resource deleted" });
});

exports.updatecustomers = catchAsyncError(async (req, res, next) => {
  await generateUpdateStatement("CUSTOMERS", req, "customer_id");
  res.status(200).send({ message: "Request submitted" });
});

// SERVICEBOOKINGS --->

exports.getservicebooking = catchAsyncError(async (req, res, next) => {
  getData(req, res, "SERVICEBOOKINGS");
});

// exports.insertservicebooking = async (req, res) => {
//   const { service_id, customer_id } = req.body;

//   if (!service_id || !customer_id) {
//     return res
//       .status(400)
//       .json({ error: "service_id and customer_id are required" });
//   }

//   try {
//     const result = await db(
//       `
//       INSERT INTO SERVICEBOOKINGS (service_id, customer_id)
//       VALUES (?, ?)`,
//       [service_id, customer_id]
//     );

//     await db(
//       `INSERT INTO NOTIFICATIONS (customer_id, message)
//        VALUES (?, ?)`,
//       [customer_id, "Your service booked Successfully"]
//     );
//     res.status(201).json({
//       message: "Service booking created successfully",
//       booking_id: result.insertId,
//     });
//   } catch (error) {
//     console.error("Error inserting service booking:", error);
//     res.status(500).json({ error: "Internal server error" });
//   }
// };

exports.insertservicebooking = async (req, res) => {
  const { service_id, customer_id, address_id } = req.body;

  if (!service_id || !customer_id || !address_id) {
    return res
      .status(400)
      .json({ error: "service_id, customer_id and address_id are required" });
  }

  try {
    const result = await db(
      `
      INSERT INTO SERVICEBOOKINGS (service_id, customer_id, address_id)
      VALUES (?, ?, ?)`,
      [service_id, customer_id, address_id],
    );

    await db(
      `INSERT INTO NOTIFICATIONS (customer_id, message)
       VALUES (?, ?)`,
      [customer_id, "Your service booked successfully"],
    );

    res.status(201).json({
      message: "Service booking created successfully",
      booking_id: result.insertId,
    });
  } catch (error) {
    console.error("Error inserting service booking:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.updateservicebooking = catchAsyncError(async (req, res, next) => {
  await generateUpdateStatement("SERVICEBOOKINGS", req, "booking_id");
  res.status(200).send({ message: "Request submitted" });
});

exports.deleteservicebooking = catchAsyncError(async (req, res, next) => {
  const id = req.params.booking_id;

  if (!id) {
    return res
      .status(400)
      .json({ message: "Please provide a Booking ID to delete" });
  }

  const checkQuery = `SELECT * FROM SERVICEBOOKINGS WHERE booking_id = ?`;
  const complaint = await db(checkQuery, [id]);

  if (complaint.length === 0) {
    return res.status(404).json({ message: "Service Booking not found" });
  }

  const deleteQuery = `DELETE FROM SERVICEBOOKINGS WHERE booking_id = ?`;
  await db(deleteQuery, [id]);

  res.status(200).json({ message: "Booking deleted successfully" });
});

exports.getCUSTOMERCOMPLAINTS = catchAsyncError(async (req, res, next) => {
  getData(req, res, "CUSTOMERCOMPLAINTS");
});

exports.insertCUSTOMERCOMPLAINTS = catchAsyncError(async (req, res, next) => {
  await generateInsertStatement("CUSTOMERCOMPLAINTS", req);
  res.status(200).send({ message: " complaints Request submitted" });
});

exports.updateCUSTOMERCOMPLAINTS = catchAsyncError(async (req, res, next) => {
  await generateUpdateStatement("CUSTOMERCOMPLAINTS", req, "complaint_id"); // ✅ fixed
  res.status(200).send({ message: "complaints Request submitted" });
});

exports.deleteCUSTOMERCOMPLAINTS = catchAsyncError(async (req, res, next) => {
  const id = req.params.complaint_id; // ✅ fixed

  if (!id) {
    return res.status(400).json({ message: "Please provide a complaints ID to delete" });
  }

  const checkQuery = `SELECT * FROM CUSTOMERCOMPLAINTS WHERE complaint_id = ?`; // ✅ fixed
  const complaint = await db(checkQuery, [id]);

  if (complaint.length === 0) {
    return res.status(404).json({ message: "complaints not found" });
  }

  const deleteQuery = `DELETE FROM CUSTOMERCOMPLAINTS WHERE complaint_id = ?`; // ✅ fixed
  await db(deleteQuery, [id]);

  res.status(200).json({ message: "complaints deleted successfully" });
});

exports.getcustomerservice = catchAsyncError(async (req, res, next) => {
  const results = await db(`
    SELECT 
      sb.booking_id,
      sb.service_id,
      sb.customer_id,
      sb.vendor_id,
      sb.booking_status,
      sb.created_at,
      sb.is_booked,
      sb.is_completed,
      sb.is_cancelled,
      sb.is_accept,
      sb.booking_type,
      sb.scheduled_date,
      c.customer_name,
      c.mobile,
      c.customer_email,
      s.service_name,
      sc.service_category_name,
      sc.service_category_url,
      v.vendor_name,
      v.vendor_mobile,
      ca.address AS booking_address
    FROM SERVICEBOOKINGS sb
    JOIN CUSTOMERS c ON sb.customer_id = c.customer_id
    JOIN SERVICES s ON sb.service_id = s.service_id
    JOIN SERVICE_CATEGORIES sc ON s.service_cat_id = sc.service_cat_id
    LEFT JOIN VENDORS v ON sb.vendor_id = v.vendor_id
    LEFT JOIN CUSTOMER_ADDRESSES ca ON sb.address_id = ca.address_id
    WHERE sb.is_cancelled = FALSE
    ORDER BY sb.created_at DESC
  `);

  res.status(200).json({ success: true, data: results });
});

exports.getSERVICE_CATEGORIES = catchAsyncError(async (req, res, next) => {
  getData(req, res, "SERVICE_CATEGORIES");
});

//  paymnet ------->

exports.initiatePayment = async (req, res) => {
  const { booking_id, payment_method } = req.body;
  console.log(booking_id);

  if (!booking_id) {
    return res.status(400).json({ message: "Booking ID is required" });
  }

  // Check if payment already exists
  const checkQuery = `SELECT payment_id FROM CUSTOMERPAYMENTS WHERE booking_id = ?`;
  const existing = await db(checkQuery, [booking_id]);
  if (existing && existing.length > 0) {
    return res
      .status(409)
      .json({ message: "Payment already exists for this booking." });
  }

  const priceQuery = `
    SELECT VS.service_price
    FROM SERVICEBOOKINGS SB
    JLEFT JOIN VENDOR_SERVICES vs ON sb.vendor_id = vs.vendor_id AND sb.service_id = vs.service_idOIN VENDOR_SERVICES VS ON SB.vendor_id = VS.vendor_id AND SB.service_id = VS.service_id
    WHERE SB.booking_id = ?
  `;

  db(priceQuery, [booking_id], async (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0)
      return res.status(404).json({ message: "Booking or price not found" });

    const payment_amount = results[0].service_price;

    // Handle cash payment
    if (payment_method && payment_method.toLowerCase() === "cash") {
      const insertQuery = `
        INSERT INTO CUSTOMERPAYMENTS (booking_id, payment_amount, payment_ref_no)
        VALUES (?, ?, ?)
      `;
      db(insertQuery, [booking_id, payment_amount, "CASH"], (err, result) => {
        if (err) {
          return res
            .status(500)
            .json({ error: "Failed to record cash payment" });
        }
        return res.status(200).json({
          message: "Cash payment recorded successfully",
          payment_type: "cash",
          booking_id,
          payment_amount,
        });
      });
      return;
    }

    // Default: online payment (Razorpay)
    const options = {
      amount: payment_amount * 100,
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
      payment_capture: 1,
    };

    try {
      const razorpay = getRazorpayClient();
      const order = await razorpay.orders.create(options);
      res.status(200).json({ order_id: order.id, amount: payment_amount });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
};

exports.verifyPayment = (req, res) => {
  const { order_id, payment_id, signature, booking_id } = req.body;

  if (!order_id || !payment_id || !booking_id) {
    return res.status(400).json({ message: "Missing required parameters" });
  }

  const priceQuery = `
    SELECT VS.service_price
    FROM SERVICEBOOKINGS SB
    JOIN VENDOR_SERVICES VS ON SB.vendor_id = VS.vendor_id AND SB.service_id = VS.service_id
    WHERE SB.booking_id = ?
  `;

  db(priceQuery, [booking_id], (err, results) => {
    if (err) {
      console.error("DB Error:", err.message);
      return res.status(500).json({ error: "Database query failed" });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: "Booking not found" });
    }

    const payment_amount = results[0].service_price;

    const insertQuery = `
      INSERT INTO CUSTOMERPAYMENTS (booking_id, payment_amount, payment_ref_no)
      VALUES (?, ?, ?)
    `;

    db(insertQuery, [booking_id, payment_amount, payment_id], (err, result) => {
      if (err) {
        console.error("DB Insert Error:", err.message);
        return res.status(500).json({ error: "Failed to record payment" });
      }

      res.json({ message: "Payment verified and recorded successfully" });
    });
  });
};

// exports.verifyPayment = (req, res) => {
//   const { order_id, payment_id, signature, booking_id } = req.body;

//   if (!order_id || !payment_id || !signature || !booking_id) {
//     return res.status(400).json({ message: "Missing required parameters" });
//   }

//   // Step 1: Verify Razorpay signature
//   const body = order_id + "|" + payment_id;
//   const expectedSignature = crypto
//     .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
//     .update(body.toString())
//     .digest("hex");

//   if (expectedSignature !== signature) {
//     return res
//       .status(400)
//       .json({ message: "Invalid signature, payment verification failed" });
//   }

//   // Step 2: Fetch booking price
//   const priceQuery = `
//     SELECT VS.service_price
//     FROM SERVICEBOOKINGS SB
//     JOIN VENDOR_SERVICES VS ON SB.vendor_id = VS.vendor_id AND SB.service_id = VS.service_id
//     WHERE SB.booking_id = ?
//   `;

//   db(priceQuery, [booking_id], (err, results) => {
//     if (err) {
//       console.error("DB Error:", err.message);
//       return res.status(500).json({ error: "Database query failed" });
//     }

//     if (results.length === 0) {
//       return res.status(404).json({ message: "Booking not found" });
//     }

//     const payment_amount = results[0].service_price;

//     // Step 3: Insert verified payment into DB
//     const insertQuery = `
//       INSERT INTO CUSTOMERPAYMENTS (booking_id, payment_amount, payment_ref_no)
//       VALUES (?, ?, ?)
//     `;

//     db(insertQuery, [booking_id, payment_amount, payment_id], (err) => {
//       if (err) {
//         console.error("DB Insert Error:", err.message);
//         return res.status(500).json({ error: "Failed to record payment" });
//       }

//       res.json({
//         message: "Payment verified and recorded successfully",
//         booking_id,
//         order_id,
//         payment_id,
//         amount: payment_amount,
//       });
//     });
//   });
// };

exports.getAllPayments = (req, res) => {
  db("SELECT * FROM CUSTOMERPAYMENTS", (err, results) => {
    if (err) {
      console.error("DB Query Error:", err.message);
      return res.status(500).json({ error: "Failed to fetch payments" });
    }
    res.json(results);
  });
};

exports.getPaymentDetails = async (req, res) => {
  try {
    const customer_id = req.params;

    const query = `
      SELECT 
        c.customer_id,
        c.customer_name,
        c.mobile,
        c.customer_country,
        c.gender,
        c.customer_address,
        c.customer_email,
        sb.vendor_id,
        sc.service_cat_id,
        sc.service_category_name,
        sc.service_desc,
        s.service_price,
        sc.service_category_url,
        cp.payment_id,
        cp.booking_id,
        cp.payment_amount,
        cp.payment_date,
        cp.payment_ref_no
      FROM CUSTOMERPAYMENTS cp
      JOIN SERVICEBOOKINGS sb ON cp.booking_id = sb.booking_id
      JOIN SERVICES s ON sb.service_id = s.service_id
      JOIN SERVICE_CATEGORIES sc ON s.service_cat_id = sc.service_cat_id
      JOIN CUSTOMERS c ON sb.customer_id = c.customer_id
      WHERE c.customer_id = ?
      ORDER BY cp.payment_date DESC;
    `;

    db(query, [customer_id], (err, results) => {
      if (err) {
        console.error("Error fetching payments:", err);
        return res.status(500).json({ message: "Server error" });
      }
      if (results.length === 0) {
        return res
          .status(404)
          .json({ message: "No payments found for this customer" });
      }
      res.status(200).json({ success: true, data: results });
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.getPaymentDetail = async (req, res) => {
  try {
    const customer_id = req.user.customer_id;

    const query = `
      SELECT 
        c.customer_id,
        c.customer_name,
        c.mobile,
        c.customer_country,
        c.gender,
        c.customer_address,
        c.customer_email,
        sb.vendor_id,
        sc.service_cat_id,
        sc.service_category_name,
        sc.service_desc,
        s.service_price,
        sc.service_category_url,
        cp.payment_id,
        cp.booking_id,
        cp.payment_amount,
        cp.payment_date,
        cp.payment_ref_no
      FROM CUSTOMERPAYMENTS cp
      JOIN SERVICEBOOKINGS sb ON cp.booking_id = sb.booking_id
      JOIN SERVICES s ON sb.service_id = s.service_id
      JOIN SERVICE_CATEGORIES sc ON s.service_cat_id = sc.service_cat_id
      JOIN CUSTOMERS c ON sb.customer_id = c.customer_id
      WHERE c.customer_id = ?
      ORDER BY cp.payment_date DESC;
    `;

    db(query, [customer_id], (err, results) => {
      if (err) {
        console.error("Error fetching payments:", err);
        return res.status(500).json({ message: "Server error" });
      }
      if (results.length === 0) {
        return res
          .status(404)
          .json({ message: "No payments found for this customer" });
      }
      res.status(200).json({ success: true, data: results });
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.getvendors = catchAsyncError(async (req, res, next) => {
  getData(req, res, "VENDORS");
});

exports.getVendorsForCustomer = async (req, res) => {
  const customer_id = req.user.customer_id;

  try {
    const vendors = await db(
      `SELECT DISTINCT
         v.vendor_id,
         v.vendor_name,
         v.vendor_email,
         v.vendor_mobile,
         v.name_of_bussiness,
         v.bussiness_category,
         v.fast_service_category_name,
         v.gst_number,
         v.image_url,
         v.vendor_address,
         v.whatsapp_number,
         v.is_approved,
         v.is_verified
       FROM SERVICEBOOKINGS sb
       JOIN VENDORS v ON sb.vendor_id = v.vendor_id
       WHERE sb.customer_id = ?
         AND sb.vendor_id IS NOT NULL`,
      [customer_id],
    );

    res.status(200).json({
      success: true,
      total_vendors: vendors.length,
      data: vendors,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Error fetching vendors for customer",
      error: error.message,
    });
  }
};

// exports.getVendorsByServiceCategory = async (req, res) => {
//   const { service_cat_id } = req.params;

//   if (!service_cat_id) {
//     return res.status(400).json({ message: "Service category ID is required" });
//   }

//   const query = `
//     SELECT
//       DISTINCT v.vendor_id,
//       v.vendor_name,
//       v.vendor_email,
//       v.vendor_mobile,
//       v.name_of_bussiness,
//       v.bussiness_category,
//       s.service_id,
//       s.service_name,
//       s.service_description,
//       s.service_price,
//       s.service_image_url,
//       sc.service_cat_id,
//       sc.service_category_name,
//       sc.service_desc AS category_description,
//       sc.service_category_url
//     FROM VENDORS v
//     JOIN VENDOR_SERVICES vs ON v.vendor_id = vs.vendor_id
//     JOIN SERVICES s ON vs.service_id = s.service_id
//     JOIN SERVICE_CATEGORIES sc ON s.service_cat_id = sc.service_cat_id
//     WHERE sc.service_cat_id = ?
//     ORDER BY v.vendor_id;
//   `;

//   try {
//     const results = await db(query, [service_cat_id]);

//     if (results.length === 0) {
//       return res
//         .status(404)
//         .json({ message: "No vendors found for this service category" });
//     }

//     res.status(200).json({ success: true, data: results });
//   } catch (error) {
//     console.error("Error fetching vendors by service category:", error.message);
//     res.status(500).json({ message: "Internal server error" });
//   }
// };

exports.getVendorsByServiceCategory = async (req, res) => {
  const { service_cat_id } = req.params;

  if (!service_cat_id) {
    return res
      .status(400)
      .json({ success: false, message: "Service category ID is required" });
  }

  const query = `
    SELECT 
      DISTINCT v.vendor_id,
      v.vendor_name,
      v.vendor_email,
      v.vendor_mobile,
      v.name_of_bussiness,
      v.bussiness_category,
      vs.service_id,
      s.service_name,
      vs.service_description,
      vs.service_price,
      s.service_image_url,
      sc.service_cat_id,
      sc.service_category_name,
      sc.service_desc AS category_description,
      sc.service_category_url
    FROM VENDORS v
    JOIN VENDOR_SERVICES vs ON v.vendor_id = vs.vendor_id
    JOIN SERVICES s ON vs.service_id = s.service_id
    JOIN SERVICE_CATEGORIES sc ON s.service_cat_id = sc.service_cat_id
    WHERE sc.service_cat_id = ?
    ORDER BY v.vendor_id;
  `;

  try {
    const results = await db(query, [service_cat_id]);

    if (!results || results.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No vendors found for this service category",
      });
    }

    res.status(200).json({
      success: true,
      count: results.length,
      data: results,
    });
  } catch (error) {
    console.error("Error fetching vendors by service category:", error.message);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

exports.getSLIDER_IMAGES = catchAsyncError(async (req, res) => {
  getData(req, res, "SLIDER_IMAGES");
});

exports.insertSLIDER_IMAGES = catchAsyncError(async (req, res) => {
  const images = req.files || [];

  if (!images.length) {
    return res.status(400).json({ message: "No images uploaded" });
  }

  const uploadedUrls = [];

  for (let img of images) {
    req.file = img;
    const url = await uploadfile(req);
    uploadedUrls.push(url);

    await db("INSERT INTO SLIDER_IMAGES (image_path) VALUES (?)", [url]);
  }

  res.status(200).json({ message: "Slider images uploaded", uploadedUrls });
});

exports.updateSLIDER_IMAGES = catchAsyncError(async (req, res) => {
  if (req.file) {
    req.body.isUpdatingImage = true;
    req.body.oldUrl = req.body.oldUrl || ""; // required for deleting old image
    const imageUrl = await uploadfile(req);
    req.body.image_path = imageUrl;
  }

  await generateUpdateStatement("SLIDER_IMAGES", req, "id");
  res.status(200).json({ message: "Slider image updated successfully" });
});

// exports.bookServiceLater = async (req, res) => {
//   const { vendor_id, service_id, customer_id, scheduled_date, booking_type } =
//     req.body;

//   console.log(req.body);

//   try {
//     if (booking_type !== "later") {
//       return res
//         .status(400)
//         .json({ success: false, message: "Invalid booking type." });
//     }

//     const result = await db(
//       `INSERT INTO SERVICEBOOKINGS (vendor_id, service_id, customer_id, booking_type, scheduled_date)
//        VALUES (?, ?, ?, ?, ?)`,
//       [vendor_id, service_id, customer_id, booking_type, scheduled_date]
//     );

//     await db(
//       `INSERT INTO NOTIFICATIONS (customer_id, message)
//        VALUES (?, ?)`,
//       [customer_id, "Your service is scheduled for later."]
//     );

//     res.status(201).json({
//       success: true,
//       message: "Service booked for later successfully.",
//       data: {
//         booking_id: result.insertId,
//       },
//     });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ success: false, message: "Server error" });
//   }
// };

exports.bookServiceLater = async (req, res) => {
  const {
    vendor_id,
    service_id,
    customer_id,
    address_id,
    scheduled_date,
    booking_type,
  } = req.body;

  console.log(req.body);

  if (!address_id) {
    return res
      .status(400)
      .json({ success: false, message: "address_id is required." });
  }

  try {
    if (booking_type !== "later") {
      return res
        .status(400)
        .json({ success: false, message: "Invalid booking type." });
    }

    const result = await db(
      `INSERT INTO SERVICEBOOKINGS 
        (vendor_id, service_id, customer_id, address_id, booking_type, scheduled_date)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        vendor_id,
        service_id,
        customer_id,
        address_id,
        booking_type,
        scheduled_date,
      ],
    );

    await db(
      `INSERT INTO NOTIFICATIONS (customer_id, message)
       VALUES (?, ?)`,
      [customer_id, "Your service is scheduled for later."],
    );

    res.status(201).json({
      success: true,
      message: "Service booked for later successfully.",
      data: {
        booking_id: result.insertId,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.deleteSLIDER_IMAGES = catchAsyncError(async (req, res) => {
  const id = req.params.id;

  // Check if ID is provided
  if (!id) {
    return res.status(400).json({ message: "Please provide an ID to delete" });
  }

  // Query to check if the slider image exists in the database
  const checkQuery = `SELECT * FROM SLIDER_IMAGES WHERE id = ?`;
  const slider = await db(checkQuery, [id]);

  // If no slider image found, return a 404 error
  if (!slider.length) {
    return res.status(404).json({ message: "Slider image not found" });
  }

  // Extract the image URL from the database
  const imageUrl = slider[0].image_path;

  if (imageUrl) {
    const fileKey = imageUrl.includes("amazonaws.com")
      ? imageUrl.split(".amazonaws.com/")[1]
      : imageUrl;

    if (!fileKey) {
      return res.status(400).json({ message: "Could not determine file key" });
    }

    try {
      await deleteImage(fileKey, process.env.BUCKET_NAME);
    } catch (error) {
      console.error("Error deleting image from S3:", error);
      return res.status(500).json({ message: "Error deleting image from S3" });
    }
  }

  // Delete the record of the slider image from the database
  const deleteQuery = `DELETE FROM SLIDER_IMAGES WHERE id = ?`;
  try {
    await db(deleteQuery, [id]);
  } catch (error) {
    console.error("Error deleting image record from database:", error);
    return res
      .status(500)
      .json({ message: "Error deleting image record from database" });
  }

  // Send success response after deletion
  res.status(200).json({ message: "Slider image deleted successfully" });
});

// exports.getAllVendorsWithServices = async (req, res) => {
//   const query = `
//     SELECT
//       v.vendor_id,
//       v.vendor_name,
//       v.vendor_email,
//       v.vendor_mobile,
//       v.name_of_bussiness,
//       v.bussiness_category,
//       v.vendor_address,
//       vs.service_id,
//       s.service_name,
//       vs.service_description,
//       vs.service_price,
//       s.service_image_url,
//       sc.service_cat_id,
//       sc.service_category_name,
//       sc.service_desc AS category_description,
//       sc.service_category_url
//     FROM VENDORS v
//     JOIN VENDOR_SERVICES vs ON v.vendor_id = vs.vendor_id
//     JOIN SERVICES s ON vs.service_id = s.service_id
//     JOIN SERVICE_CATEGORIES sc ON s.service_cat_id = sc.service_cat_id
//     ORDER BY v.vendor_id;
//   `;

//   try {
//     const results = await db(query);

//     if (!results || results.length === 0) {
//       return res.status(404).json({
//         success: false,
//         message: "No vendors with services found",
//       });
//     }

//     res.status(200).json({
//       success: true,
//       count: results.length,
//       data: results,
//     });
//   } catch (error) {
//     console.error("Error fetching vendor services:", error.message);
//     res.status(500).json({
//       success: false,
//       message: "Internal server error",
//     });
//   }
// };

exports.getAllVendorsWithServices = async (req, res) => {
  const query = `
    SELECT 
      v.vendor_id,
      v.vendor_name,
      v.vendor_email,
      v.vendor_mobile,
      v.name_of_bussiness,
      v.bussiness_category,
      v.vendor_address,
      vs.service_id,
      s.service_name,
      vs.service_description,
      vs.service_price,
      s.service_image_url,
      sc.service_cat_id,
      sc.service_category_name,
      sc.service_desc AS category_description,
      sc.service_category_url

    FROM VENDORS v

    JOIN VENDOR_SERVICES vs ON v.vendor_id = vs.vendor_id
    JOIN SERVICES s ON vs.service_id = s.service_id
    JOIN SERVICE_CATEGORIES sc ON s.service_cat_id = sc.service_cat_id

   WHERE EXISTS (
    SELECT 1
    FROM subscriptionpaymentsbyvendor spv
    WHERE spv.vendor_id = v.vendor_id
)

ORDER BY v.vendor_id;
  `;

  try {
    const results = await db(query);

    if (!results || results.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No vendors with active subscriptions or valid payments found",
      });
    }

    res.status(200).json({
      success: true,
      count: results.length,
      data: results,
    });
  } catch (error) {
    console.error("Error fetching vendor services:", error.message);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

exports.getSERVICES = catchAsyncError(async (req, res) => {
  getData(req, res, "SERVICES");
});

// Get all reviews
exports.getREVIEWS = catchAsyncError(async (req, res, next) => {
  const statement = `SELECT * FROM REVIEWS`;
  const result = await db(statement);
  res.status(200).json({ data: result });
});

// Insert a new review
exports.insertREVIEWS = catchAsyncError(async (req, res, next) => {
  await generateInsertStatement("REVIEWS", req);
  res.status(200).json({ message: "Review added successfully" });
});

// Update an existing review
exports.updateREVIEWS = catchAsyncError(async (req, res, next) => {
  await generateUpdateStatement("REVIEWS", req, "review_id");
  res.status(200).json({ message: "Review updated successfully" });
});

// Delete a review
exports.deleteREVIEWS = catchAsyncError(async (req, res, next) => {
  const { review_id } = req.params;

  if (!review_id) {
    return res.status(400).json({ message: "Please pass review_id to delete" });
  }

  const statement = `DELETE FROM REVIEWS WHERE review_id = ?`;
  await db(statement, [review_id]);
  res.status(200).json({ message: "Review deleted successfully" });
});

exports.getCompletedBookingwithoutid = async (req, res) => {
  const customer_id = req.user.customer_id;
  if (!customer_id) {
    return res.status(400).json({ message: "Customer ID is required" });
  }
 
  try {
    const query = `
      SELECT 
        sb.booking_id, 
        sb.service_id, 
        sb.customer_id, 
        sb.is_booked, 
        sb.is_completed, 
        sb.is_cancelled, 
        sb.cancelled_reason, 
        sb.vendor_id,
        sb.booking_type,
        sb.created_at,
 
        c.customer_name, 
        c.mobile, 
        c.customer_country, 
        c.gender, 
        c.customer_address, 
        c.customer_email, 
 
        sc.service_cat_id,
        sc.service_category_name,
        sc.service_category_url,
 
        COALESCE(vs.service_description, s.service_description) AS service_description,
        COALESCE(vs.service_price, s.service_price) AS service_price,
 
        v.vendor_name,
        v.vendor_mobile,
 
        ca.address AS booking_address
 
      FROM SERVICEBOOKINGS sb
      JOIN CUSTOMERS c ON sb.customer_id = c.customer_id
      JOIN SERVICES s ON sb.service_id = s.service_id
      JOIN SERVICE_CATEGORIES sc ON s.service_cat_id = sc.service_cat_id
      LEFT JOIN VENDOR_SERVICES vs ON sb.vendor_id = vs.vendor_id AND sb.service_id = vs.service_id
      LEFT JOIN VENDORS v ON sb.vendor_id = v.vendor_id
      LEFT JOIN CUSTOMER_ADDRESSES ca ON sb.address_id = ca.address_id
      WHERE sb.is_completed = TRUE AND sb.customer_id = ?
      ORDER BY sb.booking_id DESC
    `;
 
    const bookings = await db(query, [customer_id]);
    res.status(200).json({ success: true, data: bookings });
  } catch (error) {
    console.error("Error fetching completed bookings:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
 
exports.getCompletedBookingwithid = async (req, res) => {
  const { customer_id } = req.params;
  console.log("customer_id", customer_id);
  if (!customer_id) {
    return res.status(400).json({ message: "Customer ID is required" });
  }

  try {
    const query = `
      SELECT 
        sb.booking_id, 
        sb.service_id, 
        sb.customer_id, 
        sb.is_booked, 
        sb.is_completed, 
        sb.is_cancelled, 
        sb.cancelled_reason, 
        sb.vendor_id, 

        c.customer_name, 
        c.mobile, 
        c.customer_country, 
        c.gender, 
        c.customer_address, 
        c.customer_email, 

        sc.service_cat_id,
        sc.service_category_name, 
        vs.service_description,       
        vs.service_price,       
        sc.service_category_url

      FROM SERVICEBOOKINGS sb
      JOIN CUSTOMERS c ON sb.customer_id = c.customer_id
      JOIN VENDOR_SERVICES vs ON sb.vendor_id = vs.vendor_id AND sb.service_id = vs.service_id
      JOIN SERVICES s ON sb.service_id = s.service_id
      JOIN SERVICE_CATEGORIES sc ON s.service_cat_id = sc.service_cat_id
      WHERE sb.is_completed = TRUE AND sb.customer_id = ?
      ORDER BY sb.booking_id DESC
    `;

    const bookings = await db(query, [customer_id]);

    res.status(200).json({ success: true, data: bookings });
  } catch (error) {
    console.error("Error fetching completed bookings:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// exports.getCancelledBookings = async (req, res) => {
//   try {
//     const query = `
//       SELECT
//         sb.booking_id,
//         sb.service_id,
//         sb.customer_id,
//         sb.is_booked,
//         sb.is_completed,
//         sb.is_cancelled,
//         sb.cancelled_reason,
//         sb.vendor_id,

//         c.customer_name,
//         c.mobile,
//         c.customer_country,
//         c.gender,
//         c.customer_address,
//         c.customer_email,

//         sc.service_cat_id,
//         sc.service_category_name,
//         vs.service_description,
//         vs.service_price,
//         sc.service_category_url

//       FROM SERVICEBOOKINGS sb
//       JOIN CUSTOMERS c ON sb.customer_id = c.customer_id
//       JOIN VENDOR_SERVICES vs ON sb.vendor_id = vs.vendor_id AND sb.service_id = vs.service_id
//       JOIN SERVICES s ON sb.service_id = s.service_id
//       JOIN SERVICE_CATEGORIES sc ON s.service_cat_id = sc.service_cat_id
//       WHERE sb.is_cancelled = TRUE
//       ORDER BY sb.booking_id DESC
//     `;

//     const bookings = await db(query);

//     res.status(200).json({ success: true, data: bookings });
//   } catch (error) {
//     console.error("Error fetching cancelled bookings:", error);
//     res.status(500).json({ message: "Server error", error: error.message });
//   }
// };
exports.getCancelledBookingwithoutid = async (req, res) => {
  const customer_id = req.user.customer_id;
  if (!customer_id) {
    return res.status(400).json({ message: "Customer ID is required" });
  }
 
  try {
    const query = `
      SELECT 
        sb.booking_id, 
        sb.service_id,
        sb.customer_id, 
        sb.is_booked, 
        sb.is_completed, 
        sb.is_cancelled, 
        sb.cancelled_reason, 
        sb.vendor_id,
        sb.booking_type,
        sb.created_at,
 
        c.customer_name, 
        c.mobile, 
        c.customer_country, 
        c.gender, 
        c.customer_address, 
        c.customer_email, 
 
        sc.service_cat_id,
        sc.service_category_name,
        sc.service_category_url,
 
        COALESCE(vs.service_description, s.service_description) AS service_description,
        COALESCE(vs.service_price, s.service_price) AS service_price,
 
        v.vendor_name,
        v.vendor_mobile,
 
        ca.address AS booking_address
 
      FROM SERVICEBOOKINGS sb
      JOIN CUSTOMERS c ON sb.customer_id = c.customer_id
      JOIN SERVICES s ON sb.service_id = s.service_id
      JOIN SERVICE_CATEGORIES sc ON s.service_cat_id = sc.service_cat_id
      LEFT JOIN VENDOR_SERVICES vs ON sb.vendor_id = vs.vendor_id AND sb.service_id = vs.service_id
      LEFT JOIN VENDORS v ON sb.vendor_id = v.vendor_id
      LEFT JOIN CUSTOMER_ADDRESSES ca ON sb.address_id = ca.address_id
      WHERE sb.is_cancelled = TRUE AND sb.customer_id = ?
      ORDER BY sb.booking_id DESC
    `;
 
    const bookings = await db(query, [customer_id]);
    res.status(200).json({ success: true, data: bookings });
  } catch (error) {
    console.error("Error fetching cancelled bookings:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.getCancelledBookingwithid = async (req, res) => {
  const { customer_id } = req.params;

  if (!customer_id) {
    return res.status(400).json({ message: "Customer ID is required" });
  }

  try {
    const query = `
      SELECT 
        sb.booking_id, 
        sb.service_id,
        sb.customer_id, 
        sb.is_booked, 
        sb.is_completed, 
        sb.is_cancelled, 
        sb.cancelled_reason, 
        sb.vendor_id, 

        c.customer_name, 
        c.mobile, 
        c.customer_country, 
        c.gender, 
        c.customer_address, 
        c.customer_email, 

        sc.service_cat_id,
        sc.service_category_name, 
        vs.service_description,       
        vs.service_price,       
        sc.service_category_url

      FROM SERVICEBOOKINGS sb
      JOIN CUSTOMERS c ON sb.customer_id = c.customer_id
      JOIN VENDOR_SERVICES vs ON sb.vendor_id = vs.vendor_id AND sb.service_id = vs.service_id
      JOIN SERVICES s ON sb.service_id = s.service_id
      JOIN SERVICE_CATEGORIES sc ON s.service_cat_id = sc.service_cat_id
      WHERE sb.is_cancelled = TRUE AND sb.customer_id = ?
      ORDER BY sb.booking_id DESC
    `;

    const bookings = await db(query, [customer_id]);

    res.status(200).json({ success: true, data: bookings });
  } catch (error) {
    console.error("Error fetching cancelled bookings:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// exports.getUpcomingServiceBookings = async (req, res) => {
//   const { customer_id } = req.params;

//   if (!customer_id) {
//     return res.status(400).json({ message: "Customer ID is required" });
//   }

//   try {
//     const query = `
//       SELECT
//         sb.booking_id,
//         sb.vendor_id,
//         v.vendor_name,
//         sb.service_id,
//         sb.customer_id,
//         sb.booking_type,
//         sb.scheduled_date,
//         sb.created_at,
//         c.customer_name,
//         c.mobile,
//         c.customer_email
//       FROM
//         SERVICEBOOKINGS sb
//       INNER JOIN
//         CUSTOMERS c ON sb.customer_id = c.customer_id
//       INNER JOIN
//         VENDORS v ON sb.vendor_id = v.vendor_id
//       WHERE
//         sb.is_booked = TRUE
//         AND sb.is_completed = FALSE
//         AND sb.is_cancelled = FALSE
//         AND sb.customer_id = ?
//         AND (
//           (sb.booking_type = 'now' AND DATE(sb.created_at) >= CURDATE())
//           OR
//           (sb.booking_type = 'later' AND sb.scheduled_date >= NOW())
//         )
//       ORDER BY
//         sb.scheduled_date ASC, sb.created_at ASC
//     `;

//     const bookings = await db(query, [customer_id]);

//     res.status(200).json({ success: true, data: bookings });
//   } catch (error) {
//     console.error("Error fetching upcoming services:", error);
//     res.status(500).json({ message: "Server error", error: error.message });
//   }
// };

exports.getUpcomingServiceBookings = async (req, res) => {
  const { customer_id } = req.params;

  if (!customer_id) {
    return res.status(400).json({ message: "Customer ID is required" });
  }

  try {
    const query = `
      SELECT 
        sb.booking_id, 
        sb.service_id,
        sb.customer_id, 
        sb.is_booked, 
        sb.is_completed, 
        sb.is_cancelled, 
        sb.vendor_id, 
        sb.booking_type,
        sb.scheduled_date,
        sb.created_at,

        c.customer_name, 
        c.mobile, 
        c.customer_country, 
        c.gender, 
        c.customer_address, 
        c.customer_email, 

        sc.service_cat_id,
        sc.service_category_name, 
        vs.service_description,       
        vs.service_price,       
        sc.service_category_url

      FROM SERVICEBOOKINGS sb
      JOIN CUSTOMERS c ON sb.customer_id = c.customer_id
      JOIN VENDOR_SERVICES vs ON sb.vendor_id = vs.vendor_id AND sb.service_id = vs.service_id
      JOIN SERVICES s ON sb.service_id = s.service_id
      JOIN SERVICE_CATEGORIES sc ON s.service_cat_id = sc.service_cat_id

      WHERE 
        sb.is_booked = TRUE 
        AND sb.is_completed = FALSE 
        AND sb.is_cancelled = FALSE
        AND sb.customer_id = ?
        AND (
          (sb.booking_type = 'now' AND DATE(sb.created_at) >= CURDATE())
          OR 
          (sb.booking_type = 'later' AND sb.scheduled_date >= NOW())
        )

      ORDER BY 
        sb.scheduled_date ASC, sb.created_at ASC
    `;

    const bookings = await db(query, [customer_id]);

    res.status(200).json({ success: true, data: bookings });
  } catch (error) {
    console.error("Error fetching upcoming services:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
// exports.getUpcomingServiceBooking = async (req, res) => {
//   const customer_id = req.user.customer_id;

//   if (!customer_id) {
//     return res.status(400).json({ message: "Customer ID is required" });
//   }

//   try {
//     const query = `
//       SELECT
//         sb.booking_id,
//         sb.service_id,
//         sb.customer_id,
//         sb.is_booked,
//         sb.is_completed,
//         sb.is_cancelled,
//         sb.vendor_id,
//         sb.booking_type,
//         sb.scheduled_date,
//         sb.created_at,

//         c.customer_name,
//         c.mobile,
//         c.customer_country,
//         c.gender,
//         c.customer_address,
//         c.customer_email,

//         sc.service_cat_id,
//         sc.service_category_name,
//         vs.service_description,
//         vs.service_price,
//         sc.service_category_url

//       FROM SERVICEBOOKINGS sb
//       JOIN CUSTOMERS c ON sb.customer_id = c.customer_id
//       left JOIN VENDOR_SERVICES vs ON sb.vendor_id = vs.vendor_id AND sb.service_id = vs.service_id
//       JOIN SERVICES s ON sb.service_id = s.service_id
//       JOIN SERVICE_CATEGORIES sc ON s.service_cat_id = sc.service_cat_id

//       WHERE
//         sb.is_booked = TRUE
//         AND sb.is_completed = FALSE
//         AND sb.is_cancelled = FALSE
//         AND sb.customer_id = ?
//         AND (
//           (sb.booking_type = 'now' AND DATE(sb.created_at) >= CURDATE())
//           OR
//           (sb.booking_type = 'later' AND sb.scheduled_date >= NOW())
//         )

//       ORDER BY
//         sb.scheduled_date ASC, sb.created_at ASC
//     `;

//     const bookings = await db(query, [customer_id]);

//     res.status(200).json({ success: true, data: bookings });
//   } catch (error) {
//     console.error("Error fetching upcoming services:", error);
//     res.status(500).json({ message: "Server error", error: error.message });
//   }
// };

// exports.getUpcomingServiceBooking = async (req, res) => {
//   const customer_id = req.user.customer_id;

//   if (!customer_id) {
//     return res.status(400).json({ message: "Customer ID is required" });
//   }

//   try {
//     const query = `
//       SELECT
//         sb.booking_id,
//         sb.service_id,
//         sb.customer_id,
//         sb.is_booked,
//         sb.is_completed,
//         sb.is_cancelled,
//         sb.is_accept,
//         sb.vendor_id,
//         sb.booking_type,
//         sb.scheduled_date,
//         sb.created_at,

//         c.customer_name,
//         c.mobile AS customer_mobile,
//         c.customer_country,
//         c.gender,
//         c.customer_address,
//         c.customer_email,

//         v.vendor_name,
//         v.vendor_mobile,

//         sc.service_cat_id,
//         sc.service_category_name,
//         vs.service_description,
//         vs.service_price,
//         sc.service_category_url

//       FROM SERVICEBOOKINGS sb
//       JOIN CUSTOMERS c
//         ON sb.customer_id = c.customer_id
//       LEFT JOIN VENDOR_SERVICES vs
//         ON sb.vendor_id = vs.vendor_id AND sb.service_id = vs.service_id
//        left JOIN SERVICES s
//         ON sb.service_id = s.service_id
//       left JOIN SERVICE_CATEGORIES sc
//         ON s.service_cat_id = sc.service_cat_id
//        left JOIN VENDORS v
//         ON sb.vendor_id = v.vendor_id

//       WHERE
//         sb.is_booked = TRUE
//         AND sb.is_completed = FALSE
//         AND sb.is_cancelled = FALSE
//         AND sb.customer_id = ?
//         AND (
//           (sb.booking_type = 'now' AND DATE(sb.created_at) >= CURDATE())
//           OR
//           (sb.booking_type = 'later' AND sb.scheduled_date >= NOW())
//         )

//       ORDER BY
//         sb.scheduled_date ASC, sb.created_at ASC
//     `;

//     const bookings = await db(query, [customer_id]);

//     res.status(200).json({ success: true, data: bookings });
//   } catch (error) {
//     console.error("Error fetching upcoming services:", error);
//     res.status(500).json({ message: "Server error", error: error.message });
//   }
// };

exports.getUpcomingServiceBooking = async (req, res) => {
  const customer_id = req.user.customer_id;

  if (!customer_id) {
    return res.status(400).json({ message: "Customer ID is required" });
  }

  try {
    const query = `
      SELECT
        sb.booking_id,
        sb.service_id,
        sb.customer_id,
        sb.is_booked,
        sb.is_completed,
        sb.is_cancelled,
        sb.is_accept,
        sb.vendor_id,
        sb.booking_type,
        sb.scheduled_date,
        sb.created_at,

        c.customer_name,
        c.mobile AS customer_mobile,
        c.customer_country,
        c.gender,
        c.customer_address,
        c.customer_email,

        v.vendor_name,
        v.vendor_mobile,

        sc.service_cat_id,
        sc.service_category_name,

        CASE 
          WHEN sb.booking_type = 'now' THEN s.service_description
          ELSE vs.service_description
        END AS service_description,

        CASE 
          WHEN sb.booking_type = 'now' THEN s.service_price
          ELSE vs.service_price
        END AS service_price,

        sc.service_category_url,

         ca.address AS booking_address 

      FROM SERVICEBOOKINGS sb
      JOIN CUSTOMERS c 
        ON sb.customer_id = c.customer_id
      LEFT JOIN VENDOR_SERVICES vs 
        ON sb.vendor_id = vs.vendor_id 
       AND sb.service_id = vs.service_id
      LEFT JOIN SERVICES s 
        ON sb.service_id = s.service_id
      LEFT JOIN SERVICE_CATEGORIES sc 
        ON s.service_cat_id = sc.service_cat_id
      LEFT JOIN VENDORS v 
        ON sb.vendor_id = v.vendor_id
        LEFT JOIN CUSTOMER_ADDRESSES ca 
  ON sb.address_id = ca.address_id


      WHERE
        sb.is_booked = TRUE
        AND sb.is_completed = FALSE
        AND sb.is_cancelled = FALSE
        AND sb.customer_id = ?
        AND (
          (sb.booking_type = 'now' AND DATE(sb.created_at) >= CURDATE())
          OR
          (sb.booking_type = 'later' AND sb.scheduled_date >= NOW())
        )

      ORDER BY
        sb.scheduled_date ASC, sb.created_at ASC
    `;

    const bookings = await db(query, [customer_id]);

    res.status(200).json({ success: true, data: bookings });
  } catch (error) {
    console.error("Error fetching upcoming services:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.insertcustomer_address = async (req, res) => {
  const { address } = req.body;
  const customer_id = req.user?.customer_id;

  if (!customer_id || !address) {
    return res
      .status(400)
      .json({ error: "Valid token and address are required" });
  }

  try {
    const result = await db(
      `
      INSERT INTO CUSTOMER_ADDRESSES (customer_id, address)
      VALUES (?, ?)
      `,
      [customer_id, JSON.stringify(address)],
    );

    res.status(201).json({
      message: "Customer address added successfully",
      address_id: result.insertId,
    });
  } catch (error) {
    console.error("Error inserting customer address:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.getCustomerAddresses = async (req, res) => {
  const customer_id = req.user.customer_id;

  if (!customer_id) {
    return res.status(401).json({ error: "Unauthorized: customer_id missing" });
  }

  try {
    const addresses = await db(
      `
      SELECT address_id, address
      FROM CUSTOMER_ADDRESSES
      WHERE customer_id = ?
      `,
      [customer_id],
    );

    res.status(200).json({
      message: "Addresses fetched successfully",
      addresses: addresses.map((addr) => ({
        address_id: addr.address_id,
        ...(typeof addr.address === "string"
          ? JSON.parse(addr.address)
          : addr.address),
      })),
    });
  } catch (error) {
    console.error("Error fetching customer addresses:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.deleteCustomerAddress = async (req, res) => {
  const customer_id = req.user.customer_id;
  const { address_id } = req.params;
  console.log(address_id);

  if (!customer_id || !address_id) {
    return res
      .status(400)
      .json({ error: "customer_id and address_id are required" });
  }

  try {
    const result = await db(
      `
      DELETE FROM CUSTOMER_ADDRESSES
      WHERE address_id = ? AND customer_id = ?
      `,
      [address_id, customer_id],
    );

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ error: "Address not found or unauthorized" });
    }

    res.status(200).json({ message: "Customer address deleted successfully" });
  } catch (error) {
    console.error("Error deleting customer address:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// exports.updateCustomerAddress = catchAsyncError(async (req, res, next) => {
//   await generateUpdateStatement(" CUSTOMER_ADDRESSES", req, "address_id");
//   res.status(200).json({ message: "Customer Address updated successfully" });
// });

exports.updateCustomerAddress = async (req, res) => {
  const customer_id = req.user?.customer_id;
  const { address_id, street, city, state, zip } = req.body;

  if (!customer_id || !address_id || !street || !city || !state || !zip) {
    return res
      .status(400)
      .json({ error: "All address fields and address_id are required" });
  }

  const address = {
    street,
    city,
    state,
    zip,
  };

  try {
    const result = await db(
      `
      UPDATE CUSTOMER_ADDRESSES
      SET address = ?
      WHERE address_id = ? AND customer_id = ?
      `,
      [JSON.stringify(address), address_id, customer_id],
    );

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ error: "Address not found or unauthorized" });
    }

    res.status(200).json({ message: "Customer address updated successfully" });
  } catch (error) {
    console.error("Error updating customer address:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.addFavouriteService = async (req, res) => {
  const customer_id = req.user?.customer_id;
  const { service_id } = req.body;

  if (!customer_id || !service_id) {
    return res
      .status(400)
      .json({ error: "customer_id and service_id are required" });
  }

  try {
    await db(
      `INSERT INTO FAVOURITE_SERVICES (customer_id, service_id) VALUES (?, ?)`,
      [customer_id, service_id],
    );

    res.status(201).json({ message: "Service added to favourites" });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ error: "Service already in favourites" });
    }
    console.error("Error adding favourite service:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.removeFavouriteService = async (req, res) => {
  const customer_id = req.user?.customer_id;
  const { service_id } = req.params;

  if (!customer_id || !service_id) {
    return res
      .status(400)
      .json({ error: "customer_id and service_id are required" });
  }

  try {
    const result = await db(
      `DELETE FROM FAVOURITE_SERVICES WHERE customer_id = ? AND service_id = ?`,
      [customer_id, service_id],
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Favourite not found" });
    }

    res.status(200).json({ message: "Service removed from favourites" });
  } catch (error) {
    console.error("Error removing favourite service:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.getFavouriteServices = async (req, res) => {
  const customer_id = req.user?.customer_id;

  if (!customer_id) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const favourites = await db(
      `
      SELECT 
        FS.fav_id,
        S.service_id,
        S.service_name,
        S.service_description,
        S.service_price,
        S.service_image_url,
        S.service_cat_id
      FROM FAVOURITE_SERVICES FS
      JOIN SERVICES S ON FS.service_id = S.service_id
      WHERE FS.customer_id = ?
      `,
      [customer_id],
    );

    res.status(200).json({ favourites });
  } catch (error) {
    console.error("Error fetching favourites:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.initiatePaymentFromServicesTable = async (req, res) => {
  const { booking_id, payment_method } = req.body;

  if (!booking_id) {
    return res.status(400).json({ message: "Booking ID is required" });
  }

  // Check if payment already exists
  const checkQuery = `SELECT payment_id FROM CUSTOMERPAYMENTS WHERE booking_id = ?`;
  const existing = await db(checkQuery, [booking_id]);
  if (existing && existing.length > 0) {
    return res
      .status(409)
      .json({ message: "Payment already exists for this booking." });
  }

  const priceQuery = `
    SELECT S.service_price, S.service_name
    FROM SERVICEBOOKINGS SB
    JOIN SERVICES S ON SB.service_id = S.service_id   
    WHERE SB.booking_id = ?
  `;

  try {
    const results = await db(priceQuery, [booking_id]);

    if (results.length === 0) {
      return res.status(404).json({ message: "Booking or service not found" });
    }

    const payment_amount = results[0].service_price;
    const service_name = results[0].service_name;

    // Handle cash payment
    if (payment_method && payment_method.toLowerCase() === "cash") {
      const insertQuery = `
        INSERT INTO CUSTOMERPAYMENTS (booking_id, payment_amount, payment_ref_no)
        VALUES (?, ?, ?)
      `;
      await db(insertQuery, [booking_id, payment_amount, "CASH"]);
      return res.status(200).json({
        message: "Cash payment recorded successfully",
        payment_type: "cash",
        booking_id,
        payment_amount,
        service_name,
      });
    }

    // Default: online payment (Razorpay)
    const options = {
      amount: Math.round(Number(payment_amount) * 100),
      currency: "INR",
      receipt: `booking_${booking_id}_${Date.now()}`,
    };

    const razorpay = getRazorpayClient();
    const order = await razorpay.orders.create(options);

    res.status(200).json({
      success: true,
      key: process.env.RAZORPAY_KEY_ID,
      order_id: order.id,
      amount: order.amount,
      currency: order.currency,
      service_name,
      booking_id,
    });
  } catch (err) {
    console.error("Payment initiation error:", err);
    res.status(500).json({ error: err.message });
  }
};

// exports.verifyPaymentFromServicesTable = async (req, res) => {
//   const { order_id, payment_id, signature, booking_id } = req.body;

//   if (!order_id || !payment_id || !booking_id) {
//     return res.status(400).json({ message: "Missing required parameters" });
//   }

//   try {
//     const priceQuery = `
//       SELECT S.service_price, S.service_name
//       FROM SERVICEBOOKINGS SB
//       JOIN SERVICES S ON SB.service_id = S.service_id
//       WHERE SB.booking_id = ?
//     `;

//     const results = await db(priceQuery, [booking_id]);

//     if (results.length === 0) {
//       return res.status(404).json({ message: "Booking not found" });
//     }

//     const payment_amount = results[0].service_price;
//     const service_name = results[0].service_name;

//     const insertQuery = `
//       INSERT INTO CUSTOMERPAYMENTS (booking_id, payment_amount, payment_ref_no)
//       VALUES (?, ?, ?)
//     `;

//     await db(insertQuery, [booking_id, payment_amount, payment_id]);

//     res.json({
//       message: "Payment verified and recorded successfully",
//       booking_id: booking_id,
//       payment_amount: payment_amount,
//       service_name: service_name,
//     });
//   } catch (err) {
//     console.error("Payment verification error:", err);
//     res.status(500).json({ error: "Failed to verify payment" });
//   }
// };
exports.verifyPaymentFromServicesTable = async (req, res) => {
  try {
    const { order_id, payment_id, signature, booking_id } = req.body;

    if (!order_id || !payment_id || !signature || !booking_id) {
      return res.status(400).json({
        success: false,
        message: "Missing required parameters",
      });
    }

    // Verify Razorpay signature
    const body = `${order_id}|${payment_id}`;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    if (expectedSignature !== signature) {
      return res.status(400).json({
        success: false,
        message: "Invalid signature, payment verification failed",
      });
    }

    // Get service price
    const priceQuery = `
      SELECT S.service_price, S.service_name
      FROM SERVICEBOOKINGS SB
      JOIN SERVICES S ON SB.service_id = S.service_id
      WHERE SB.booking_id = ?
    `;

    const results = await db(priceQuery, [booking_id]);

    if (!results || results.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    const payment_amount = Number(results[0].service_price);
    const service_name = results[0].service_name;

    // Save payment
    await db(
      `
      INSERT INTO CUSTOMERPAYMENTS 
      (booking_id, payment_amount, payment_ref_no)
      VALUES (?, ?, ?)
      `,
      [booking_id, payment_amount, payment_id]
    );

    return res.status(200).json({
      success: true,
      message: "Payment verified and recorded successfully",
      booking_id,
      order_id,
      payment_id,
      payment_amount,
      service_name,
    });
  } catch (err) {
    console.error("Payment verification error:", err);

    return res.status(500).json({
      success: false,
      error: "Failed to verify payment",
      details: err.message,
    });
  }
};

// exports.verifyPaymentFromServicesTable = async (req, res) => {
//   const { order_id, payment_id, signature, booking_id } = req.body;

//   if (!order_id || !payment_id || !signature || !booking_id) {
//     return res.status(400).json({ message: "Missing required parameters" });
//   }

//   try {
//     // 1. Verify Razorpay signature
//     const body = order_id + "|" + payment_id;
//     const expectedSignature = crypto
//       .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
//       .update(body.toString())
//       .digest("hex");

//     if (expectedSignature !== signature) {
//       return res
//         .status(400)
//         .json({ message: "Invalid signature, payment verification failed" });
//     }

//     // 2. Get service details for amount & service name
//     const priceQuery = `
//       SELECT S.service_price, S.service_name
//       FROM SERVICEBOOKINGS SB
//       JOIN SERVICES S ON SB.service_id = S.service_id
//       WHERE SB.booking_id = ?
//     `;
//     const results = await db(priceQuery, [booking_id]);

//     if (results.length === 0) {
//       return res.status(404).json({ message: "Booking not found" });
//     }

//     const payment_amount = results[0].service_price;
//     const service_name = results[0].service_name;

//     // 3. Insert verified payment into DB
//     const insertQuery = `
//       INSERT INTO CUSTOMERPAYMENTS (booking_id, payment_amount, payment_ref_no)
//       VALUES (?, ?, ?)
//     `;
//     await db(insertQuery, [booking_id, payment_amount, payment_id]);

//     // 4. Respond success
//     res.json({
//       message: "Payment verified and recorded successfully",
//       booking_id,
//       order_id,
//       payment_id,
//       payment_amount,
//       service_name,
//     });
//   } catch (err) {
//     console.error("Payment verification error:", err);
//     res.status(500).json({ error: "Failed to verify payment" });
//   }
// };

exports.getServicesTablePaymentDetails = async (req, res) => {
  try {
    const customer_id = req.user.customer_id;

    const query = `
      SELECT 
        c.customer_id,
        c.customer_name,
        c.mobile,
        c.customer_country,
        c.gender,
        c.customer_address,
        c.customer_email,
        sb.booking_id,
        s.service_id,
        s.service_name,
        s.service_description,
        s.service_price,
        s.service_image_url,
        sc.service_cat_id,
        sc.service_category_name,
        sc.service_desc,
        sc.service_category_url,
        cp.payment_id,
        cp.payment_amount,
        cp.payment_date,
        cp.payment_ref_no
      FROM CUSTOMERPAYMENTS cp
      JOIN SERVICEBOOKINGS sb ON cp.booking_id = sb.booking_id
      JOIN SERVICES s ON sb.service_id = s.service_id
      JOIN SERVICE_CATEGORIES sc ON s.service_cat_id = sc.service_cat_id
      JOIN CUSTOMERS c ON sb.customer_id = c.customer_id
      WHERE c.customer_id = ?
      ORDER BY cp.payment_date DESC;
    `;

    const results = await db(query, [customer_id]);

    if (results.length === 0) {
      return res
        .status(404)
        .json({ message: "No payments found for this customer" });
    }

    res.status(200).json({ success: true, data: results });
  } catch (error) {
    console.error("Error fetching services table payments:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.startLocationTracking = async (req, res) => {
  const customer_id = req.user.customer_id;
  const { booking_id, latitude, longitude } = req.body;

  if (!customer_id || !booking_id || !latitude || !longitude) {
    return res.status(400).json({
      success: false,
      message: "All fields are required",
    });
  }

  try {
    // Verify booking exists and belongs to this customer
    const bookingCheck = await db(
      `SELECT booking_id FROM SERVICEBOOKINGS 
       WHERE booking_id = ? AND customer_id = ? AND is_completed = FALSE AND is_cancelled = FALSE`,
      [booking_id, customer_id],
    );

    if (!bookingCheck || bookingCheck.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No active booking found for this customer",
      });
    }

    // Store initial location in database
    await db(
      `INSERT INTO LOCATION_TRACKING 
       (user_id, user_type, latitude, longitude, booking_id) 
       VALUES (?, 'customer', ?, ?, ?)
       ON DUPLICATE KEY UPDATE 
       latitude = VALUES(latitude),
       longitude = VALUES(longitude),
       updated_at = CURRENT_TIMESTAMP`,
      [customer_id, latitude, longitude, booking_id],
    );

    // Get socket instance
    const io = getIO();

    // Emit initial location update to the booking room
    io.to(`booking_${booking_id}`).emit("location_update", {
      user_id: customer_id,
      user_type: "customer",
      latitude,
      longitude,
      timestamp: new Date(),
    });

    res.status(200).json({
      success: true,
      message: "Location tracking started successfully",
    });
  } catch (error) {
    console.error("Error starting location tracking:", error);
    res.status(500).json({
      success: false,
      message: "Error starting location tracking",
      error: error.message,
    });
  }
};

// ... existing code ...

// Update customer location in real-time
// exports.updateLocation = async (req, res) => {
//   const customer_id = req.user.customer_id;
//   const { booking_id, latitude, longitude } = req.body;

//   if (!customer_id || !booking_id || !latitude || !longitude) {
//     return res.status(400).json({
//       success: false,
//       message: "All fields are required"
//     });
//   }

//   try {
//     // Verify booking exists and belongs to this customer
//     const bookingCheck = await db(
//       `SELECT booking_id FROM SERVICEBOOKINGS
//        WHERE booking_id = ? AND customer_id = ? AND is_completed = FALSE AND is_cancelled = FALSE`,
//       [booking_id, customer_id]
//     );

//     if (!bookingCheck || bookingCheck.length === 0) {
//       return res.status(404).json({
//         success: false,
//         message: "No active booking found for this customer"
//       });
//     }

//     // Get socket instance
//     const io = getIO();

//     // Emit location update to the booking room
//     io.to(`booking_${booking_id}`).emit('location_update', {
//       user_id: customer_id,
//       user_type: 'customer',
//       latitude,
//       longitude,
//       timestamp: new Date()
//     });

//     res.status(200).json({
//       success: true,
//       message: "Location updated successfully"
//     });
//   } catch (error) {
//     console.error("Error updating location:", error);
//     res.status(500).json({
//       success: false,
//       message: "Error updating location",
//       error: error.message
//     });
//   }
// };

// ... existing code ...

// Update customer location in real-time
exports.updateLocation = async (req, res) => {
  const customer_id = req.user.customer_id;
  const { booking_id, latitude, longitude } = req.body;

  if (!customer_id || !booking_id || !latitude || !longitude) {
    return res.status(400).json({
      success: false,
      message: "All fields are required",
    });
  }

  try {
    // Verify booking exists and belongs to this customer
    const bookingCheck = await db(
      `SELECT booking_id FROM SERVICEBOOKINGS 
       WHERE booking_id = ? AND customer_id = ? AND is_completed = FALSE AND is_cancelled = FALSE`,
      [booking_id, customer_id],
    );

    if (!bookingCheck || bookingCheck.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No active booking found for this customer",
      });
    }

    // Store location in database
    await db(
      `INSERT INTO LOCATION_TRACKING 
       (user_id, user_type, latitude, longitude, booking_id) 
       VALUES (?, 'customer', ?, ?, ?)
       ON DUPLICATE KEY UPDATE 
       latitude = VALUES(latitude),
       longitude = VALUES(longitude),
       updated_at = CURRENT_TIMESTAMP`,
      [customer_id, latitude, longitude, booking_id],
    );

    // Get socket instance
    const io = getIO();

    // Emit location update to the booking room
    io.to(`booking_${booking_id}`).emit("location_update", {
      user_id: customer_id,
      user_type: "customer",
      latitude,
      longitude,
      timestamp: new Date(),
    });

    res.status(200).json({
      success: true,
      message: "Location updated successfully",
    });
  } catch (error) {
    console.error("Error updating location:", error);
    res.status(500).json({
      success: false,
      message: "Error updating location",
      error: error.message,
    });
  }
};

// ... existing code ...

// Stop location tracking
exports.stopLocationTracking = async (req, res) => {
  const customer_id = req.user.customer_id;
  const { booking_id } = req.body;

  if (!customer_id || !booking_id) {
    return res.status(400).json({
      success: false,
      message: "Customer ID and booking ID are required",
    });
  }

  try {
    // Get socket instance
    const io = getIO();

    // Leave the booking room
    const socket = io.sockets.sockets.get(req.user.socketId);
    if (socket) {
      socket.leave(`booking_${booking_id}`);
    }

    res.status(200).json({
      success: true,
      message: "Location tracking stopped",
    });
  } catch (error) {
    console.error("Error stopping location tracking:", error);
    res.status(500).json({
      success: false,
      message: "Error stopping location tracking",
      error: error.message,
    });
  }
};

// Get notifications by customer_id
exports.getNotifications = catchAsyncError(async (req, res, next) => {
  const customer_id = req.user.customer_id;

  if (!customer_id) {
    return res.status(400).json({ message: "customer_id required" });
  }

  const notifications = await db(
    `SELECT * FROM NOTIFICATIONS WHERE customer_id = ? ORDER BY created_at DESC`,
    [customer_id],
  );

  res.status(200).json({ success: true, data: notifications });
});

// Mark notification as read
exports.markNotificationRead = catchAsyncError(async (req, res, next) => {
  const { notification_id } = req.body;

  if (!notification_id) {
    return res.status(400).json({ message: "notification_id required" });
  }

  await db(
    `UPDATE NOTIFICATIONS SET is_read = TRUE WHERE notification_id = ?`,
    [notification_id],
  );

  res
    .status(200)
    .json({ success: true, message: "Notification marked as read" });
});

exports.getVendorLocationTracking = catchAsyncError(async (req, res, next) => {
  const { booking_id } = req.params;

  const data = await db(   // ✅ data is now the full results array
    `SELECT * FROM LOCATION_TRACKING 
     WHERE booking_id = ? AND user_type = 'vendor'`,
    [booking_id],
  );

  if (!data || data.length === 0) {
    return res.status(404).json({
      success: false,
      message: "Vendor location not found for this booking",
    });
  }

  res.status(200).json({
    success: true,
    count: data.length,
    data,
  });
});
// ... existing code ...
