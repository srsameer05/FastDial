const db = require("../../database/db");
const AppError = require("../../utils/appError");
const catchAsyncError = require("../../utils/catchAsyncError");
const getData = require("../../database/dbquerieshandlers");

const {
  generateInsertStatement,
  generateUpdateStatement,
} = require("../../database/sqlStatementGenarator");

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
const { getIO } = require("../../socket/socketServer");
const crypto = require("crypto");

exports.getadmin = catchAsyncError(async (req, res, next) => {
  getData(req, res, "ADMINS");
});

exports.getvendors = catchAsyncError(async (req, res, next) => {
  const vendorId = req.user.vendor_id;

  const vendors = await db(`SELECT * FROM VENDORS WHERE vendor_id = ?`, [
    vendorId,
  ]);
  console.log("Fetched vendor data:", vendors);
  if (vendors.length === 0) {
    return res.status(404).json({
      success: false,
      message: "Vendor not found",
    });
  }

  const vendorServices = await db(
    `
    SELECT VS.vendor_id, S.service_name
    FROM VENDOR_SERVICES VS
    JOIN SERVICES S ON VS.service_id = S.service_id
    WHERE VS.vendor_id = ?
    `,
    [vendorId],
  );

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
    vendor: formattedVendors[0], // Only one vendor expected
  });
});

// exports.updatevendors = catchAsyncError(async (req, res, next) => {
//   const { vendor_id, services, ...updateFields } = req.body;

//   if (!vendor_id) {
//     return next(new AppError("Vendor ID is required for update", 400));
//   }

//   const [existingVendor] = await db(
//     "SELECT * FROM VENDORS WHERE vendor_id = ?",
//     [vendor_id]
//   );

//   if (!existingVendor) {
//     return next(new AppError("Vendor not found", 404));
//   }

//   const allowedFields = [
//     "vendor_name",
//     "vendor_email",
//     "vendor_mobile",
//     "name_of_bussiness",
//     "bussiness_category",
//     "fast_service_category_name",
//     "bussiness_proof_doc_url",
//     "gst_number",
//     "company_category",
//     "service_radius",
//     "bussiness_address",
//     "pincode",
//     "service_start_time",
//     "service_end_time",
//     "bussiness_desc",
//     "image_url",
//     "account_details",
//     "kyc_docs",
//     "vendor_address",
//   ];

//   const updates = [];
//   const values = [];

//   for (const key of allowedFields) {
//     if (updateFields[key] !== undefined) {
//       let value = updateFields[key];

//       // Handle JSON fields properly
//       if (
//         ["image_url", "account_details", "kyc_docs", "vendor_address"].includes(
//           key
//         )
//       ) {
//         value = JSON.stringify(value);
//       }

//       updates.push(`${key} = ?`);
//       values.push(value);
//     }
//   }

//   if (updates.length === 0) {
//     return next(new AppError("No valid fields provided for update", 400));
//   }

//   values.push(vendor_id); // for WHERE clause

//   const updateQuery = `UPDATE VENDORS SET ${updates.join(
//     ", "
//   )} WHERE vendor_id = ?`;

//   await db(updateQuery, values);

//   // Handle services update if provided
//   if (Array.isArray(services)) {
//     await db("DELETE FROM VENDOR_SERVICES WHERE vendor_id = ?", [vendor_id]);

//     for (const serviceName of services) {
//       const [serviceRow] = await db(
//         "SELECT service_id, service_description, service_price FROM SERVICES WHERE service_name = ?",
//         [serviceName]
//       );

//       if (serviceRow?.service_id) {
//         await db(
//           `INSERT INTO VENDOR_SERVICES (vendor_id, service_id, service_description, service_price)
//            VALUES (?, ?, ?, ?)`,
//           [
//             vendor_id,
//             serviceRow.service_id,
//             serviceRow.service_description || null,
//             serviceRow.service_price || 0,
//           ]
//         );
//       }
//     }
//   }

//   res.status(200).json({
//     success: true,
//     message: "Vendor updated successfully",
//   });
// });

