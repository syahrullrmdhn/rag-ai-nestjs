import { api } from "../api.js";
import { setToken } from "../auth.js";
import { el } from "../ui.js";
import { toast } from "../components/toast.js";

export function mountLogin(root) {
  const node = el(`
  <div class="max-w-5xl mx-auto grid md:grid-cols-2 gap-8 items-stretch">
    <div class="card p-8">
      <div class="text-xs tracking-widest text-slate-500 font-semibold">RAG AI DEV</div>
      <h1 class="text-3xl font-extrabold mt-2" style="font-family:Manrope,Inter">Sign in</h1>
      <p class="text-slate-500 mt-2">Access your workspace. Upload knowledge. Ask questions. Get grounded answers.</p>

      <div class="mt-8 space-y-3">
        <div>
          <label class="text-xs font-bold text-slate-600">Email</label>
          <input id="email" class="input mt-2" placeholder="you@company.com" />
        </div>
        <div>
          <label class="text-xs font-bold text-slate-600">Password</label>
          <input id="password" type="password" class="input mt-2" placeholder="••••••••" />
        </div>

        <div class="flex items-center gap-3 pt-2">
          <button id="btnLogin" class="btn btn-primary flex-1">Login</button>
          <button id="btnRegister" class="btn flex-1">Register</button>
        </div>

        <div id="hint" class="text-xs text-slate-500 pt-2">
          Tips: Use a strong password. Do not paste API keys into chat or screenshots.
        </div>
      </div>
    </div>

    <div class="card p-8 bg-white/70 border border-slate-900/10">
      <h2 class="text-lg font-extrabold" style="font-family:Manrope,Inter">What you can do</h2>
      <ul class="mt-4 space-y-3 text-sm text-slate-700">
        <li class="flex gap-3"><span>📚</span><span>Ingest PDF/TXT or paste text knowledge.</span></li>
        <li class="flex gap-3"><span>🧠</span><span>RAG pipeline retrieves relevant chunks before answering.</span></li>
        <li class="flex gap-3"><span>💬</span><span>Web chat + Telegram webhook share the same brain.</span></li>
        <li class="flex gap-3"><span>🔒</span><span>JWT protected endpoints.</span></li>
      </ul>
    </div>
  </div>`);

  root.appendChild(node);

  const email = node.querySelector("#email");
  const password = node.querySelector("#password");

  node.querySelector("#btnLogin").addEventListener("click", async () => {
    try {
      const r = await api.post("/auth/login", { email: email.value.trim(), password: password.value });
      setToken(r.accessToken);
      toast("Welcome back.", "ok");
      location.hash = "#/";
    } catch (e) {
      toast("Login failed.", "err", String(e.message || e));
    }
  });

  node.querySelector("#btnRegister").addEventListener("click", async () => {
    try {
      await api.post("/auth/register", { email: email.value.trim(), password: password.value });
      toast("Registered. Now login.", "ok");
    } catch (e) {
      toast("Register failed.", "err", String(e.message || e));
    }
  });
}
