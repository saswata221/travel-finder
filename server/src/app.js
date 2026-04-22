import express from "express";
import cors from "cors";

import tagsRoutes from "./routes/tagsRoutes.js";
import countriesRoutes from "./routes/countriesRoutes.js";
import destinationsRoutes from "./routes/destinationsRoutes.js";
import photosRoutes from "./routes/photosRoutes.js";

function normalizeOrigin(origin) {
  try {
    return new URL(origin).origin;
  } catch {
    return null;
  }
}

function buildAllowedOrigins() {
  const configured = String(process.env.CORS_ORIGIN || "")
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean)
    .map(normalizeOrigin)
    .filter(Boolean);

  return new Set([
    ...configured,
    "http://localhost:3000",
    "http://localhost:5173",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:5173",
  ]);
}

function isAllowedPreviewOrigin(origin) {
  try {
    const url = new URL(origin);
    return (
      url.protocol === "https:" &&
      (url.hostname === "vercel.app" || url.hostname.endsWith(".vercel.app"))
    );
  } catch {
    return false;
  }
}

export function createApp() {
  const app = express();
  const allowedOrigins = buildAllowedOrigins();

  app.use(express.json());
  app.use(
    cors({
      origin(origin, callback) {
        if (!origin) return callback(null, true);

        const normalized = normalizeOrigin(origin);
        if (
          (normalized && allowedOrigins.has(normalized)) ||
          isAllowedPreviewOrigin(origin)
        ) {
          return callback(null, true);
        }
        return callback(new Error("Not allowed by CORS"));
      },
      credentials: true,
    })
  );

  app.use("/api/tags", tagsRoutes);
  app.use("/api/countries", countriesRoutes);
  app.use("/api/destinations", destinationsRoutes);
  app.use("/api/photos", photosRoutes);
  app.get("/health", (_req, res) => res.json({ status: "ok" }));

  return app;
}
