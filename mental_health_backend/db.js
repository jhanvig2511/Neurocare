const mysql = require("mysql2");
require("dotenv").config();

const pool = mysql.createPool(process.env.DATABASE_URL);

pool.getConnection((err, connection) => {
  if (err) {
    console.error("❌ Database connection failed:", err.message);
    return;
  }

  console.log("✅ Connected to Railway MySQL");
  connection.release();
});

module.exports = pool;