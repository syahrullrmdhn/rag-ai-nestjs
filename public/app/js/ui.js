export function el(html) {
  const t = document.createElement("template");
  t.innerHTML = html.trim();
  return t.content.firstElementChild;
}

export function clampStr(s, max = 22) {
  if (!s) return "";
  return s.length <= max ? s : s.slice(0, max - 1) + "…";
}

export function maskSecret(s) {
  if (!s) return "";
  if (s.length <= 10) return "••••••••";
  return s.slice(0, 4) + "••••••••••" + s.slice(-4);
}
