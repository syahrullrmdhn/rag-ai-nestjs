import { clampStr } from "../ui.js";

const nav = [
  { hash: "#/dashboard", label: "Dashboard", icon: "📊" },
  { hash: "#/knowledge", label: "Knowledge", icon: "📚" },
  { hash: "#/chat", label: "Chat", icon: "💬" },
  { hash: "#/settings", label: "Settings", icon: "⚙️" },
];

export function renderSidebar() {
  const items = nav.map(i => `
    <a data-nav="${i.hash}" href="${i.hash}"
      class="nav-item flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold
             hover:bg-white/70 hover:border hover:border-slate-900/10 transition">
      <span class="text-base">${i.icon}</span>
      <span>${i.label}</span>
    </a>`).join("");

  // brand/footer: short, not "kepanjangan"
  return `
  <aside class="hidden md:flex w-72 p-5">
    <div class="w-full card p-4 flex flex-col">
      <div class="px-1 pb-3">
        <div class="text-xs tracking-widest text-slate-500 font-semibold">RAG AI DEV</div>
        <div class="text-xl font-extrabold" style="font-family:Manrope,Inter">Workspace</div>
      </div>

      <div class="flex flex-col gap-2 mt-2">
        ${items}
      </div>

      <div class="mt-auto pt-4">
        <div class="card p-3 bg-white/70 border border-slate-900/10">
          <div class="text-xs text-slate-500 font-semibold">by</div>
          <div class="text-sm font-bold">${clampStr("Syahrul Ramadhan", 18)}</div>
        </div>
      </div>
    </div>
  </aside>`;
}

export function setActiveNav(hash) {
  document.querySelectorAll("[data-nav]").forEach(a => {
    const active = a.getAttribute("data-nav") === hash || (hash === "#/" && a.getAttribute("data-nav")==="#/dashboard");
    a.classList.toggle("bg-white/80", active);
    a.classList.toggle("border", active);
    a.classList.toggle("border-slate-900/10", active);
  });
}
