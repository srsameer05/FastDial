const dotenv = require("dotenv");

process.on("uncaughtException", (err) => {
  console.log("UNCAUGHT EXCEPTION! Shutting down service!");
  console.log(err.name, err.message);
  process.exit(1);
});

dotenv.config();

const httpServer = require("./app");

const port = process.env.PORT || 3000;

const server = httpServer.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

process.on("unhandledRejection", (err) => {
  console.log("UNHANDLED REJECTION! Shutting down service!");
  console.log(err.name, err.message);

  server.close(() => {
    process.exit(1);
  });
});
