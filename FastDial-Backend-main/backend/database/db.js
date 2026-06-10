const mysql = require("mysql2");
const dotenv = require("dotenv");

dotenv.config();

const dbHost = process.env.DB_SERVER || "localhost";
const dbUser = process.env.DB_USER || "root";
const dbPassword = process.env.DB_PASSWORD || "";
const dbName = process.env.DB_NAME || "fastdial";

const pool = mysql.createPool({
  host: dbHost,
  user: dbUser,
  password: dbPassword,
  database: dbName,
  port: 3306,
  waitForConnections: true,
  connectionLimit: 1000,
  queueLimit: 0,
});

if (!process.env.DB_SERVER || !process.env.DB_USER || !process.env.DB_NAME) {
  console.warn(
    `MySQL env vars are incomplete. Falling back to ${dbUser}@${dbHost} / ${dbName}.`,
  );
}

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
