const jwt = require("jsonwebtoken");
const ChatMessage = require("../models/chatMessage");

module.exports = (io) => {
  io.on("connection", (socket) => {
    console.log(`New client connected: ${socket.id}`);

    // const token = socket.handshake.query.token;
    const token = socket.handshake.auth?.token || socket.handshake.query?.token;

    if (!token) {
      console.error("No token provided, disconnecting:", socket.id);
      socket.disconnect();
      return;
    }

    try {
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || "your_jwt_secret"
      );
      socket.user = decoded;
      console.log(`Authenticated user: ${decoded.id}, socket: ${socket.id}`);
    } catch (error) {
      console.error("Invalid token, disconnecting:", socket.id, error.message);
      socket.disconnect();
      return;
    }

    socket.on("joinRoom", ({ chat_room_id }) => {
      if (!chat_room_id) {
        console.error("Missing chat_room_id:", socket.id);
        // socket.emit("error", { message: "Missing chat_room_id" });
        return;
      }
      socket.join(`room_${chat_room_id}`);
      console.log(`Socket ${socket.id} joined room_${chat_room_id}`);
      socket.emit("joinedRoom", { chat_room_id });
    });

    socket.on(
      "sendMessage",
      async ({ chat_room_id, sender_type, sender_id, message }) => {
        if (!chat_room_id || !sender_type || !sender_id || !message) {
          console.error("Invalid message data:", {
            chat_room_id,
            sender_type,
            sender_id,
            message,
          });
          socket.emit("error", { message: "Invalid message data" });
          return;
        }

        const messageData = {
          chat_room_id,
          sender_type,
          sender_id,
          message,
          sent_at: new Date().toISOString(),
        };

        try {
          // Save message to DB
          await ChatMessage.saveMessage(
            chat_room_id,
            sender_type,
            sender_id,
            message
          );

          console.log(`Sending message to room_${chat_room_id}:`, messageData);

          io.to(`room_${chat_room_id}`).emit("receiveMessage", messageData);
        } catch (err) {
          console.error("Error saving message:", err);
          // socket.emit("error", { message: "Failed to save message" });
        }
      }
    );

    socket.on("syncMessages", ({ chat_room_id }) => {
      console.log(`Sync messages requested for room_${chat_room_id}`);
      socket.emit("syncMessagesResponse", []);
    });

    socket.on("disconnect", () => {
      console.log(`Client disconnected: ${socket.id}`);
    });

    socket.on("error", (error) => {
      console.error(`Socket error: ${socket.id}`, error);
    });
  });
};
