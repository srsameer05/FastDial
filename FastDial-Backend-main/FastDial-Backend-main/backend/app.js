const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const cors = require("cors");
const helmet = require("helmet");

const app = express();

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
const { initializeSocket } = require("./socket/socketServer");
const {
  getSLIDER_IMAGES,
} = require("./controllers/cutomers/customersdataController");
app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const server = http.createServer(app);

const io = socketIo(server, {
  path: "/socket.io",
  cors: {
    origin: ["https://quickserve.info", "https://fastdial.in", "http://localhost:5173", "http://localhost:5174"],
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

module.exports = server;
//dummy
