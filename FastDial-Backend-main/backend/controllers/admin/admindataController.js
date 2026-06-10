const db = require("../../database/db");
const AppError = require("../../utils/appError");
const catchAsyncError = require("../../utils/catchAsyncError");
const getData = require("../../database/dbquerieshandlers");
const bcrypt = require("bcrypt");
const {
  generateInsertStatement,
  generateUpdateStatement,
} = require("../../database/sqlStatementGenarator");

exports.getSERVICE_CATEGORIES = catchAsyncError(async (req, res, next) => {
  getData(req, res, "SERVICE_CATEGORIES");
});

exports.insertSERVICE_CATEGORIES = catchAsyncError(async (req, res, next) => {
  await generateInsertStatement("SERVICE_CATEGORIES", req);
  res.status(200).send({ message: "Request submitted" });
});

exports.updateSERVICE_CATEGORIES = catchAsyncError(async (req, res, next) => {
  await generateUpdateStatement("SERVICE_CATEGORIES", req, "service_cat_id");
  res.status(200).send({ message: "Request submitted" });
});

exports.deleteSERVICE_CATEGORIES = catchAsyncError(async (req, res, next) => {
  const id = req.params.service_cat_id;
  if (!id) {
    return res.status(403).send({ message: "Please pass id to delete" });
  }
  const statement = `DELETE FROM SERVICE_CATEGORIES WHERE  service_cat_id  = ?`;
  await db(statement, id);
  res.status(201).send({ message: "Resource deleted" });
});

exports.getSERVICES = catchAsyncError(async (req, res, next) => {
  getData(req, res, "SERVICES");
});

// Insert a new SERVICE
exports.insertSERVICES = catchAsyncError(async (req, res, next) => {
  await generateInsertStatement("SERVICES", req);
  res.status(200).send({ message: "Request submitted" });
});

// Update an existing SERVICE
exports.updateSERVICES = catchAsyncError(async (req, res, next) => {
  await generateUpdateStatement("SERVICES", req, "service_id");
  res.status(200).send({ message: "Request submitted" });
});

// Delete a SERVICE
exports.deleteSERVICES = catchAsyncError(async (req, res, next) => {
  const id = req.params.service_id;
  if (!id) {
    return res.status(403).send({ message: "Please pass id to delete" });
  }
  const statement = `DELETE FROM SERVICES WHERE service_id = ?`;
  await db(statement, id);
  res.status(201).send({ message: "Resource deleted" });
});

exports.getvendorscomplaints = catchAsyncError(async (req, res, next) => {
  getData(req, res, "VendorComplaintsView");
});

