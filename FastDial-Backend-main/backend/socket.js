const jwt = require("jsonwebtoken");
const chatController = require("./controllers/chatController");

module.exports = (io) => {
  io.on("connection", (socket) => {
    console.log(` New client connected: ${socket.id}`);

    // const token = socket.handshake.query.token;
    const token = socket.handshake.auth?.token || socket.handshake.query?.token;

    if (!token) {
      console.error(" No token provided, disconnecting:", socket.id);
      socket.disconnect();
      return;
    }

    try {
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || "your_jwt_secret"
      );
      socket.user = decoded;
      console.log(` Authenticated user: ${decoded.id}, socket: ${socket.id}`);
    } catch (error) {
      console.error(" Invalid token, disconnecting:", socket.id, error.message);
      socket.disconnect();
      return;
    }

    socket.on("joinRoom", ({ vendor_id, customer_id, admin_id }) => {
      if (!(vendor_id && (customer_id || admin_id))) {
        console.error(" Missing vendor_id or customer_id/admin_id");
        socket.emit("error", {
          message: "Missing vendor_id or customer_id/admin_id",
        });
        return;
      }

      chatController
        .createChatRoomIfNotExists(vendor_id, customer_id, admin_id)
        .then((chat_room_id) => {
          socket.join(`room_${chat_room_id}`);
          console.log(`Socket ${socket.id} joined room_${chat_room_id}`);
          socket.emit("joinedRoom", { chat_room_id });
        })
        .catch((err) => {
          console.error(" Error joining room:", err);
          socket.emit("error", { message: "Failed to join room" });
        });
    });

    socket.on(
      "sendMessage",
      async ({
        vendor_id,
        customer_id,
        admin_id,
        sender_type,
        sender_id,
        message,
      }) => {
        console.log("Received sendMessage payload:", {
          vendor_id,
          customer_id,
          admin_id,
          sender_type,
          sender_id,
          message,
        });

        if (
          !vendor_id ||
          !(customer_id || admin_id) ||
          !sender_type ||
          !sender_id ||
          !message
        ) {
          console.error(" Invalid message data:", {
            vendor_id,
            customer_id,
            admin_id,
            sender_type,
            sender_id,
            message,
          });
          socket.emit("error", { message: "Invalid message data" });
          return;
        }

        try {
          const parsedVendorId = parseInt(vendor_id);
          const parsedCustomerId = customer_id ? parseInt(customer_id) : null;
          const parsedAdminId = admin_id ? parseInt(admin_id) : null;
          const parsedSenderId = parseInt(sender_id);

          if (!["vendor", "customer", "admin"].includes(sender_type)) {
            console.error(" Invalid sender_type:", sender_type);
            socket.emit("error", { message: "Invalid sender_type" });
            return;
          }

          const chat_room_id = await chatController.createChatRoomIfNotExists(
            parsedVendorId,
            parsedCustomerId,
            parsedAdminId
          );

          let savedMessage;
          try {
            console.log(`Attempting to save message for room_${chat_room_id}`);
            savedMessage = await chatController.saveMessage({
              chat_room_id,
              sender_type,
              sender_id: parsedSenderId,
              message,
            });
          } catch (saveErr) {
            console.warn("Non-fatal error in saveMessage:", {
              message: saveErr.message,
              stack: saveErr.stack,
              chat_room_id,
              sender_type,
              sender_id,
              vendor_id,
              customer_id,
              admin_id,
            });
            if (!savedMessage) {
              console.error(
                "Failed to save message, no savedMessage returned:",
                {
                  chat_room_id,
                  sender_type,
                  sender_id,
                  message,
                }
              );
              socket.emit("error", {
                message: `Failed to save message: ${saveErr.message}`,
              });
              return;
            }
          }

          const payload = {
            chat_room_id,
            sender_type,
            sender_id: parsedSenderId,
            message,
            sent_at: savedMessage.sent_at || new Date().toISOString(),
          };

          console.log(`Sending message to room_${chat_room_id}:`, payload);
          io.to(`room_${chat_room_id}`).emit("receiveMessage", payload);
        } catch (err) {
          console.error("Critical error sending message:", {
            message: err.message,
            stack: err.stack,
            chat_room_id,
            sender_type,
            sender_id,
            vendor_id,
            customer_id,
            admin_id,
          });
          socket.emit("error", {
            message: `Failed to send message: ${err.message}`,
          });
          return;
        }
      }
    );

    socket.on("syncMessages", async ({ chat_room_id }) => {
      if (!chat_room_id) {
        socket.emit("error", { message: "chat_room_id is required" });
        return;
      }

      try {
        const messages = await chatController.getMessages(chat_room_id);
        socket.emit("syncMessagesResponse", { messages });
      } catch (err) {
        console.error(" Failed to fetch messages:", err);
        socket.emit("error", { message: "Failed to fetch messages" });
      }
    });

    socket.on("disconnect", () => {
      console.log(` Client disconnected: ${socket.id}`);
    });

    socket.on("error", (error) => {
      console.error(`Socket error [${socket.id}]:`, error);
    });

    // // Commented out: Redundant error listener (already handled by socket.on("error"))
    // socket.on("error", (error) => {
    //   console.error(`Socket error [${socket.id}]:`, error);
    // });
  });
};
