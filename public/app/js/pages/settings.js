import { api } from "../api.js";
import { el, maskSecret } from "../ui.js";
import { toast } from "../components/toast.js";

export function mountSettings(root) {
  const node = el(`
  <div class="max-w-6xl mx-auto space-y-6">
    <div class="flex items-end justify-between">
      <div>
        <div class="text-xs tracking-widest text-slate-500 font-semibold">RAG AI DEV</div>
        <h1 class="text-3xl font-extrabold mt-1" style="font-family:Manrope,Inter">Settings</h1>
        <p class="text-slate-500 mt-2">Configure OpenAI + Telegram. Secrets are masked in UI.</p>
      </div>
      <button id="btnLoad" class="btn">Reload</button>
    </div>

    <div class="grid lg:grid-cols-2 gap-6">
      <div class="card p-6 space-y-4">
        <div>
          <div class="text-sm font-extrabold">OpenAI</div>
          <div class="text-xs text-slate-500 mt-1">Use a server-side stored key. Never share it publicly.</div>
        </div>

        <div>
          <label class="text-xs font-bold text-slate-600">API Key</label>
          <input id="openaiApiKey" class="input mt-2" placeholder="sk-••••••••••••••••" />
          <div id="keyHint" class="text-xs text-slate-500 mt-2"></div>
        </div>

        <div class="grid md:grid-cols-2 gap-4">
          <div>
            <label class="text-xs font-bold text-slate-600">Chat model</label>
            <select id="chatModel" class="input mt-2">
              <option value="gpt-4.1-mini">gpt-4.1-mini (recommended)</option>
              <option value="gpt-4o-mini">gpt-4o-mini</option>
            </select>
          </div>
          <div>
            <label class="text-xs font-bold text-slate-600">Embedding model</label>
            <select id="embeddingModel" class="input mt-2">
              <option value="text-embedding-3-large">text-embedding-3-large</option>
              <option value="text-embedding-3-small">text-embedding-3-small</option>
            </select>
          </div>
        </div>
      </div>

      <div class="card p-6 space-y-4">
        <div>
          <div class="text-sm font-extrabold">Telegram</div>
          <div class="text-xs text-slate-500 mt-1">Webhook mode uses /telegram/webhook.</div>
        </div>

        <div>
          <label class="text-xs font-bold text-slate-600">Bot token</label>
          <input id="telegramBotToken" class="input mt-2" placeholder="123456:••••••••••••••••" />
        </div>

        <div>
          <label class="text-xs font-bold text-slate-600">Bot username</label>
          <input id="telegramBotUsername" class="input mt-2" placeholder="your_bot" />
        </div>

        <div class="pt-2">
          <div class="badge">Webhook endpoint: <span class="font-semibold">/telegram/webhook</span></div>
        </div>
      </div>
    </div>

    <div class="card p-6 flex items-center justify-between">
      <div>
        <div class="text-sm font-extrabold">Save changes</div>
        <div class="text-xs text-slate-500 mt-1">We will set safe defaults if models are empty.</div>
      </div>
      <button id="btnSave" class="btn btn-primary w-44">Save</button>
    </div>
  </div>`);

  root.appendChild(node);

  const inpKey = node.querySelector("#openaiApiKey");
  const keyHint = node.querySelector("#keyHint");
  const chatModel = node.querySelector("#chatModel");
  const embeddingModel = node.querySelector("#embeddingModel");

  const tgToken = node.querySelector("#telegramBotToken");
  const tgUser = node.querySelector("#telegramBotUsername");

  async function load() {
    try {
      const s = await api.get("/settings");
      // mask secrets in UI; user can overwrite by typing full value
      inpKey.value = s.openaiApiKey ? maskSecret(s.openaiApiKey) : "";
      tgToken.value = s.telegramBotToken ? maskSecret(s.telegramBotToken) : "";
      tgUser.value = s.telegramBotUsername || "";

      chatModel.value = s.chatModel || "gpt-4.1-mini";
      embeddingModel.value = s.embeddingModel || "text-embedding-3-large";

      keyHint.textContent = s.openaiApiKey ? "Key is stored (masked). Paste a new one to replace." : "No key saved yet.";
    } catch (e) {
      toast("Failed to load settings.", "err", String(e.message || e));
    }
  }

  node.querySelector("#btnLoad").addEventListener("click", load);

  node.querySelector("#btnSave").addEventListener("click", async () => {
    const payload = {
      // IMPORTANT: if user left masked value, backend should keep existing.
      openaiApiKey: inpKey.value.trim(),
      chatModel: (chatModel.value || "gpt-4.1-mini"),
      embeddingModel: (embeddingModel.value || "text-embedding-3-large"),
      telegramBotToken: tgToken.value.trim(),
      telegramBotUsername: tgUser.value.trim(),
    };

    try {
      await api.put("/settings", payload);
      toast("Settings saved.", "ok");
      await load();
    } catch (e) {
      toast("Save failed.", "err", String(e.message || e));
    }
  });

  load();
}
