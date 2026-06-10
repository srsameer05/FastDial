const db = require("../database/db");

exports.createChatRoomIfNotExists = async (vendor_id, customer_id) => {
  try {
    const rows = await db(
      `SELECT chat_room_id FROM chat_room WHERE vendor_id = ? AND customer_id = ?`,
      [vendor_id, customer_id]
    );

    if (Array.isArray(rows) && rows.length > 0) {
      return rows[0].chat_room_id;
    }

    const result = await db(
      `INSERT INTO chat_room (vendor_id, customer_id) VALUES (?, ?)`,
      [vendor_id, customer_id]
    );

    return result.insertId;
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY") {
      const existing = await db(
        `SELECT chat_room_id FROM chat_room WHERE vendor_id = ? AND customer_id = ?`,
        [vendor_id, customer_id]
      );
      return existing[0]?.chat_room_id;
    }

    console.error("Error in createChatRoomIfNotExists:", err);
    throw err;
  }
};

exports.saveMessage = async ({
  chat_room_id,
  sender_type,
  sender_id,
  message,
}) => {
  try {
    const result = await db(
      `INSERT INTO messages (chat_room_id, sender_type, sender_id, message) VALUES (?, ?, ?, ?)`,
      [chat_room_id, sender_type, sender_id, message]
    );

    console.log("Message inserted:", result);

    const [saved] = await db(
      `SELECT * FROM messages WHERE chat_room_id = ? ORDER BY sent_at DESC LIMIT 1`,
      [chat_room_id]
    );

    return saved;
  } catch (err) {
    console.error("Error saving message:", err);
    throw err;
  }
};

exports.getMessages = async (chat_room_id) => {
  try {
    const messages = await db(
      `SELECT * FROM messages WHERE chat_room_id = ? ORDER BY sent_at ASC`,
      [chat_room_id]
    );
    console.log(messages);
    return messages;
  } catch (err) {
    console.error("Error fetching messages:", err);
    throw err;
  }
};
