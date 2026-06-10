const db = require("../database/db"); // your mysql2 connection pool

const ChatMessage = {
  async saveMessage(chat_room_id, sender_type, sender_id, message) {
    const query = `
      INSERT INTO chat_messages (  room_id, sender_type, sender_id, message, sent_at)
      VALUES (?, ?, ?, ?, NOW())
    `;
    const values = [chat_room_id, sender_type, sender_id, message];
    await db(query, values);
  },

  async getMessagesByRoomId(chat_room_id) {
    const rows = await db(
      `SELECT * FROM chat_messages WHERE room_id= ?  ORDER BY sent_at ASC`,
      chat_room_id
    );
    console.log(rows);
    return rows;
  },
};

module.exports = ChatMessage;
