const express = require("express");
const http = require("http");
const path = require("path");
const socketIo = require("socket.io");
const cors = require("cors");
const helmet = require("helmet");

const app = express();

const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://localhost:5174",
  "http://127.0.0.1:5174",
];

// Local imports
const AppError = require("./utils/appError");
const customersRouter = require("./router/customersRouter");
const globalErrorHandler = require("./controllers/errorController");
const vendorsRouter = require("./router/vendorsRouter");
const adminRouter = require("./router/adminRouter");
const globalRouter = require("./router/handelRouter");
const chatRoutes = require("./router/chatRoutes");
const adminvendorchat = require("./router/adminvendorRouter");
const socketHandler = require("./socket/socketHandler");
const sockethandler2 = require("./socket");
const slider_image = require("./router/slider_image");
const db = require("./database/db");
const { initializeSocket } = require("./socket/socketServer");
const {
  getSLIDER_IMAGES,
} = require("./controllers/cutomers/customersdataController");
app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

const server = http.createServer(app);

const ensureSchema = async () => {
  await db(`
    CREATE TABLE IF NOT EXISTS otp (
      id INT AUTO_INCREMENT PRIMARY KEY,
      mobile VARCHAR(20) NOT NULL,
      vid VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB;
  `);

  await db(`
    CREATE TABLE IF NOT EXISTS CUSTOMERS (
      customer_id INT AUTO_INCREMENT PRIMARY KEY,
      mobile VARCHAR(20) NOT NULL UNIQUE,
      customer_name VARCHAR(255),
      customer_email VARCHAR(255),
      customer_country VARCHAR(100),
      gender VARCHAR(30),
      customer_address JSON,
      customer_image TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB;
  `);

  await db(`
    CREATE TABLE IF NOT EXISTS CUSTOMER_ADDRESSES (
      address_id INT AUTO_INCREMENT PRIMARY KEY,
      customer_id INT NOT NULL,
      address JSON NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (customer_id) REFERENCES CUSTOMERS(customer_id) ON DELETE CASCADE
    ) ENGINE=InnoDB;
  `);

  await db(`
    CREATE TABLE IF NOT EXISTS SLIDER_IMAGES (
      id INT AUTO_INCREMENT PRIMARY KEY,
      image_path VARCHAR(1024) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB;
  `);

  await db(`
    CREATE TABLE IF NOT EXISTS ADMINS (
      admin_id INT AUTO_INCREMENT PRIMARY KEY,
      admin_name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL UNIQUE,
      password VARCHAR(255) NOT NULL,
      phone VARCHAR(50),
      image VARCHAR(1024),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB;
  `);
};

const io = socketIo(server, {
  path: "/socket.io",
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

socketHandler(io);
sockethandler2(io);

app.use("/api/v1/chat", adminvendorchat);
app.use("/api/v1/customers", customersRouter);
app.use("/api/v1/vendors", vendorsRouter);
app.use("/api/v1/admin", adminRouter);
app.use("/api/v1/global", globalRouter);
app.use("/api/v1/chats", chatRoutes);
app.use("/api/v1/customer", slider_image);

app.get("/health", (req, res) => {
  res.status(200).send("API server up");
});

initializeSocket(io);

// Global error handler
app.use(globalErrorHandler);

module.exports = {
  server,
  ensureSchema,
};
//dummy
