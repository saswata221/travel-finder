// client/src/services/http.js
const BASE = process.env.REACT_APP_API_URL || "http://localhost:5000";

function toUserMessage(status, fallback) {
  if (status >= 500) return "Server error. Please try again shortly.";
  if (status === 404) return "Requested resource was not found.";
  if (status === 401 || status === 403)
    return "You are not allowed to perform this action.";
  if (status === 400) return "Some request details are invalid.";
  return fallback || "Request failed. Please try again.";
}

async function parseErrorResponse(res) {
  const contentType = res.headers.get("content-type") || "";
  const isJson = contentType.includes("application/json");

  let payload = null;
  if (isJson) {
    payload = await res.json().catch(() => null);
  } else {
    const text = await res.text().catch(() => "");
    payload = text ? { error: text } : null;
  }

  const serverMessage =
    payload?.error || payload?.message || payload?.details || "";
  const userMessage = toUserMessage(
    res.status,
    typeof serverMessage === "string" ? serverMessage : "",
  );
  const err = new Error(userMessage);
  err.status = res.status;
  err.code = payload?.code;
  err.details = payload;
  err.serverMessage = serverMessage;
  return err;
}

export async function api(path, { query, method = "GET", body, headers } = {}) {
  const url = new URL(path, BASE);
  if (query) {
    Object.entries(query).forEach(([k, v]) => {
      if (Array.isArray(v)) url.searchParams.set(k, v.join(","));
      else if (v !== undefined && v !== null && v !== "")
        url.searchParams.set(k, v);
    });
  }
  const options = {
    method,
    headers: {
      ...(headers || {}),
    },
  };

  if (body !== undefined) {
    options.body = JSON.stringify(body);
    if (!options.headers["Content-Type"]) {
      options.headers["Content-Type"] = "application/json";
    }
  }

  const res = await fetch(url.toString(), options);
  if (!res.ok) throw await parseErrorResponse(res);
  return res.json();
}
