// server/server.js
import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";

const app = express();
app.use(express.json());

const ALLOWED = [
  process.env.CORS_ORIGIN,
  "http://localhost:5173",
  "http://localhost:3000",
].filter(Boolean);

// Allow all Vercel preview deployments
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    // Allow localhost
    if (origin.includes("localhost")) return callback(null, true);

    // Allow all Vercel deployments
    if (origin.includes("vercel.app")) return callback(null, true);

    // Allow specific origins from ALLOWED array
    if (ALLOWED.indexOf(origin) !== -1) return callback(null, true);

    callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
};

app.use(cors(corsOptions));

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
app.listen(PORT, () => console.log(`API running on :${PORT}`));
