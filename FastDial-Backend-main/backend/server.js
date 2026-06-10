const dotenv = require("dotenv");

process.on("uncaughtException", (err) => {
  console.error("UNCAUGHT EXCEPTION! Shutting down service!");
  console.error("Name:", err.name);
  console.error("Message:", err.message);
  console.error("Stack:", err.stack);
  process.exit(1);
});

dotenv.config();

const { server: httpServer, ensureSchema } = require("./app");

const port = process.env.PORT || 3000;

ensureSchema()
  .then(() => {
    const server = httpServer.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });

    process.on("unhandledRejection", (err) => {
      console.error("UNHANDLED REJECTION! Shutting down service!");
      console.error("Name:", err.name);
      console.error("Message:", err.message);
      console.error("Stack:", err.stack);

      server.close(() => {
        process.exit(1);
      });
    });
  })
  .catch((err) => {
    console.error("Failed to initialize schema!");
    console.error("Name:", err.name);
    console.error("Message:", err.message);
    console.error("Stack:", err.stack);
    process.exit(1);
  });