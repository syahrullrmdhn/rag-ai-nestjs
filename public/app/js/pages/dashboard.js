import { el } from "../ui.js";

export function mountDashboard(root) {
  const node = el(`
  <div class="max-w-6xl mx-auto space-y-6">
    <div class="flex items-end justify-between">
      <div>
        <div class="text-xs tracking-widest text-slate-500 font-semibold">RAG AI DEV</div>
        <h1 class="text-3xl font-extrabold mt-1" style="font-family:Manrope,Inter">Dashboard</h1>
        <p class="text-slate-500 mt-2">Manage your knowledge base and ask questions with citations-ready context.</p>
      </div>
      <div class="hidden md:flex gap-2">
        <a href="#/knowledge" class="btn btn-primary">Add Knowledge</a>
        <a href="#/chat" class="btn">Open Chat</a>
      </div>
    </div>

    <div class="grid md:grid-cols-3 gap-5">
      <div class="card p-6">
        <div class="text-sm font-bold">Knowledge</div>
        <div class="text-xs text-slate-500 mt-1">Upload PDF/TXT or paste text.</div>
        <div class="mt-5">
          <a href="#/knowledge" class="btn btn-primary w-full">Go to Knowledge</a>
        </div>
      </div>

      <div class="card p-6">
        <div class="text-sm font-bold">Chat</div>
        <div class="text-xs text-slate-500 mt-1">Ask questions after ingest.</div>
        <div class="mt-5">
          <a href="#/chat" class="btn btn-primary w-full">Go to Chat</a>
        </div>
      </div>

      <div class="card p-6">
        <div class="text-sm font-bold">Settings</div>
        <div class="text-xs text-slate-500 mt-1">OpenAI + Telegram config.</div>
        <div class="mt-5">
          <a href="#/settings" class="btn btn-primary w-full">Go to Settings</a>
        </div>
      </div>
    </div>
  </div>`);
  root.appendChild(node);
}
