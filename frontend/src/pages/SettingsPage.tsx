import React from "react";
import { apiFetch } from "../lib/api";
import { Button, Input } from "../components/ui";
import { 
  Cpu, 
  Send, 
  AlertCircle,
  ShieldCheck,
  CheckCircle2 // Icon untuk status Active
} from "lucide-react";

type Settings = {
  id: number;
  openaiApiKey: string | null;
  chatModel: string | null;
  embeddingModel: string | null;
  telegramBotToken: string | null;
  telegramBotUsername: string | null;
};

export default function SettingsPage() {
  const [data, setData] = React.useState<Settings | null>(null);
  const [form, setForm] = React.useState({
    chatModel: "gpt-4.1-mini",
    embeddingModel: "text-embedding-3-large",
  });
  const [loading, setLoading] = React.useState(false);
  const [err, setErr] = React.useState<string | null>(null);

  async function load() {
    setLoading(true); setErr(null);
    try {
      const s = await apiFetch<Settings>("/settings", { method: "GET" });
      setData(s);
      setForm({
        chatModel: s.chatModel || "gpt-4.1-mini",
        embeddingModel: s.embeddingModel || "text-embedding-3-large",
      });
    } catch (e: any) { setErr(e?.message || "Load failed"); } finally { setLoading(false); }
  }

  React.useEffect(() => { load(); }, []);

  return (
    <div className="max-w-4xl space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header Info */}
      <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-lg flex items-start gap-3">
         <div className="text-emerald-600 mt-1"><ShieldCheck size={20} /></div>
         <div>
            <h4 className="text-sm font-semibold text-emerald-900">Secure Environment</h4>
            <p className="text-sm text-emerald-700/80 mt-1">
               All sensitive credentials are managed securely on the server. This dashboard provides a read-only view of the active configuration.
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
           
           <div className="grid grid-cols-1 gap-4">
             <Input
                label="Chat Model Name"
                value={form.chatModel}
                readOnly
                className="bg-slate-50 text-slate-500 cursor-not-allowed focus:ring-0 border-slate-200"
                placeholder="gpt-4"
             />
             <Input
                label="Embedding Model"
                value={form.embeddingModel}
                readOnly
                className="bg-slate-50 text-slate-500 cursor-not-allowed focus:ring-0 border-slate-200"
                placeholder="text-embedding-3-large"
             />
           </div>
        </div>

        {/* Section: Integrations */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-5">
           <div className="flex items-center gap-2 border-b border-slate-100 pb-3 mb-4">
              <Send className="text-blue-500" size={18} />
              <h3 className="font-semibold text-slate-800">Telegram Integration</h3>
           </div>

           {/* Status Card menggantikan Input */}
           <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-100">
              <div className="flex items-center gap-3">
                 <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 shadow-sm">
                    <CheckCircle2 size={20} />
                 </div>
                 <div>
                    <div className="text-sm font-medium text-slate-900">Bot Service</div>
                    <div className="text-xs text-slate-500">Long-polling / Webhook</div>
                 </div>
              </div>
              <div className="px-3 py-1 bg-white border border-emerald-200 text-emerald-700 text-sm font-semibold rounded-full shadow-sm">
                 Active
              </div>
           </div>

           <div className="text-xs text-slate-400 leading-relaxed">
             The Telegram bot is currently running and listening for messages. Configuration is locked by administrator.
           </div>
        </div>
      </div>

      {/* Action Bar */}
      <div className="flex items-center justify-between pt-4">
        <div>
           {err && <span className="text-red-600 text-sm font-medium flex items-center gap-2"><AlertCircle size={14}/> {err}</span>}
        </div>
        <div className="flex gap-3">
          <Button disabled className="opacity-50 cursor-not-allowed bg-slate-300 text-white font-medium">
             Read Only Mode
          </Button>
        </div>
      </div>

    </div>
  );
}
