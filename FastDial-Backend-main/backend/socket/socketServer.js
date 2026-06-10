// const socketIO = require("socket.io");
// const jwt = require("jsonwebtoken");
// const db = require("./db"); // Assume a database connection module

// let io;

// const initializeSocket = (passedIO) => {
//   if (io) return io;

//   io = passedIO;

//   console.log("Socket.IO initialized on /socket.io");

//   io.use((socket, next) => {
//     const token = socket.handshake.auth?.token;

//     if (token) {
//       try {
//         const decoded = jwt.verify(token, process.env.JWT_SECRET);
//         socket.user = decoded; // Attach user if valid
//       } catch (err) {
//         console.warn("Invalid token, continuing without authentication");
//         socket.user = null;
//       }
//     } else {
//       socket.user = null;
//     }

//     next(); // Always proceed
//   });

//   io.on("connection", (socket) => {
//     console.log("User connected:", socket.user ? socket.user.id : "Guest");

//     // Join booking room for tracking
//     socket.on("join_booking", async (booking_id) => {
//       if (!socket.user) {
//         socket.emit("error", { message: "Authentication required to join booking" });
//         return;
//       }

//       try {
//         // Verify user is associated with the booking
//         const [rows] = await db.query(
//           `SELECT 1 FROM SERVICEBOOKINGS WHERE booking_id = ? AND (customer_id = ? OR vendor_id = ?)`,
//           [booking_id, socket.user.id, socket.user.id]
//         );

//         if (rows.length === 0) {
//           socket.emit("error", { message: "Not authorized for this booking" });
//           return;
//         }

//         socket.join(`booking_${booking_id}`);
//         console.log(`User ${socket.user.id} joined booking room: ${booking_id}`);
//       } catch (err) {
//         console.error("Error joining booking:", err);
//         socket.emit("error", { message: "Failed to join booking" });
//       }
//     });

//     // Leave booking room
//     socket.on("leave_booking", (booking_id) => {
//       socket.leave(`booking_${booking_id}`);
//       console.log(`User ${socket.user?.id || "Guest"} left booking room: ${booking_id}`);
//     });

//     // Handle location updates (only if authenticated)
//     socket.on("update_location", async (data) => {
//       if (!socket.user) {
//         socket.emit("error", { message: "Authentication required to update location" });
//         return;
//       }

//       const { booking_id, latitude, longitude, accuracy, altitude, speed, heading } = data;

//       // Validate input data
//       if (
//         !booking_id ||
//         isNaN(latitude) ||
//         isNaN(longitude) ||
//         latitude < -90 ||
//         latitude > 90 ||
//         longitude < -180 ||
//         longitude > 180
//       ) {
//         socket.emit("error", { message: "Invalid location data" });
//         console.warn("Invalid location data from user:", socket.user.id);
//         return;
//       }

//       try {
//         // Verify user is associated with the booking
//         const [rows] = await db.query(
//           `SELECT 1 FROM SERVICEBOOKINGS WHERE booking_id = ? AND (customer_id = ? OR vendor_id = ?)`,
//           [booking_id, socket.user.id, socket.user.id]
//         );

//         if (rows.length === 0) {
//           socket.emit("error", { message: "Not authorized for this booking" });
//           return;
//         }

//         // Save location to database
//         await db.query(
//           `INSERT INTO LOCATION_TRACKING (booking_id, user_id, user_type, latitude, longitude, accuracy, altitude, speed, heading)
//            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
//           [
//             booking_id,
//             socket.user.id,
//             socket.user.type,
//             latitude,
//             longitude,
//             accuracy || null,
//             altitude || null,
//             speed || null,
//             heading || null,
//           ]
//         );

//         // Broadcast location update to booking room
//         io.to(`booking_${booking_id}`).emit("location_update", {
//           user_id: socket.user.id,
//           user_type: socket.user.type,
//           latitude,
//           longitude,
//           accuracy: accuracy || null,
//           altitude: altitude || null,
//           speed: speed || null,
//           heading: heading || null,
//           timestamp: new Date(),
//         });

//         console.log(`Location updated for booking ${booking_id} by user ${socket.user.id}`);
//       } catch (err) {
//         console.error("Error processing location update:", err);
//         socket.emit("error", { message: "Failed to update location" });
//       }
//     });

//     socket.on("disconnect", () => {
//       console.log("User disconnected:", socket.user ? socket.user.id : "Guest");
//     });
//   });

//   return io;
// };

// const getIO = () => {
//   if (!io) {
//     throw new Error("Socket.io not initialized");
//   }
//   return io;
// };

// module.exports = {
//   initializeSocket,
//   getIO,
// };

const socketIO = require("socket.io");
const jwt = require("jsonwebtoken");

let io;

const initializeSocket = (passedIO) => {
  if (io) return io;

  io = passedIO;

  console.log("Socket.IO initialized two on /socket.io");

  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;

    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        socket.user = decoded; // Attach user if valid
      } catch (err) {
        console.warn("Invalid token, continuing without authentication");
        socket.user = null;
      }
    } else {
      socket.user = null;
    }

    next();
  });

  io.on("connection", (socket) => {
    console.log("User connected:", socket.user ? socket.user : "Guest");

    // Join booking room for tracking
    socket.on("join_booking", (booking_id) => {
      socket.join(`booking_${booking_id}`);
      console.log(`User joined booking room: ${booking_id}`);
    });

    // Leave booking room
    socket.on("leave_booking", (booking_id) => {
      socket.leave(`booking_${booking_id}`);
      console.log(`User left booking room: ${booking_id}`);
    });

    // Handle location updates (only if authenticated)
    socket.on("update_location", (data) => {
      if (!socket.user) {
        console.warn("Unauthenticated user tried to update location");
        return;
      }

      const { booking_id, latitude, longitude } = data;
      io.to(`booking_${booking_id}`).emit("location_update", {
        user_id: socket.user.id,
        user_type: socket.user.type,
        latitude,
        longitude,
        timestamp: new Date(),
      });
    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.user ? socket.user : "Guest");
    });
  });

  return io;
};

const getIO = () => {
  if (!io) {
    throw new Error("Socket.io not initialized");
  }
  return io;
};

module.exports = {
  initializeSocket,
  getIO,
};
