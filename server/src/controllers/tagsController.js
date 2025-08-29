import { findAllTags } from "../models/tagsModel.js";

export async function getTags(_req, res) {
  try {
    const data = await findAllTags();
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: "Failed to fetch tags" });
  }
}
