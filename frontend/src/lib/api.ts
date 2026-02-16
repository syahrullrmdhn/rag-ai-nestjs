// frontend/src/lib/api.ts
import { clearToken, getToken } from "./auth";

const API_BASE = (import.meta as any).env?.VITE_API_BASE || ""; // kosong = same origin

type ApiError = { status: number; message: string; data?: any };

async function parseJsonSafe(res: Response) {
  const text = await res.text();
  if (!text) return null;
  try { return JSON.parse(text); } catch { return text; }
}

export async function apiFetch<T = any>(
  path: string,
  opts: RequestInit & { auth?: boolean } = {},
): Promise<T> {
  const url = path.startsWith("http") ? path : `${API_BASE}${path.startsWith("/") ? "" : "/"}${path}`;
  const headers = new Headers(opts.headers || {});
  const wantsAuth = opts.auth !== false; // default true
  if (wantsAuth) {
    const token = getToken();
    if (token) headers.set("Authorization", `Bearer ${token}`);
  }

  // set JSON header if body is plain object
  const isForm = typeof FormData !== "undefined" && opts.body instanceof FormData;
  if (!isForm && opts.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const res = await fetch(url, { ...opts, headers });

  if (res.status === 401) {
    clearToken();
    // biar UX rapi: lempar error, page guard bakal redirect
    const data = await parseJsonSafe(res);
    const err: ApiError = { status: 401, message: "Unauthorized", data };
    throw err;
  }

  if (!res.ok) {
    const data = await parseJsonSafe(res);
    const msg =
      (data && typeof data === "object" && (data.message || data.error)) ||
      `Request failed (${res.status})`;
    const err: ApiError = { status: res.status, message: String(msg), data };
    throw err;
  }

  return (await parseJsonSafe(res)) as T;
}
