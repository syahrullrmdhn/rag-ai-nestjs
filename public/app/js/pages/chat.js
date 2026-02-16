import { api } from "../api.js";
import { el } from "../ui.js";
import { toast } from "../components/toast.js";

export function mountChat(root) {
  const node = el(`
  <div class="max-w-6xl mx-auto space-y-6">
    <div class="flex items-end justify-between">
      <div>
        <div class="text-xs tracking-widest text-slate-500 font-semibold">RAG AI DEV</div>
        <h1 class="text-3xl font-extrabold mt-1" style="font-family:Manrope,Inter">Chat</h1>
        <p class="text-slate-500 mt-2">Ask a question. The system retrieves relevant knowledge before answering.</p>
      </div>
      <a href="#/knowledge" class="btn btn-primary">Add Knowledge</a>
    </div>

    <div class="card p-6">
      <div id="chatBox" class="space-y-3 max-h-[420px] overflow-auto scrollbar pr-1"></div>

      <hr class="soft my-5" />

      <div class="flex gap-3 items-end">
        <textarea id="msg" class="input min-h-[54px] max-h-[140px]" placeholder="Type your question..."></textarea>
        <button id="send" class="btn btn-primary w-36">Send</button>
      </div>

      <div class="text-xs text-slate-500 mt-2">
        Shortcut: <span class="kbd">Ctrl</span> + <span class="kbd">Enter</span> to send
      </div>
    </div>
  </div>`);

  root.appendChild(node);

  const chatBox = node.querySelector("#chatBox");
  const msg = node.querySelector("#msg");
  const send = node.querySelector("#send");

  function bubble(text, who="user") {
    const align = who === "user" ? "justify-end" : "justify-start";
    const bg = who === "user" ? "bg-emerald-700 text-white" : "bg-white border border-slate-900/10";
    const b = el(`
      <div class="flex ${align}">
        <div class="max-w-[82%] rounded-2xl px-4 py-3 text-sm ${bg}">
          ${escapeHtml(text)}
        </div>
      </div>`);
    chatBox.appendChild(b);
    chatBox.scrollTop = chatBox.scrollHeight;
  }

  async function doSend() {
    const q = msg.value.trim();
    if (!q) return;
    msg.value = "";
    bubble(q, "user");
    bubble("Thinking…", "ai");

    const lastAi = chatBox.lastElementChild.querySelector("div > div");
    try {
      const r = await api.post("/chat", { message: q });
      lastAi.innerHTML = escapeHtml(r.answer || "(no answer)");
    } catch (e) {
      lastAi.innerHTML = escapeHtml("Error: " + (e.message || e));
      toast("Chat failed.", "err");
    }
  }

  send.addEventListener("click", doSend);
  msg.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) doSend();
  });
}

function escapeHtml(s) {
  return String(s ?? "").replace(/[&<>"']/g, (m) => ({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"
  }[m]));
}
