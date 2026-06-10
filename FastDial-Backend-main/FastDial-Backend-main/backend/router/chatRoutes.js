const express = require("express");
const router = express.Router();
const chatController = require("../controllers/chatController");

router.post("/get-room", async (req, res) => {
  const { vendor_id, customer_id } = req.body;

  if (!vendor_id || !customer_id) {
    return res
      .status(400)
      .json({ error: "vendor_id and customer_id are required" });
  }

  try {
    const chat_room_id = await chatController.createChatRoomIfNotExists(
      vendor_id,
      customer_id
    );
    res.status(200).json({ chat_room_id });
  } catch (err) {
    console.error("Error getting/creating room:", err);
    res.status(500).json({ error: "Failed to get chat room" });
  }
});

router.get("/messages/:chat_room_id", async (req, res) => {
  const chatRoomId = Number(req.params.chat_room_id);

  if (isNaN(chatRoomId)) {
    return res.status(400).json({ error: "Invalid chat_room_id" });
  }

  try {
    const messages = await chatController.getMessages(chatRoomId);
    res.status(200).json(messages);
  } catch (err) {
    console.error("Error fetching messages:", err);
    res.status(500).json({ error: "Failed to fetch messages" });
  }
});

module.exports = router;
