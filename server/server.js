// server/server.js
import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";

const app = express();
app.use(express.json());

// Allowed origins: Vercel (from env) + local dev
const ALLOWED = [
  process.env.CORS_ORIGIN, // e.g. https://yourapp.vercel.app
  "http://localhost:5173", // Vite dev (if you ever switch)
  "http://localhost:3000", // CRA dev
].filter(Boolean);

app.use(cors({ origin: ALLOWED, credentials: true }));

// routes
import tagsRoutes from "./src/routes/tagsRoutes.js";
import countriesRoutes from "./src/routes/countriesRoutes.js";
import destinationsRoutes from "./src/routes/destinationsRoutes.js";

app.use("/api/tags", tagsRoutes);
app.use("/api/countries", countriesRoutes);
app.use("/api/destinations", destinationsRoutes);

// Health check for Render
app.get("/health", (_req, res) => res.json({ status: "ok" }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ API running on :${PORT}`));
