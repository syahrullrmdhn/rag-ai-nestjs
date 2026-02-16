const KEY = "rag_ai_dev_token";

export function getToken() {
  return localStorage.getItem(KEY);
}

export function setToken(token) {
  localStorage.setItem(KEY, token);
}

export function clearToken() {
  localStorage.removeItem(KEY);
}

export function ensureAuthBootstrap() {
  // placeholder for future: token refresh, etc.
}