exports.updatevendors = catchAsyncError(async (req, res, next) => {
  const { vendor_id, services, ...restFields } = req.body;

  if (!vendor_id) {
    return next(new AppError("Vendor ID is required for update", 400));
  }

  const [existingVendor] = await db(
    "SELECT * FROM VENDORS WHERE vendor_id = ?",
    [vendor_id],
  );

  if (!existingVendor) {
    return next(new AppError("Vendor not found", 404));
  }

  const fieldsToUpdate = [];
  const values = [];

  const validKeys = [
    "vendor_name",
    "vendor_email",
    "vendor_mobile",
    "name_of_bussiness",
    "bussiness_category",
    "fast_service_category_name",
    "bussiness_proof_doc_url",
    "gst_number",
    "company_category",
    "service_radius",
    "bussiness_address",
    "pincode",
    "service_start_time",
    "service_end_time",
    "bussiness_desc",
    "image_url",
    "account_details",
    "kyc_docs",
    "vendor_address",
  ];

  for (const key of validKeys) {
    if (restFields[key] !== undefined) {
      let value = restFields[key];

      if (
        ["image_url", "account_details", "kyc_docs", "vendor_address"].includes(
          key,
        )
      ) {
        value = JSON.stringify(value);
      }

      fieldsToUpdate.push(`${key} = ?`);
      values.push(value);
    }
  }

  if (fieldsToUpdate.length > 0) {
    const updateQuery = `UPDATE VENDORS SET ${fieldsToUpdate.join(
      ", ",
    )} WHERE vendor_id = ?`;
    values.push(vendor_id);
    await db(updateQuery, values);
  }

  if (Array.isArray(services)) {
    await db("DELETE FROM VENDOR_SERVICES WHERE vendor_id = ?", [vendor_id]);

    for (const serviceName of services) {
      const [serviceRow] = await db(
        "SELECT service_id, service_description, service_price FROM SERVICES WHERE service_name = ?",
        [serviceName],
      );

      if (serviceRow?.service_id) {
        await db(
          `INSERT INTO VENDOR_SERVICES (vendor_id, service_id, service_description, service_price)
           VALUES (?, ?, ?, ?)`,
          [
            vendor_id,
            serviceRow.service_id,
            serviceRow.service_description || null,
            serviceRow.service_price || 0,
          ],
        );
      }
    }
  }

  if (fieldsToUpdate.length === 0 && !Array.isArray(services)) {
    return res.status(400).json({
      status: "fail",
      message: "No valid fields provided for update",
    });
  }

  res.status(200).json({
    success: true,
    message: "Vendor updated successfully",
  });
});

exports.deletevendors = catchAsyncError(async (req, res, next) => {
  const id = req.params.vendor_id;
  if (!id) {
    return res.status(403).send({ message: "Please pass id to delete" });
  }
  const statement = `DELETE FROM VENDORS WHERE vendor_id = ?`;
  await db(statement, id);
  res.status(201).send({ message: "Resource deleted" });
});

exports.deletevendorswithoutid = catchAsyncError(async (req, res, next) => {
  const vendorId = req.user.vendor_id; // Extracted from token

  if (!vendorId) {
    return res.status(403).json({ message: "Unauthorized or invalid token" });
  }

  // Check if vendor exists
  const vendor = await db(`SELECT * FROM VENDORS WHERE vendor_id = ?`, [
    vendorId,
  ]);
  if (vendor.length === 0) {
    return res.status(404).json({ message: "Vendor not found" });
  }

  // Delete vendor
  const statement = `DELETE FROM VENDORS WHERE vendor_id = ?`;
  await db(statement, [vendorId]);

  res.status(200).json({ message: "Vendor deleted successfully" });
});

exports.getVendorProfile = catchAsyncError(async (req, res, next) => {
  const { vendor_id } = req.params;

  if (!vendor_id) {
    return next(new AppError("Vendor ID is required", 400));
  }

  const getVendorQuery = `
      SELECT * FROM VENDORS WHERE vendor_id = ?;
  `;

  const vendor = await db(getVendorQuery, [vendor_id]);

  if (vendor.length === 0) {
    return next(new AppError("Vendor not found", 404));
  }

  res.status(200).json({
    message: "Vendor profile fetched successfully",
    data: vendor[0],
  });
});

exports.getSERVICES = catchAsyncError(async (req, res, next) => {
  getData(req, res, "SERVICES");
});

exports.service_with_category = catchAsyncError(async (req, res, next) => {
  const query = `
    SELECT
      s.service_id,
      s.service_name,
      s.service_description,
      s.service_price,
      s.service_image_url,
      sc.service_cat_id,
      sc.service_category_name,
      sc.service_category_url
    FROM SERVICES s
    LEFT JOIN SERVICE_CATEGORIES sc
      ON s.service_cat_id = sc.service_cat_id
    ORDER BY sc.service_category_name, s.service_name
  `;

  const services = await db(query);

  res.status(200).json({
    success: true,
    data: services,
  });
});

// VENDORSCOMPLAINTS->

exports.getvendorscomplaints = catchAsyncError(async (req, res, next) => {
  getData(req, res, "VENDORSCOMPLAINTS");
});

exports.insertvendorscomplaints = catchAsyncError(async (req, res, next) => {
  await generateInsertStatement("VENDORSCOMPLAINTS", req);
  res.status(200).send({ message: "Request submitted" });
});

