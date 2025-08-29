import {
  searchDestinationsModel,
  getDestinationById,
} from "../models/destinationsModel.js";

function parseCsvInts(csv) {
  if (!csv) return [];
  return String(csv)
    .split(",")
    .map((x) => Number(x.trim()))
    .filter((n) => Number.isInteger(n) && n > 0);
}

export async function searchDestinations(req, res) {
  try {
    const tagIds = parseCsvInts(req.query.tags);
    const months = parseCsvInts(req.query.months);
    const countryId = req.query.countryId
      ? Number(req.query.countryId)
      : undefined;
    const international = req.query.international === "true";
    const page = req.query.page ? Math.max(1, Number(req.query.page)) : 1;
    const limit = req.query.limit
      ? Math.max(1, Math.min(50, Number(req.query.limit)))
      : 20;
    const offset = (page - 1) * limit;

    const data = await searchDestinationsModel({
      tagIds,
      countryId,
      international,
      months,
      limit,
      offset,
    });
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: "Search failed" });
  }
}

export async function getDestination(req, res) {
  try {
    const id = Number(req.params.id);
    if (!id) return res.status(400).json({ error: "Invalid id" });

    const data = await getDestinationById(id);
    if (!data) return res.status(404).json({ error: "Not found" });

    res.json(data);
  } catch (e) {
    res.status(500).json({ error: "Failed to fetch destination" });
  }
}
