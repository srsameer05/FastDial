const mysql = require("mysql2");
const dotenv = require("dotenv");

dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_SERVER,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: 3306,
  waitForConnections: true,
  connectionLimit: 1000,
  queueLimit: 0,
});

// Function to run queries using the pool
const db = (...args) => {
  return new Promise((resolve, reject) => {
    pool.query(...args, (err, results) => {
      if (err) {
        console.error("Database query error:", err);
        reject(err);
      } else {
        resolve(results);
      }
    });
  });
};

// Gracefully close the pool when the application exits
process.on("SIGINT", () => {
  pool.end((err) => {
    if (err) {
      console.error("Error closing MySQL pool:", err);
    } else {
      console.log("MySQL pool closed gracefully.");
    }
    process.exit(err ? 1 : 0);
  });
});

module.exports = db;