exports.updatevendorscomplaints = catchAsyncError(async (req, res, next) => {
  await generateUpdateStatement("VENDORSCOMPLAINTS", req, "vend_comp_id");
  res.status(200).send({ message: "Request submitted" });
});

exports.deletevendorscomplaints = catchAsyncError(async (req, res, next) => {
  const vend_comp_id = req.params.vend_comp_id;

  if (!vend_comp_id) {
    return res
      .status(400)
      .json({ message: "Please provide a complaint ID to delete" });
  }

  const checkQuery = `SELECT * FROM VENDORSCOMPLAINTS WHERE vend_comp_id = ?`;
  const complaint = await db(checkQuery, [vend_comp_id]);

  if (complaint.length === 0) {
    return res.status(404).json({ message: "Complaint not found" });
  }

  const deleteQuery = `DELETE FROM VENDORSCOMPLAINTS WHERE vend_comp_id = ?`;
  await db(deleteQuery, [vend_comp_id]);

  res.status(200).json({ message: "Complaint deleted successfully" });
});

// exports.getcustomerservices = async (req, res) => {
//   const { vendor_id } = req.params;

//   if (!vendor_id) {
//     return res.status(400).json({ message: "Vendor ID is required" });
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
//         sb.cancelled_reason,
//         sb.vendor_id,
//         sb.booking_type,
//         sb.scheduled_date,

//         c.customer_name,
//         c.mobile,
//         c.customer_country,
//         c.gender,
//         c.customer_address,
//         c.customer_email,

//         sc.service_cat_id,
//         sc.service_category_name,
//         sc.service_desc,
//         s.service_price,
//         sc.service_category_url

//       FROM SERVICEBOOKINGS sb
//       JOIN CUSTOMERS c ON sb.customer_id = c.customer_id
//       JOIN SERVICES s ON sb.service_id = s.service_id
//       JOIN SERVICE_CATEGORIES sc ON s.service_cat_id = sc.service_cat_id
//       WHERE sb.vendor_id = ? AND sb.is_cancelled = FALSE
//     `;

//     const bookings = await db(query, [vendor_id]);

//     console.log("Fetched Bookings with Customers and Services:", bookings);

//     if (!bookings || bookings.length === 0) {
//       return res.status(404).json({ message: "No assigned bookings found" });
//     }

//     res.status(200).json({ success: true, data: bookings });
//   } catch (error) {
//     console.error("Error fetching vendor bookings:", error);
//     res.status(500).json({ message: "Server error", error: error.message });
//   }
// };

