const db = require("../database/db");

const blockIfNotSubscribed = async (req, res, next) => {
  try {
    const vendorId = req.user.vendor_id;

    const rows = await db(
      `
        SELECT spbv.payment_date, s.duration_in_days
        FROM SUBSCRIPTIONPAYMENTSBYVENDOR spbv
        JOIN SUBSCRIPTIONS s ON s.subscription_id = spbv.subscription_id
        WHERE spbv.vendor_id = ?
        ORDER BY spbv.payment_date DESC
        LIMIT 1
      `,
      [vendorId]
    );

    const [row] = rows;

    console.log("Subscription row:", row);

    if (!row) {
      return res.status(403).json({
        message: "No subscription found. Please subscribe to continue.",
      });
    }

    const { payment_date, duration_in_days } = row;

    const expiryDate = new Date(payment_date);
    expiryDate.setDate(expiryDate.getDate() + duration_in_days);

    if (expiryDate < new Date()) {
      return res.status(403).json({
        message:
          "Your subscription has expired. Please renew to access this feature.",
      });
    }

    next();
  } catch (error) {
    console.error("Subscription check failed:", error);
    res
      .status(500)
      .json({ message: "Server error while checking subscription." });
  }
};

module.exports = blockIfNotSubscribed;
