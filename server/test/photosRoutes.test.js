import test from "node:test";
import assert from "node:assert/strict";

import request from "supertest";
import { createApp } from "../src/app.js";

test("POST /api/photos/batch returns partial results when one fetch fails", async () => {
  process.env.UNSPLASH_ACCESS_KEY = "test-key";

  const originalFetch = global.fetch;
  global.fetch = async (url) => {
    const q = new URL(url).searchParams.get("query");
    if (q.includes("Paris")) {
      return {
        ok: true,
        json: async () => ({
          results: [{ urls: { small: "https://img.local/paris.jpg" } }],
        }),
      };
    }

    return {
      ok: false,
      status: 429,
      text: async () => "rate limit",
    };
  };

  try {
    const app = createApp();
    const res = await request(app).post("/api/photos/batch").send({
      destinations: [
        { id: "1", name: "Paris", country: "France" },
        { id: "2", name: "Rome", country: "Italy" },
      ],
    });

    assert.equal(res.status, 200);
    assert.deepEqual(res.body, {
      imagesById: {
        "1": "https://img.local/paris.jpg",
      },
    });
  } finally {
    global.fetch = originalFetch;
  }
});
