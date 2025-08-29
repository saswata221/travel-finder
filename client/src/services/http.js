// client/src/services/http.js
const BASE = process.env.REACT_APP_API_URL || "http://localhost:5000";

export async function api(path, { query } = {}) {
  const url = new URL(path, BASE);
  if (query) {
    Object.entries(query).forEach(([k, v]) => {
      if (Array.isArray(v)) url.searchParams.set(k, v.join(","));
      else if (v !== undefined && v !== null && v !== "")
        url.searchParams.set(k, v);
    });
  }
  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}
