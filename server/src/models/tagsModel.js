import { pool } from "../config/db.js";

export async function findAllTags() {
  const { rows } = await pool.query("SELECT id, name FROM tags ORDER BY name;");
  return rows;
}
