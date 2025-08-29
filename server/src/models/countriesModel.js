import { pool } from "../config/db.js";

export async function findAllCountries() {
  const { rows } = await pool.query(
    "SELECT id, name FROM countries ORDER BY name;"
  );
  return rows;
}
