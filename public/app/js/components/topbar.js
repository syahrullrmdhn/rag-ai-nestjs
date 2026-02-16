import { getToken, clearToken } from "../auth.js";
import { api } from "../api.js";
import { toast } from "./toast.js";

export function renderTopbar() {
  return `
  <header class="px-6 md:px-10 py-5">
    <div class="flex items-center justify-between">
      <div class="md:hidden">
        <div class="text-xs tracking-widest text-slate-500 font-semibold">RAG AI DEV</div>
        <div class="text-xl font-extrabold" style="font-family:Manrope,Inter">Workspace</div>
      </div>

      <div class="flex items-center gap-3 ml-auto">
        <span id="netBadge" class="badge hidden sm:inline-flex">● Ready</span>
        <button id="btnLogout" class="btn btn-ghost">Logout</button>
      </div>
    </div>
  </header>`;
}

document.addEventListener("click", async (e) => {
  const btn = e.target.closest("#btnLogout");
  if (!btn) return;

  try {
    if (getToken()) await api.post("/auth/logout", {});
  } catch {
    // ignore, token could be invalid/expired
  }
  clearToken();
  toast("Logged out.", "ok");
  location.hash = "#/login";
});

