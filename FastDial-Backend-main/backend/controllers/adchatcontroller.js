const ChatRoom = require("../models/chatRoom");
const ChatMessage = require("../models/chatMessage");

exports.getOrCreateRoom = async (req, res) => {
  const { vendorId, adminId } = req.body;

  let room = await ChatRoom.getChatRoom(vendorId, adminId);
  if (!room) {
    const roomId = await ChatRoom.createChatRoom(vendorId, adminId);
    return res.status(200).json({ roomId });
  }

  return res.status(200).json({ roomId: room.room_id });
};

exports.getMessagesByRoom = async (req, res) => {
  const { room_id } = req.params;

  if (!room_id) {
    return res.status(400).json({ message: "room_id is required" });
  }

  try {
    const messages = await ChatMessage.getMessagesByRoomId(room_id);
    res.json({ success: true, messages });
  } catch (err) {
    console.error("Error fetching messages:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
