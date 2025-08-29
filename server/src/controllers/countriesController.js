import { findAllCountries } from "../models/countriesModel.js";

export async function getCountries(_req, res) {
  try {
    const data = await findAllCountries();
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: "Failed to fetch countries" });
  }
}
