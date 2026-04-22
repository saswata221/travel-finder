const UNSPLASH_API_BASE = "https://api.unsplash.com";

function requireAccessKey() {
  const key = process.env.UNSPLASH_ACCESS_KEY;
  if (!key) {
    const err = new Error("Missing UNSPLASH_ACCESS_KEY");
    err.statusCode = 500;
    throw err;
  }
  return key;
}

function intParam(value, fallback, { min, max }) {
  const n = Number(value);
  if (!Number.isFinite(n)) return fallback;
  const clamped = Math.max(min, Math.min(max, Math.trunc(n)));
  return clamped;
}

async function fetchUnsplashPhotos({ accessKey, query, perPage }) {
  const url = new URL(`${UNSPLASH_API_BASE}/search/photos`);
  url.searchParams.set("query", query);
  url.searchParams.set("per_page", String(perPage));
  url.searchParams.set("content_filter", "high");
  url.searchParams.set("orientation", "landscape");

  const r = await fetch(url, {
    headers: {
      Authorization: `Client-ID ${accessKey}`,
      "Accept-Version": "v1",
    },
  });

  if (!r.ok) {
    const text = await r.text();
    const err = new Error("Unsplash request failed");
    err.statusCode = 502;
    err.details = {
      status: r.status,
      details: text.slice(0, 500),
    };
    throw err;
  }

  return r.json();
}

function normalizePhotoResult(p) {
  return {
    id: p.id,
    alt: p.alt_description || p.description || "",
    width: p.width,
    height: p.height,
    urls: {
      small: p.urls?.small,
      regular: p.urls?.regular,
    },
    user: {
      name: p.user?.name,
    },
  };
}

export async function searchPhotos(req, res) {
  try {
    const accessKey = requireAccessKey();

    const query = String(req.query.query || "").trim();
    if (!query) return res.status(400).json({ error: "Missing query" });

    const perPage = intParam(req.query.perPage, 8, { min: 1, max: 20 });

    const data = await fetchUnsplashPhotos({ accessKey, query, perPage });
    const results = (data.results || []).map(normalizePhotoResult);

    res.json({ total: data.total, results });
  } catch (e) {
    res.status(e.statusCode || 500).json({
      error: e.message || "Failed",
      ...(e.details || {}),
    });
  }
}

export async function batchDestinationPhotos(req, res) {
  try {
    const accessKey = requireAccessKey();
    const destinations = Array.isArray(req.body?.destinations)
      ? req.body.destinations
      : [];

    if (!destinations.length) {
      return res.status(400).json({ error: "Missing destinations array" });
    }

    const limited = destinations.slice(0, 20);
    const imagesById = {};

    await Promise.all(
      limited.map(async (d) => {
        const id = String(d?.id ?? "").trim();
        const name = String(d?.name ?? "").trim();
        const country = String(d?.country ?? "").trim();
        if (!id || !name) return;

        const query = [name, country].filter(Boolean).join(", ");
        try {
          const data = await fetchUnsplashPhotos({
            accessKey,
            query,
            perPage: 1,
          });
          const first = data?.results?.[0];
          const url = first?.urls?.small || first?.urls?.regular || "";
          if (url) imagesById[id] = url;
        } catch {
          // Skip failed entries and continue the batch.
        }
      })
    );

    res.json({ imagesById });
  } catch (e) {
    res.status(e.statusCode || 500).json({
      error: e.message || "Failed",
      ...(e.details || {}),
    });
  }
}