exports.getcustomerservices = async (req, res) => {
  const { vendor_id } = req.params;

  if (!vendor_id) {
    return res.status(400).json({ message: "Vendor ID is required" });
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
        sb.cancelled_reason, 
        sb.vendor_id, 
        sb.booking_type,
        sb.scheduled_date,

        c.customer_name, 
        c.mobile, 
        c.customer_country, 
        c.gender, 
        c.customer_address, 
        c.customer_email,

        sc.service_cat_id,
        sc.service_category_name, 
        sc.service_desc, 
        s.service_price, 
        sc.service_category_url,

        ca.address AS booking_address



      FROM SERVICEBOOKINGS sb
      JOIN CUSTOMERS c ON sb.customer_id = c.customer_id
      JOIN SERVICES s ON sb.service_id = s.service_id
      JOIN SERVICE_CATEGORIES sc ON s.service_cat_id = sc.service_cat_id
      LEFT JOIN CUSTOMER_ADDRESSES ca ON sb.address_id = ca.address_id
      WHERE sb.vendor_id = ? 
        AND sb.is_cancelled = FALSE 
    `;

    const bookings = await db(query, [vendor_id]);

    console.log("Fetched Bookings with Customers and Services:", bookings);

    if (!bookings || bookings.length === 0) {
      return res.status(404).json({ message: "No assigned bookings found" });
    }

    res.status(200).json({ success: true, data: bookings });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.getCompletedBookings = async (req, res) => {
  const { vendor_id } = req.params;

  if (!vendor_id) {
    return res.status(400).json({ message: "Vendor ID is required" });
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
        vs.service_description,        -- 👉 coming from VENDOR_SERVICES
        vs.service_price,       -- 👉 coming from VENDOR_SERVICES
        sc.service_category_url,

          ca.address AS booking_address

      FROM SERVICEBOOKINGS sb
      JOIN CUSTOMERS c ON sb.customer_id = c.customer_id
      JOIN VENDOR_SERVICES vs ON sb.vendor_id = vs.vendor_id AND sb.service_id = vs.service_id
      JOIN SERVICES s ON sb.service_id = s.service_id
      JOIN SERVICE_CATEGORIES sc ON s.service_cat_id = sc.service_cat_id
       LEFT JOIN CUSTOMER_ADDRESSES ca ON sb.address_id = ca.address_id
      WHERE sb.vendor_id = ? AND sb.is_completed = TRUE
    `;

    const bookings = await db(query, [vendor_id]);

    res.status(200).json({ success: true, data: bookings });
  } catch (error) {
    console.error("Error fetching completed bookings:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.getAcceptedBookings = async (req, res) => {
  const { vendor_id } = req.params;

  if (!vendor_id) {
    return res.status(400).json({ message: "Vendor ID is required" });
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
        vs.service_description,   -- from VENDOR_SERVICES
        vs.service_price,         -- from VENDOR_SERVICES
        sc.service_category_url,

        ca.address AS booking_address

      FROM SERVICEBOOKINGS sb
      JOIN CUSTOMERS c ON sb.customer_id = c.customer_id
      left JOIN VENDOR_SERVICES vs ON sb.vendor_id = vs.vendor_id AND sb.service_id = vs.service_id
      JOIN SERVICES s ON sb.service_id = s.service_id
      JOIN SERVICE_CATEGORIES sc ON s.service_cat_id = sc.service_cat_id
      LEFT JOIN CUSTOMER_ADDRESSES ca ON c.customer_id = ca.customer_id
      WHERE sb.vendor_id = ? AND sb.is_accept = TRUE
    `;

    const bookings = await db(query, [vendor_id]);

    res.status(200).json({ success: true, data: bookings });
  } catch (error) {
    console.error("Error fetching accepted bookings:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// exports.getCancelledBookings = async (req, res) => {
//   const { vendor_id } = req.params;

//   if (!vendor_id) {
//     return res.status(400).json({ message: "Vendor ID is required" });
//   }

//   try {
//     console.log("Fetching cancelled bookings for vendor:", vendor_id);

//     const query = `
//       SELECT
//         sb.booking_id,
//         sb.service_id,
//         sb.customer_id,
//         sb.is_booked,
//         sb.is_completed,
//         sb.is_cancelled,
//         sb.cancelled_reason,
//         sb.cancelled_date,
//         sb.vendor_id,
//         sb.created_at,
//         sb.updated_at,

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

//         ca.address AS booking_address

//       FROM SERVICEBOOKINGS sb
//       JOIN CUSTOMERS c ON sb.customer_id = c.customer_id
//       LEFT JOIN VENDOR_SERVICES vs ON sb.vendor_id = vs.vendor_id AND sb.service_id = vs.service_id
//       LEFT JOIN SERVICES s ON sb.service_id = s.service_id
//       LEFT JOIN SERVICE_CATEGORIES sc ON s.service_cat_id = sc.service_cat_id
//       LEFT JOIN CUSTOMER_ADDRESSES ca ON c.customer_id = ca.customer_id
//       WHERE sb.vendor_id = ? AND sb.is_cancelled = TRUE
//       ORDER BY sb.cancelled_date DESC
//     `;

//     const bookings = await db(query, [vendor_id]);

//     console.log("Cancelled bookings result:", bookings);

//     res
//       .status(200)
//       .json({ success: true, count: bookings.length, data: bookings });
//   } catch (error) {
//     console.error("Error fetching cancelled bookings:", error);
//     res
//       .status(500)
//       .json({ success: false, message: "Server error", error: error.message });
//   }
// };

exports.getCancelledBookings = async (req, res) => {
  const { vendor_id } = req.params;

  if (!vendor_id) {
    return res.status(400).json({ message: "Vendor ID is required" });
  }

  try {
    console.log("Fetching cancelled bookings for vendor:", vendor_id);

    const query = `
      SELECT 
        sb.booking_id, 
        sb.service_id,
        sb.customer_id, 
        sb.is_booked, 
        sb.is_completed, 
        sb.is_cancelled, 
        sb.cancelled_reason, 
        sb.cancelled_date,
        sb.vendor_id, 
        sb.created_at,
        sb.updated_at,

        c.customer_name, 
        c.mobile, 
        c.customer_country, 
        c.gender, 
        c.customer_email, 
        c.customer_address,

        sc.service_cat_id,
        sc.service_category_name, 
        vs.service_description,        
        vs.service_price,        
        sc.service_category_url,

        ca.address AS booking_address   -- ✅ fixed
      FROM SERVICEBOOKINGS sb
      JOIN CUSTOMERS c ON sb.customer_id = c.customer_id
      LEFT JOIN VENDOR_SERVICES vs ON sb.vendor_id = vs.vendor_id AND sb.service_id = vs.service_id
      LEFT JOIN SERVICES s ON sb.service_id = s.service_id
      LEFT JOIN SERVICE_CATEGORIES sc ON s.service_cat_id = sc.service_cat_id
       LEFT JOIN CUSTOMER_ADDRESSES ca ON sb.address_id = ca.address_id
      WHERE sb.vendor_id = ? AND sb.is_cancelled = TRUE
      ORDER BY sb.cancelled_date DESC
    `;

    const bookings = await db(query, [vendor_id]);

    console.log("Cancelled bookings result:", bookings);

    res
      .status(200)
      .json({ success: true, count: bookings.length, data: bookings });
  } catch (error) {
    console.error("Error fetching cancelled bookings:", error);
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

exports.getCancelledBookingsPerMonth = async (req, res) => {
  const { vendor_id } = req.params;

  if (!vendor_id) {
    return res.status(400).json({ message: "Vendor ID is required" });
  }

  try {
    const query = `
      SELECT 
        DATE_FORMAT(cancelled_date, '%Y-%m') AS month, 
        COUNT(*) AS cancelled_count
      FROM SERVICEBOOKINGS 
      WHERE vendor_id = ? AND is_cancelled = TRUE AND cancelled_date IS NOT NULL
      GROUP BY month
      ORDER BY month DESC
    `;

    const result = await db(query, [vendor_id]);

    res.status(200).json({ success: true, data: result });
  } catch (error) {
    console.error("Error fetching cancelled bookings per month:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.getCompletedBookingsPerMonth = async (req, res) => {
  const { vendor_id } = req.params;

  if (!vendor_id) {
    return res.status(400).json({ message: "Vendor ID is required" });
  }

  try {
    const query = `
      SELECT 
        DATE_FORMAT(completed_date, '%Y-%m') AS month, 
        COUNT(*) AS completed_count
      FROM SERVICEBOOKINGS 
      WHERE vendor_id = ? AND is_completed = TRUE AND completed_date IS NOT NULL
      GROUP BY month
      ORDER BY month DESC
    `;

    const result = await db(query, [vendor_id]);

    res.status(200).json({ success: true, data: result });
  } catch (error) {
    console.error("Error fetching completed bookings per month:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.getTotalServiceRequestsPerMonth = async (req, res) => {
  const { vendor_id } = req.params;

  if (!vendor_id) {
    return res.status(400).json({ message: "Vendor ID is required" });
  }

  try {
    const query = `
      SELECT 
        DATE_FORMAT(created_at, '%Y-%m') AS month, 
        COUNT(*) AS total_requests
      FROM SERVICEBOOKINGS 
      WHERE vendor_id = ?
      GROUP BY DATE_FORMAT(created_at, '%Y-%m')
      ORDER BY DATE_FORMAT(created_at, '%Y-%m') DESC
    `;

    const result = await db(query, [vendor_id]);

    res.status(200).json({ success: true, data: result });
  } catch (error) {
    console.error("Error fetching total service requests per month:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.getVendorEarnings = async (req, res) => {
  try {
    const { vendor_id } = req.params;

    if (!vendor_id) {
      return res.status(400).json({ message: "Vendor ID is required" });
    }

    const query = `
      SELECT SUM(cp.payment_amount) AS total_earnings
      FROM CUSTOMERPAYMENTS cp
      JOIN SERVICEBOOKINGS sb ON cp.booking_id = sb.booking_id
      WHERE sb.vendor_id = ?;
    `;

    db(query, [vendor_id], (err, results) => {
      if (err) {
        console.error("Error fetching vendor earnings:", err);
        return res.status(500).json({ message: "Server error" });
      }

      const totalEarnings = results[0].total_earnings || 0;

      res.json({ vendor_id, total_earnings: totalEarnings });
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.updateservicebooking = catchAsyncError(async (req, res, next) => {
  await generateUpdateStatement("SERVICEBOOKINGS", req, "booking_id");
  res.status(200).send({ message: "Request submitted" });
});

exports.getSUBSCRIPTIONS = catchAsyncError(async (req, res, next) => {
  getData(req, res, "SUBSCRIPTIONS");
});

exports.updateSUBSCRIPTIONS = catchAsyncError(async (req, res, next) => {
  await generateUpdateStatement("SUBSCRIPTIONS", req, "subscription_id");
  res.status(200).send({ message: "Request submitted" });
});

exports.createSubscriptionPayment = async (req, res) => {
  const { subscription_id } = req.body;

  const subscription = await db(
    "SELECT * FROM SUBSCRIPTIONS WHERE subscription_id = ?",
    [subscription_id],
  );

  if (!subscription.length)
    return res.status(404).json({ message: "Subscription not found" });

  console.log(subscription);
  const amountInPaise = parseFloat(subscription[0].subscription_price) * 100;

  const options = {
    amount: amountInPaise,
    currency: "INR",
    receipt: `receipt_sub_${subscription_id}_${Date.now()}`,
    notes: {
      subscription_id: subscription_id.toString(),
    },
    payment_capture: 1,
  };

  try {
      const razorpay = getRazorpayClient();
    const order = await razorpay.orders.create(options);
    return res.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
    });
  } catch (err) {
    return res
      .status(500)
      .json({ error: "Failed to create Razorpay order", details: err.message });
  }
};

exports.verifyPayment = async (req, res) => {
  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    subscription_id,
  } = req.body;

  try {
    console.log(req.user);
    const vendor_id = req.user.vendor_id;

    const subscription = await db(
      "SELECT subscription_price, subscription_name, duration_in_days FROM SUBSCRIPTIONS WHERE subscription_id = ?",
      [subscription_id],
    );

    if (!subscription.length) {
      return res
        .status(404)
        .json({ success: false, message: "Subscription not found" });
    }

    const {
      subscription_price: price,
      subscription_name: plan_name,
      duration_in_days,
    } = subscription[0];

    const today = new Date();
    const renewalDate = new Date(today);
    renewalDate.setDate(today.getDate() + duration_in_days);

    const formattedRenewalDate = renewalDate.toISOString().split("T")[0];

    const paymentDetails = {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      price,
      plan_name,
      renewal_date: formattedRenewalDate,
    };

    await db(
      "INSERT INTO SUBSCRIPTIONPAYMENTSBYVENDOR (subscription_id, vendor_id, payment_details) VALUES (?, ?, ?)",
      [subscription_id, vendor_id, JSON.stringify(paymentDetails)],
    );

    return res.json({
      success: true,
      message: "Payment saved (with price, plan name, and renewal date)",
    });
  } catch (error) {
    console.error("Verification Error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// exports.verifyPayment = async (req, res) => {
//   const {
//     razorpay_order_id,
//     razorpay_payment_id,
//     razorpay_signature,
//     subscription_id,
//   } = req.body;

//   if (
//     !razorpay_order_id ||
//     !razorpay_payment_id ||
//     !razorpay_signature ||
//     !subscription_id
//   ) {
//     return res
//       .status(400)
//       .json({ success: false, message: "Missing required parameters" });
//   }

//   try {
//     const vendor_id = req.user.vendor_id;

//     const body = razorpay_order_id + "|" + razorpay_payment_id;
//     const expectedSignature = crypto
//       .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
//       .update(body.toString())
//       .digest("hex");

//     if (expectedSignature !== razorpay_signature) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid signature, payment verification failed",
//       });
//     }

//     const subscription = await db(
//       "SELECT subscription_price, subscription_name, duration_in_days FROM SUBSCRIPTIONS WHERE subscription_id = ?",
//       [subscription_id],
//     );

//     if (!subscription.length) {
//       return res
//         .status(404)
//         .json({ success: false, message: "Subscription not found" });
//     }

//     const {
//       subscription_price: price,
//       subscription_name: plan_name,
//       duration_in_days,
//     } = subscription[0];

//     const today = new Date();
//     const renewalDate = new Date(today);
//     renewalDate.setDate(today.getDate() + duration_in_days);
//     const formattedRenewalDate = renewalDate.toISOString().split("T")[0];

//     const paymentDetails = {
//       razorpay_order_id,
//       razorpay_payment_id,
//       razorpay_signature,
//       price,
//       plan_name,
//       renewal_date: formattedRenewalDate,
//     };

//     await db(
//       "INSERT INTO SUBSCRIPTIONPAYMENTSBYVENDOR (subscription_id, vendor_id, payment_details) VALUES (?, ?, ?)",
//       [subscription_id, vendor_id, JSON.stringify(paymentDetails)],
//     );

//     return res.json({
//       success: true,
//       message: "Payment verified and subscription updated",
//       renewal_date: formattedRenewalDate,
//     });
//   } catch (error) {
//     console.error("Verification Error:", error);
//     res.status(500).json({ success: false, message: "Internal server error" });
//   }
// };

exports.getVendorPayments = async (req, res) => {
  try {
    const { vendor_id } = req.params;

    if (!vendor_id) {
      return res.status(400).json({
        success: false,
        message: "vendor_id is required",
      });
    }

    const results = await db(
      `
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
      WHERE v.vendor_id = ?
      `,
      [vendor_id],
    );

    res.status(200).json({
      success: true,
      data: results,
    });
  } catch (error) {
    console.error("Error fetching vendor payments:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

exports.getVendorPayment = async (req, res) => {
  try {
    const vendor_id = req.user.vendor_id;

    if (!vendor_id) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized or invalid token",
      });
    }

    const results = await db(
      `
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
      WHERE v.vendor_id = ?
      `,
      [vendor_id],
    );

    res.status(200).json({
      success: true,
      data: results,
    });
  } catch (error) {
    console.error("Error fetching vendor payments:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

exports.getVENDOR_SERVICES = catchAsyncError(async (req, res, next) => {
  getData(req, res, "VENDOR_SERVICES");
});

exports.updateVENDOR_SERVICES = catchAsyncError(async (req, res, next) => {
  await generateUpdateStatement("VENDOR_SERVICES", req, "id");
  res.status(200).send({ message: "Request submitted" });
});

//  vendor-service link

exports.deleteVENDOR_SERVICES = catchAsyncError(async (req, res, next) => {
  const id = req.params.id;
  if (!id) {
    return res.status(403).send({ message: "Please pass id to delete" });
  }
  const statement = `DELETE FROM VENDOR_SERVICES WHERE id = ?`;
  await db(statement, id);
  res.status(201).send({ message: "Resource deleted" });
});

exports.updateSERVICES = catchAsyncError(async (req, res, next) => {
  await generateUpdateStatement("SERVICES", req, "service_id");
  res.status(200).send({ message: "Request submitted" });
});

exports.getSERVICE_CATEGORIES = catchAsyncError(async (req, res, next) => {
  getData(req, res, "SERVICE_CATEGORIES");
});

exports.getCUSTOMERS = catchAsyncError(async (req, res, next) => {
  getData(req, res, "CUSTOMERS");
});

exports.getCustomersWithBookingsForVendor = async (req, res) => {
  const vendor_id = req.user.vendor_id; // Assumes vendor_id is extracted from token

  try {
    const customers = await db(
      `SELECT DISTINCT
         c.customer_id,
         c.customer_name,
         c.mobile,
         c.customer_country,
         c.gender,
         c.customer_address,
         c.customer_email,
         c.customer_image
       FROM SERVICEBOOKINGS sb
       JOIN CUSTOMERS c ON sb.customer_id = c.customer_id
       WHERE sb.vendor_id = ?
       ORDER BY c.customer_name ASC`,
      [vendor_id],
    );

    res.status(200).json({
      success: true,
      total_customers: customers.length,
      data: customers,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Error fetching customers for vendor",
      error: error.message,
    });
  }
};

exports.getCustomerReviews = async (req, res) => {
  const { vendor_id } = req.params;

  try {
    const reviews = await db(
      `SELECT 
         r.review_id,
         r.booking_id,
         r.customer_id,
         r.vendor_id,
         r.rating,
         r.review_text,
         r.created_at,
         r.updated_at,
         c.customer_name
       FROM REVIEWS r
       JOIN CUSTOMERS c ON r.customer_id = c.customer_id
       WHERE r.vendor_id = ?
       ORDER BY r.created_at DESC`,
      [vendor_id],
    );

    res.status(200).json({
      success: true,
      total_reviews: reviews.length,
      data: reviews,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Error fetching vendor reviews",
      error: error.message,
    });
  }
};

exports.getAllReviews = async (req, res) => {
  try {
    const reviews = await db(`
      SELECT r.*, c.customer_name 
      FROM REVIEWS r
      JOIN CUSTOMERS c ON r.customer_id = c.customer_id
      ORDER BY r.created_at DESC
    `);

    res.status(200).json({
      success: true,
      total_reviews: reviews.length,
      data: reviews,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

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

exports.getPaymentDetail = async (req, res) => {
  try {
    const { customer_id } = req.params;
    const vendor_id = req.user.vendor_id;

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
      WHERE c.customer_id = ? AND sb.vendor_id = ?
      ORDER BY cp.payment_date DESC;
    `;

    db(query, [customer_id, vendor_id], (err, results) => {
      if (err) {
        console.error("Error fetching payments:", err);
        return res.status(500).json({ message: "Server error" });
      }
      if (!results) {
        return res
          .status(404)
          .json({ message: "No payments found for this customer and vendor" });
      }
      res.json({ success: true, data: results });
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.checkVendorSubscriptionStatus = catchAsyncError(
  async (req, res, next) => {
    const vendorId = req.user.vendor_id;
    console.log("Vendor ID:", vendorId);

    const query = `
    SELECT 
      vs.status AS trial_status,
      s.subscription_name,
      spv.payment_id
    FROM VENDOR_SUBSCRIPTIONS vs
    INNER JOIN SUBSCRIPTIONS s ON vs.subscription_id = s.subscription_id
    LEFT JOIN SUBSCRIPTIONPAYMENTSBYVENDOR spv ON vs.vendor_id = spv.vendor_id
    WHERE vs.vendor_id = ?
    ORDER BY vs.expiry_date DESC
    LIMIT 1;
  `;

    const [result] = await db(query, [vendorId]);

    if (!result) {
      return res.status(200).json({
        success: true,
        showPopup: false,
        message: null,
      });
    }

    const isTrialExpired =
      result.subscription_name === "Free Trial" &&
      result.trial_status === "expired";
    const hasPaidSubscription = result.payment_id !== null;

    if (isTrialExpired && !hasPaidSubscription) {
      return res.status(200).json({
        success: true,
        showPopup: true,
        message:
          "Your free trial has ended. Please purchase a subscription to continue using the services.",
      });
    }

    res.status(200).json({
      success: true,
      showPopup: false,
      message: null,
    });
  },
);

// Start location tracking
exports.startLocationTracking = async (req, res) => {
  const vendor_id = req.user.vendor_id;
  const { booking_id, latitude, longitude } = req.body;

  if (!vendor_id || !booking_id || !latitude || !longitude) {
    return res.status(400).json({
      success: false,
      message: "All fields are required",
    });
  }

  try {
    // Verify booking exists and belongs to this vendor
    const bookingCheck = await db(
      `SELECT booking_id FROM SERVICEBOOKINGS 
       WHERE booking_id = ? AND vendor_id = ? AND is_completed = FALSE AND is_cancelled = FALSE`,
      [booking_id, vendor_id],
    );

    if (!bookingCheck || bookingCheck.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No active booking found for this vendor",
      });
    }

    // Store initial location in database
    await db(
      `INSERT INTO LOCATION_TRACKING 
       (user_id, user_type, latitude, longitude, booking_id) 
       VALUES (?, 'vendor', ?, ?, ?)
       ON DUPLICATE KEY UPDATE 
       latitude = VALUES(latitude),
       longitude = VALUES(longitude),
       updated_at = CURRENT_TIMESTAMP`,
      [vendor_id, latitude, longitude, booking_id],
    );

    // Get socket instance
    const io = getIO();

    // Emit initial location update to the booking room
    io.to(`booking_${booking_id}`).emit("location_update", {
      user_id: vendor_id,
      user_type: "vendor",
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

// Update vendor location in real-time
exports.updateLocation = async (req, res) => {
  const vendor_id = req.user.vendor_id;
  const { booking_id, latitude, longitude } = req.body;

  if (!vendor_id || !booking_id || !latitude || !longitude) {
    return res.status(400).json({
      success: false,
      message: "All fields are required",
    });
  }

  try {
    // Verify booking exists and belongs to this vendor
    const bookingCheck = await db(
      `SELECT booking_id FROM SERVICEBOOKINGS 
       WHERE booking_id = ? AND vendor_id = ? AND is_completed = FALSE AND is_cancelled = FALSE`,
      [booking_id, vendor_id],
    );

    if (!bookingCheck || bookingCheck.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No active booking found for this vendor",
      });
    }

    // Store location in database
    await db(
      `INSERT INTO LOCATION_TRACKING 
       (user_id, user_type, latitude, longitude, booking_id) 
       VALUES (?, 'vendor', ?, ?, ?)
       ON DUPLICATE KEY UPDATE 
       latitude = VALUES(latitude),
       longitude = VALUES(longitude),
       updated_at = CURRENT_TIMESTAMP`,
      [vendor_id, latitude, longitude, booking_id],
    );

    // Get socket instance
    const io = getIO();

    // Emit location update to the booking room
    io.to(`booking_${booking_id}`).emit("location_update", {
      user_id: vendor_id,
      user_type: "vendor",
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

// Stop location tracking
exports.stopLocationTracking = async (req, res) => {
  const vendor_id = req.user.vendor_id;
  const { booking_id } = req.body;

  if (!vendor_id || !booking_id) {
    return res.status(400).json({
      success: false,
      message: "Vendor ID and booking ID are required",
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

// exports.vendor_subscription_view = catchAsyncError(async (req, res, next) => {
//   getData(req, res, "vendor_subscription_view");
// });

exports.vendor_subscription_view = catchAsyncError(async (req, res, next) => {
  const vendorId = req.user.vendor_id;
  console.log(vendorId);

  if (!vendorId) {
    return res.status(400).json({ message: "Vendor ID is required" });
  }

  const data = await db(
    `SELECT * FROM vendor_subscription_view WHERE vendor_id = ?`,
    [vendorId],
  );

  res.status(200).json({ success: true, data: data[0] });
});
