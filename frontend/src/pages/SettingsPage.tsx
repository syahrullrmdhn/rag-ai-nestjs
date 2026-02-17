import React from "react";
import { apiFetch } from "../lib/api";
import { Button, Input } from "../components/ui";
import { 
  Save, 
  RefreshCw, 
  Key, 
  Bot, 
  Cpu, 
  Send // <--- INI YANG HILANG SEBELUMNYA
} from "lucide-react";

type Settings = {
  id: number;
  openaiApiKey: string | null;
  chatModel: string | null;
  embeddingModel: string | null;
  telegramBotToken: string | null;
  telegramBotUsername: string | null;
};

// Fungsi masking (hanya untuk display awal sebelum masuk input password)
function maskSecret(v: string | null) {
  if (!v) return "";
  // Kita biarkan kosong atau string pendek, karena nanti di UI
  // input type="password" akan otomatis mengubahnya jadi titik-titik.
  return v; 
}

export default function SettingsPage() {
  const [data, setData] = React.useState<Settings | null>(null);
  const [form, setForm] = React.useState({
    openaiApiKey: "",
    chatModel: "gpt-4.1-mini",
    embeddingModel: "text-embedding-3-large",
    telegramBotToken: "",
    telegramBotUsername: "",
  });
  const [loading, setLoading] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [msg, setMsg] = React.useState<string | null>(null);
  const [err, setErr] = React.useState<string | null>(null);

  async function load() {
    setLoading(true); setErr(null); setMsg(null);
    try {
      const s = await apiFetch<Settings>("/settings", { method: "GET" });
      setData(s);
      setForm({
        // Backend sebaiknya mengirim dummy/masked string jika key sudah ada
        // Tapi di sini kita tampung saja apa adanya
        openaiApiKey: s.openaiApiKey || "",
        chatModel: s.chatModel || "gpt-4.1-mini",
        embeddingModel: s.embeddingModel || "text-embedding-3-large",
        telegramBotToken: s.telegramBotToken || "",
        telegramBotUsername: s.telegramBotUsername || "",
      });
    } catch (e: any) { setErr(e?.message || "Load failed"); } finally { setLoading(false); }
  }

  React.useEffect(() => { load(); }, []);

  async function save() {
    setSaving(true); setErr(null); setMsg(null);
    try {
      const payload = { ...form }; 
      const s = await apiFetch<Settings>("/settings", { method: "PUT", body: JSON.stringify(payload) });
      setData(s);
      // Update form state, tapi biarkan input password tetap terisi value baru (tersembunyi)
      setForm((prev) => ({
         ...prev,
         openaiApiKey: s.openaiApiKey || "",
         telegramBotToken: s.telegramBotToken || "",
      }));
      setMsg("Configuration updated successfully.");
    } catch (e: any) { setErr(e?.message || "Save failed"); } finally { setSaving(false); }
  }

  return (
    <div className="max-w-4xl space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header Info */}
      <div className="bg-blue-50 border border-blue-100 p-4 rounded-lg flex items-start gap-3">
         <div className="text-blue-600 mt-1"><Bot size={20} /></div>
         <div>
            <h4 className="text-sm font-semibold text-blue-900">Configuration Guide</h4>
            <p className="text-sm text-blue-700/80 mt-1">
               Sensitive keys are hidden securely. To update a key, simply overwrite the field with a new value.
            </p>
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Section: AI Core */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-5">
           <div className="flex items-center gap-2 border-b border-slate-100 pb-3 mb-4">
              <Cpu className="text-emerald-600" size={18} />
              <h3 className="font-semibold text-slate-800">AI Core Settings</h3>
           </div>
           
           <Input
              label="OpenAI API Key"
              value={form.openaiApiKey}
              onChange={(e) => setForm((p) => ({ ...p, openaiApiKey: e.target.value }))}
              placeholder="sk-..."
              type="password" // <--- RAHASIA AMAN (Hidden dots)
           />
           <div className="grid grid-cols-1 gap-4">
             <Input
                label="Chat Model Name"
                value={form.chatModel}
                onChange={(e) => setForm((p) => ({ ...p, chatModel: e.target.value }))}
                placeholder="gpt-4"
             />
             <Input
                label="Embedding Model"
                value={form.embeddingModel}
                onChange={(e) => setForm((p) => ({ ...p, embeddingModel: e.target.value }))}
                placeholder="text-embedding-3-large"
             />
           </div>
        </div>

        {/* Section: Integrations */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-5">
           <div className="flex items-center gap-2 border-b border-slate-100 pb-3 mb-4">
              <Send className="text-blue-500" size={18} /> {/* <--- INI AMAN SEKARANG */}
              <h3 className="font-semibold text-slate-800">Telegram Integration</h3>
           </div>

           <Input
              label="Bot Token"
              value={form.telegramBotToken}
              onChange={(e) => setForm((p) => ({ ...p, telegramBotToken: e.target.value }))}
              placeholder="123456:ABC-..."
              type="password" // <--- RAHASIA AMAN (Hidden dots)
           />
           <Input
              label="Bot Username"
              value={form.telegramBotUsername}
              onChange={(e) => setForm((p) => ({ ...p, telegramBotUsername: e.target.value }))}
              placeholder="@MyBot"
           />
        </div>
      </div>

      {/* Action Bar */}
      <div className="flex items-center justify-between pt-4">
        <div>
           {msg && <span className="text-emerald-600 text-sm font-medium flex items-center gap-2"><Save size={14}/> {msg}</span>}
           {err && <span className="text-red-600 text-sm font-medium flex items-center gap-2"><AlertCircle size={14}/> {err}</span>}
        </div>
        <div className="flex gap-3">
          <Button variant="ghost" onClick={load} disabled={saving} className="text-slate-500">
             Discard
          </Button>
          <Button onClick={save} disabled={saving} className="bg-slate-900 text-white hover:bg-slate-800 min-w-[120px]">
             {saving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>

    </div>
  );
}
