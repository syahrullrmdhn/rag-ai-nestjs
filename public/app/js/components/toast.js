let timer = null;

export function renderToastHost() {
  return `
  <div class="fixed top-6 right-6 z-50">
    <div id="toast" class="hidden card px-4 py-3 min-w-[280px] border border-slate-900/10 bg-white/90">
      <div class="flex items-start gap-3">
        <div id="toastDot" class="mt-1 h-2.5 w-2.5 rounded-full bg-emerald-600"></div>
        <div class="flex-1">
          <div id="toastMsg" class="text-sm font-semibold">Message</div>
          <div id="toastSub" class="text-xs text-slate-500 mt-0.5"></div>
        </div>
      </div>
    </div>
  </div>`;
}

export function toast(msg, type="ok", sub="") {
  const box = document.getElementById("toast");
  const dot = document.getElementById("toastDot");
  const m = document.getElementById("toastMsg");
  const s = document.getElementById("toastSub");
  if (!box || !dot || !m || !s) return;

  box.classList.remove("hidden");
  m.textContent = msg;
  s.textContent = sub || "";

  dot.className = "mt-1 h-2.5 w-2.5 rounded-full " + (
    type === "err" ? "bg-rose-600" :
    type === "warn" ? "bg-amber-500" :
    "bg-emerald-600"
  );

  if (timer) clearTimeout(timer);
  timer = setTimeout(() => box.classList.add("hidden"), 3200);
}
