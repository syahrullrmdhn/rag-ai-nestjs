import { getToken, clearToken } from "./auth.js";
import { toast } from "./components/toast.js";

async function request(path, opts = {}) {
  const headers = new Headers(opts.headers || {});
  headers.set("Accept", "application/json");

  const token = getToken();
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const res = await fetch(path, { ...opts, headers });

  if (res.status === 401) {
    clearToken();
    toast("Session expired. Please login again.", "warn");
    location.hash = "#/login";
    throw new Error("Unauthorized");
  }

  const ct = res.headers.get("content-type") || "";
  const isJson = ct.includes("application/json");
  const body = isJson ? await res.json().catch(() => ({})) : await res.text().catch(() => "");

  if (!res.ok) {
    const msg = isJson ? (body?.message || body?.error || JSON.stringify(body)) : (body || `HTTP ${res.status}`);
    throw new Error(msg);
  }

  return body;
}

export const api = {
  post: (path, json) => request(path, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(json) }),
  put: (path, json) => request(path, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(json) }),
  get: (path) => request(path),
  upload: async (path, formData, onProgress) => {
    // fetch doesn't provide upload progress reliably; we fake progress stages
    if (onProgress) onProgress(10);
    const token = getToken();
    const headers = new Headers();
    if (token) headers.set("Authorization", `Bearer ${token}`);

    const res = await fetch(path, { method: "POST", headers, body: formData });
    if (onProgress) onProgress(85);

    const ct = res.headers.get("content-type") || "";
    const body = ct.includes("application/json") ? await res.json().catch(() => ({})) : await res.text().catch(() => "");
    if (!res.ok) throw new Error(body?.message || body?.error || body || `HTTP ${res.status}`);

    if (onProgress) onProgress(100);
    return body;
  }
};
