const db = require("../database/db");

exports.getChatRoom = async (vendorId, adminId) => {
  try {
    const rows = await db(
      "SELECT * FROM chat_rooms WHERE vendor_id = ? AND admin_id = ?",
      [vendorId, adminId]
    );
    console.log("rows", rows);
    return rows?.[0] || null;
  } catch (err) {
    console.error("Error in getChatRoom:", err);
    throw err;
  }
};

exports.createChatRoom = async (vendorId, adminId) => {
  const [result] = await db(
    "INSERT INTO chat_rooms (vendor_id, admin_id) VALUES (?, ?)",
    [vendorId, adminId]
  );
  return result.insertId;
};