exports.getvendors = catchAsyncError(async (req, res, next) => {
  const vendors = await db(`SELECT * FROM VENDORS`);

  const vendorServices = await db(`
    SELECT VS.vendor_id, S.service_name
    FROM VENDOR_SERVICES VS
    JOIN SERVICES S ON VS.service_id = S.service_id   
  `);

  const vendorServicesMap = {};
  for (const row of vendorServices) {
    if (!vendorServicesMap[row.vendor_id]) {
      vendorServicesMap[row.vendor_id] = [];
    }
    vendorServicesMap[row.vendor_id].push(row.service_name);
  }

  const formattedVendors = vendors.map((vendor) => ({
    ...vendor,
    image_url: (() => {
      try {
        if (!vendor.image_url) return [];
        return typeof vendor.image_url === "string"
          ? JSON.parse(vendor.image_url)
          : vendor.image_url;
      } catch (err) {
        console.warn("Invalid image_url JSON for vendor:", vendor.vendor_id);
        return [];
      }
    })(),

    account_details: (() => {
      try {
        if (!vendor.account_details) return {};
        return typeof vendor.account_details === "string"
          ? JSON.parse(vendor.account_details)
          : vendor.account_details;
      } catch (err) {
        console.warn(
          "Invalid account_details JSON for vendor:",
          vendor.vendor_id,
        );
        return {};
      }
    })(),

    kyc_docs: (() => {
      try {
        if (!vendor.kyc_docs) return {};
        return typeof vendor.kyc_docs === "string"
          ? JSON.parse(vendor.kyc_docs)
          : vendor.kyc_docs;
      } catch (err) {
        console.warn("Invalid kyc_docs JSON for vendor:", vendor.vendor_id);
        return {};
      }
    })(),
    services: vendorServicesMap[vendor.vendor_id] || [],
  }));

  res.status(200).json({
    success: true,
    count: formattedVendors.length,
    vendors: formattedVendors,
  });
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

// update service booking->
exports.updateservicebooking = catchAsyncError(async (req, res, next) => {
  await generateUpdateStatement("SERVICEBOOKINGS", req, "booking_id");
  res.status(200).send({ message: "Request submitted" });
});

exports.getSUBSCRIPTIONS = catchAsyncError(async (req, res, next) => {
  getData(req, res, "SUBSCRIPTIONS");
});

exports.insertSUBSCRIPTIONS = catchAsyncError(async (req, res, next) => {
  await generateInsertStatement("SUBSCRIPTIONS", req);
  res.status(200).send({ message: "Request submitted" });
});

exports.updateSUBSCRIPTIONS = catchAsyncError(async (req, res, next) => {
  await generateUpdateStatement("SUBSCRIPTIONS", req, "subscription_id");
  res.status(200).send({ message: "Request submitted" });
});

exports.deleteSUBSCRIPTIONS = catchAsyncError(async (req, res, next) => {
  const id = req.params.subscription_id;
  if (!id) {
    return res.status(403).send({ message: "Please pass id to delete" });
  }
  const statement = `DELETE FROM SUBSCRIPTIONS WHERE  subscription_id  = ?`;
  await db(statement, id);
  res.status(201).send({ message: "Resource deleted" });
});

exports.getcustomers = catchAsyncError(async (req, res, next) => {
  getData(req, res, "CUSTOMERS");
});

exports.getCUSTOMERCOMPLAINTS = catchAsyncError(async (req, res, next) => {
  getData(req, res, "CustomerComplaintsView");
});

exports.updatevendors = catchAsyncError(async (req, res, next) => {
  await generateUpdateStatement("VENDORS", req, "vendor_id");
  res.status(200).send({ message: "Request submitted" });
});

exports.getADMINS = catchAsyncError(async (req, res, next) => {
  getData(req, res, "ADMINS");
});

exports.getApprovedVendors = catchAsyncError(async (req, res, next) => {
  try {
    const sql =
      "SELECT * FROM VENDORS WHERE is_approved = 1 AND is_rejected = 0";
    const vendors = await db(sql);
    res.status(200).json({ success: true, vendors });
  } catch (error) {
    console.error("Error fetching approved vendors:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

exports.getVendorsToAssign = catchAsyncError(async (req, res, next) => {
  try {
    const sql =
      "SELECT * FROM VENDORS WHERE is_approved = 1 AND is_rejected = 0 and is_blocked = 0";
    const vendors = await db(sql);
    res.status(200).json({ success: true, vendors });
  } catch (error) {
    console.error("Error fetching approved vendors:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

exports.getRejectedVendors = catchAsyncError(async (req, res, next) => {
  try {
    const sql = "SELECT * FROM VENDORS WHERE is_rejected = 1";
    const vendors = await db(sql);
    res.status(200).json({ success: true, vendors });
  } catch (error) {
    console.error("Error fetching rejected vendors:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

exports.getPendingVendors = catchAsyncError(async (req, res, next) => {
  try {
    const sql =
      "SELECT * FROM VENDORS WHERE is_approved = 0 AND is_rejected = 0";
    const vendors = await db(sql);
    res.status(200).json({ success: true, vendors });
  } catch (error) {
    console.error("Error fetching pending vendors:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

exports.insertvendor = catchAsyncError(async (req, res, next) => {
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
  } = req.body;

  if (
    !vendor_name ||
    !vendor_email ||
    !vendor_password ||
    !name_of_bussiness ||
    !bussiness_category
  ) {
    return next(new AppError("All required fields must be provided", 400));
  }

  // Check if vendor email already exists
  const checkQuery = "SELECT * FROM VENDORS WHERE vendor_email = ?";
  const existingVendor = await db(checkQuery, [vendor_email]);

  if (existingVendor.length > 0) {
    return next(new AppError("Vendor with this email already exists", 400));
  }

  const hashedPassword = await bcrypt.hash(vendor_password, 10);

  const insertQuery = `
        INSERT INTO VENDORS (
          vendor_name, vendor_email, vendor_password, vendor_mobile,
          name_of_bussiness, bussiness_category, fast_service_category_name,
          bussiness_proof_doc_url, gst_number, company_category, service_radius,
          bussiness_address, pincode, service_start_time, service_end_time,
          bussiness_desc, image_url, account_details, kyc_docs
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

  await db(insertQuery, [
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
    bussiness_address || null,
    pincode || null,
    service_start_time || null,
    service_end_time || null,
    bussiness_desc || null,
    image_url ? JSON.stringify(image_url) : null,
    account_details ? JSON.stringify(account_details) : null,
    kyc_docs ? JSON.stringify(kyc_docs) : null,
  ]);

  res.status(201).json({ message: "Vendor registered successfully!" });
});

exports.getPaymentDetails = async (req, res) => {
  try {
    const { customer_id } = req.params;

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
          s.service_id,
          s.service_name,
          vs.service_description,
          vs.service_price,
          s.service_image_url,
          sc.service_cat_id,
          sc.service_category_name, 
          sc.service_desc,                   
          sc.service_category_url,   
          cp.payment_id,
          cp.booking_id,
          cp.payment_amount,
          cp.payment_date,
          cp.payment_ref_no
      FROM CUSTOMERPAYMENTS cp
      JOIN SERVICEBOOKINGS sb ON cp.booking_id = sb.booking_id
      JOIN CUSTOMERS c ON sb.customer_id = c.customer_id
      JOIN SERVICES s ON sb.service_id = s.service_id
      JOIN VENDOR_SERVICES vs ON sb.vendor_id = vs.vendor_id AND sb.service_id = vs.service_id
      JOIN SERVICE_CATEGORIES sc ON s.service_cat_id = sc.service_cat_id
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
      res.json({ success: true, data: results });
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.getAllPaymentDetails = async (req, res) => {
  try {
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
        vs.service_price,
        sc.service_category_url,
        cp.payment_id,
        cp.booking_id,
        cp.payment_amount,
        cp.payment_date,
        cp.payment_ref_no
      FROM CUSTOMERPAYMENTS cp
      JOIN SERVICEBOOKINGS sb ON cp.booking_id = sb.booking_id
      JOIN SERVICES s ON sb.service_id = s.service_id
      JOIN VENDOR_SERVICES vs ON sb.vendor_id = vs.vendor_id AND sb.service_id = vs.service_id
      JOIN SERVICE_CATEGORIES sc ON s.service_cat_id = sc.service_cat_id
      JOIN CUSTOMERS c ON sb.customer_id = c.customer_id
      ORDER BY cp.payment_date DESC;
    `;

    db(query, [], (err, results) => {
      if (err) {
        console.error("Error fetching payments:", err);
        return res.status(500).json({ message: "Server error" });
      }

      if (results.length === 0) {
        return res.status(404).json({ message: "No payments found" });
      }

      res.status(200).json({ success: true, data: results });
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.getVendorPayments = async (req, res) => {
  try {
    const results = await db(`
      SELECT 
        sp.payment_id,
        sp.subscription_id,
        sp.payment_details,
        sp.payment_date,

        v.vendor_id,
        v.vendor_name,
        v.vendor_email,
        v.name_of_bussiness

      FROM SUBSCRIPTIONPAYMENTSBYVENDOR sp
      JOIN VENDORS v ON sp.vendor_id = v.vendor_id  
    `);

    res.status(200).json({
      success: true,
      data: results,
    });
  } catch (error) {
    console.error("Error fetching vendor payments:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// exports.getAllReviews = async (req, res) => {
//   try {
//     const query = `
//       SELECT
//         r.review_id,
//         r.rating,
//         r.review_text,
//         r.created_at,
//         r.updated_at,

//         v.vendor_id,
//         v.vendor_name,
//         v.vendor_email,
//         v.name_of_bussiness,
//         v.bussiness_category,

//         c.customer_id,
//         c.customer_name,
//         c.customer_email,

//         sb.booking_id

//       FROM REVIEWS r
//       JOIN VENDORS v ON r.vendor_id = v.vendor_id
//       JOIN CUSTOMERS c ON r.customer_id = c.customer_id
//       LEFT JOIN SERVICEBOOKINGS sb
//         ON sb.vendor_id = r.vendor_id
//         AND sb.customer_id = r.customer_id
//       ORDER BY r.created_at DESC;
//     `;

//     const [results] = await db(query);
//     res.status(200).json({ success: true, data: results });
//   } catch (error) {
//     console.error("Error fetching reviews:", error);
//     res.status(500).json({ success: false, message: "Server Error" });
//   }
// };

exports.getAllReviews = async (req, res) => {
  try {
    const query = `
      SELECT 
        r.review_id,
        r.rating,
        r.review_text,
        r.created_at,
        r.updated_at,

        v.vendor_id,
        v.vendor_name,
        v.vendor_email,
        v.name_of_bussiness,
        v.bussiness_category,

        c.customer_id,
        c.customer_name,
        c.customer_email,

        sb.booking_id

      FROM REVIEWS r
      JOIN VENDORS v ON r.vendor_id = v.vendor_id
      JOIN CUSTOMERS c ON r.customer_id = c.customer_id
      LEFT JOIN (
          SELECT sb1.*
          FROM SERVICEBOOKINGS sb1
          INNER JOIN (
              SELECT customer_id, vendor_id, MAX(created_at) as max_date
              FROM SERVICEBOOKINGS
              GROUP BY customer_id, vendor_id
          ) sb2 
          ON sb1.customer_id = sb2.customer_id 
          AND sb1.vendor_id = sb2.vendor_id 
          AND sb1.created_at = sb2.max_date
      ) sb 
      ON sb.vendor_id = r.vendor_id AND sb.customer_id = r.customer_id
      ORDER BY r.created_at DESC;
    `;

    const results = await db(query); // <- no destructuring
    console.log("Review Results:", results); // Check what is returned

    res.status(200).json({ success: true, data: results }); // Return all reviews
  } catch (error) {
    console.error("Error fetching reviews:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// exports.getAllReviews = async (req, res) => {
//   try {
//     const query = `
//       SELECT
//         r.review_id,
//         r.rating,
//         r.review_text,
//         r.created_at,
//         r.updated_at,

//         v.vendor_id,
//         v.vendor_name,
//         v.vendor_email,
//         v.name_of_bussiness,
//         v.bussiness_category,

//         c.customer_id,
//         c.customer_name,
//         c.customer_email

//       FROM REVIEWS r
//       JOIN VENDORS v ON r.vendor_id = v.vendor_id
//       JOIN CUSTOMERS c ON r.customer_id = c.customer_id
//       ORDER BY r.created_at DESC;
//     `;

//     const [results] = await db(query);
//     res.status(200).json({ success: true, data: results });
//   } catch (error) {
//     console.error("Error fetching reviews:", error);
//     res.status(500).json({ success: false, message: "Server Error" });
//   }
// };

// exports.getReviewsByVendorId = async (req, res) => {
//   const { vendor_id } = req.params;

//   try {
//     const query = `
//       SELECT
//         r.review_id,
//         r.rating,
//         r.review_text,
//         r.created_at,
//         r.updated_at,

//         v.vendor_id,
//         v.vendor_name,
//         v.vendor_email,
//         v.name_of_bussiness,
//         v.bussiness_category,

//         c.customer_id,
//         c.customer_name,
//         c.customer_email

//       FROM REVIEWS r
//       JOIN VENDORS v ON r.vendor_id = v.vendor_id
//       JOIN CUSTOMERS c ON r.customer_id = c.customer_id
//       WHERE r.vendor_id = ?
//       ORDER BY r.created_at DESC;
//     `;

//     const [results] = await db(query, [vendor_id]);

//     if (!results) {
//       return res.status(200).json({
//         success: false,
//         message: "No reviews found for this vendor",
//       });
//     }

//     res.status(200).json({ success: true, data: results });
//   } catch (error) {
//     console.error("Error fetching vendor reviews:", error);
//     res.status(500).json({ success: false, message: "Server Error" });
//   }
// };

// exports.getReviewsByVendorId = async (req, res) => {
//   const { vendor_id } = req.params;

//   try {
//     const query = `
//       SELECT
//         r.review_id,
//         r.rating,
//         r.review_text,
//         r.created_at,
//         r.updated_at,

//         v.vendor_id,
//         v.vendor_name,
//         v.vendor_email,
//         v.name_of_bussiness,
//         v.bussiness_category,

//         c.customer_id,
//         c.customer_name,
//         c.customer_email,

//         sb.booking_id

//       FROM REVIEWS r
//       JOIN VENDORS v ON r.vendor_id = v.vendor_id
//       JOIN CUSTOMERS c ON r.customer_id = c.customer_id
//       LEFT JOIN SERVICEBOOKINGS sb
//         ON sb.vendor_id = r.vendor_id
//         AND sb.customer_id = r.customer_id
//       WHERE r.vendor_id = ?
//       ORDER BY r.created_at DESC;
//     `;

//     const [results] = await db(query, [vendor_id]);

//     if (!results || results.length === 0) {
//       return res.status(200).json({
//         success: false,
//         message: "No reviews found for this vendor",
//       });
//     }

//     res.status(200).json({ success: true, data: results });
//   } catch (error) {
//     console.error("Error fetching vendor reviews:", error);
//     res.status(500).json({ success: false, message: "Server Error" });
//   }
// };

exports.getReviewsByVendorId = async (req, res) => {
  const { vendor_id } = req.params;

  try {
    const query = `
      SELECT 
        r.review_id,
        r.rating,
        r.review_text,
        r.created_at,
        r.updated_at,
        r.booking_id,  -- ✅ Get booking_id directly from REVIEWS

        v.vendor_id,
        v.vendor_name,
        v.vendor_email,
        v.name_of_bussiness,
        v.bussiness_category,

        c.customer_id,
        c.customer_name,
        c.customer_email

      FROM REVIEWS r
      JOIN VENDORS v ON r.vendor_id = v.vendor_id
      JOIN CUSTOMERS c ON r.customer_id = c.customer_id
      WHERE r.vendor_id = ?
      ORDER BY r.created_at DESC;
    `;

    const results = await db(query, [vendor_id]);

    if (!results || results.length === 0) {
      return res.status(200).json({
        success: false,
        message: "No reviews found for this vendor",
      });
    }

    res.status(200).json({ success: true, data: results });
  } catch (error) {
    console.error("Error fetching vendor reviews:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

exports.getBlockedVendors = async (req, res) => {
  try {
    const query = `SELECT * FROM VENDORS WHERE is_blocked = TRUE ORDER BY blocked_date DESC;`;

    const results = await db(query);

    res.status(200).json({
      success: true,
      data: results,
    });
  } catch (error) {
    console.error("Error fetching blocked vendors:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// exports.getVendorsWithSubscription = async (req, res) => {
//   try {
//     const query = `
//       SELECT DISTINCT v.*
//       FROM VENDORS v

//       JOIN SUBSCRIPTIONPAYMENTSBYVENDOR spv
//         ON v.vendor_id = spv.vendor_id

//       WHERE JSON_UNQUOTE(JSON_EXTRACT(spv.payment_details, '$.renewal_date')) >= CURDATE()

//       ORDER BY v.vendor_id;
//     `;

//     const results = await db(query);

//     if (!results || results.length === 0) {
//       return res.status(404).json({
//         success: false,
//         message: "No vendors with active subscription found",
//       });
//     }

//     res.status(200).json({
//       success: true,
//       count: results.length,
//       data: results,
//     });
//   } catch (error) {
//     console.error("Error fetching vendors with active subscriptions:", error);
//     res.status(500).json({
//       success: false,
//       message: "Internal Server Error",
//     });
//   }
// };

exports.getVendorsWithSubscription = async (req, res) => {
  try {
    const query = `
      SELECT DISTINCT 
        v.*, 
        s.*,
        spv.payment_details,
        spv.payment_date
      FROM VENDORS v
      JOIN SUBSCRIPTIONPAYMENTSBYVENDOR spv 
        ON v.vendor_id = spv.vendor_id
      JOIN SUBSCRIPTIONS s 
        ON spv.subscription_id = s.subscription_id
      WHERE JSON_UNQUOTE(JSON_EXTRACT(spv.payment_details, '$.renewal_date')) >= CURDATE()
      ORDER BY v.vendor_id;
    `;

    const results = await db(query);

    if (!results || results.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No vendors with active subscription found",
      });
    }

    res.status(200).json({
      success: true,
      count: results.length,
      data: results,
    });
  } catch (error) {
    console.error("Error fetching vendors with active subscriptions:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

exports.getActiveVendors = catchAsyncError(async (req, res, next) => {
  try {
    const query = `
      SELECT 
        v.vendor_id,
        v.vendor_name,
        v.vendor_email,
        v.vendor_mobile,
        v.name_of_bussiness,
        v.bussiness_category,
        v.fast_service_category_name,
        v.bussiness_proof_doc_url,
        v.gst_number,
        v.company_category,
        v.service_radius,
        v.bussiness_address,
        v.pincode,
        v.service_start_time,
        v.service_end_time,
        v.bussiness_desc,
        v.image_url,
        v.account_details,
        v.kyc_docs,
        v.is_approved,
        v.approved_by,
        v.is_blocked,
        v.blocked_reason,
        v.is_rejected,
        v.blocked_date,
        v.rejected_by,
        v.approved_date,
        v.rejected_date,
        v.is_verified,
        v.vendor_address,

        vs.subscription_id,
        vs.start_date AS subscription_start_date,
        vs.expiry_date AS subscription_expiry_date,
        vs.status AS subscription_status

      FROM VENDORS v
      JOIN VENDOR_SUBSCRIPTIONS vs ON v.vendor_id = vs.vendor_id
      WHERE vs.status = 'active';
    `;

    const results = await db(query);

    if (results.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No active vendors found",
      });
    }

    res.status(200).json({
      success: true,
      data: results,
    });
  } catch (error) {
    console.error("Error fetching active vendors:", error);
    next(new AppError("Failed to fetch active vendors", 500));
  }
});

exports.getVendorsCompletedTrialNoPurchase = catchAsyncError(
  async (req, res, next) => {
    try {
      const query = `
      SELECT 
          v.vendor_id,
          v.vendor_name,
          v.vendor_email,
          v.vendor_mobile,
          v.name_of_bussiness,
          v.bussiness_category,
          v.gst_number,
          v.company_category,
          v.service_radius,
          v.pincode,
          vs.subscription_id,
          vs.expiry_date,
          vs.status AS subscription_status,
          s.subscription_name AS subscription_type

      FROM VENDORS v

      INNER JOIN VENDOR_SUBSCRIPTIONS vs 
          ON v.vendor_id = vs.vendor_id

      INNER JOIN SUBSCRIPTIONS s 
          ON vs.subscription_id = s.subscription_id

      LEFT JOIN SUBSCRIPTIONPAYMENTSBYVENDOR spv 
          ON v.vendor_id = spv.vendor_id

      WHERE 
          s.subscription_name = 'Free Trial'
          AND vs.status = 'expired'
          AND spv.payment_id IS NULL;
    `;

      const results = await db(query);

      if (results.length === 0) {
        return res.status(200).json({
          success: false,
          message: "No vendors found who completed trial but didn't purchase.",
        });
      }

      res.status(200).json({
        success: true,
        data: results,
      });
    } catch (error) {
      console.error("Error:", error);
      next(new AppError("Failed to fetch vendors", 500));
    }
  },
);
