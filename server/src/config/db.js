// server/src/config/db.js
import pkg from "pg";
import dotenv from "dotenv";
dotenv.config();

const { Pool } = pkg;

function shouldUseSsl() {
  const explicit = String(process.env.DB_SSL || "").toLowerCase();
  if (explicit === "true" || explicit === "1") return true;
  if (explicit === "false" || explicit === "0") return false;

  const url = String(process.env.DATABASE_URL || "");
  // Support managed DB URLs (Render/Neon/etc.) even in local dev.
  return url.includes("sslmode=require");
}

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: shouldUseSsl() ? { rejectUnauthorized: false } : false,
});
