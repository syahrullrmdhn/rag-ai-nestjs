import React from "react";
import { Send, ShieldCheck, Globe, Copy } from "lucide-react";
import { Button } from "../components/ui";

export default function TelegramPage() {
  const [copied, setCopied] = React.useState(false);
  const webhookPath = "/telegram/webhook"; // Relative path

  function copyPath() {
    navigator.clipboard.writeText(webhookPath);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-8 text-center">
         <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Send size={32} />
         </div>
         <h2 className="text-xl font-bold text-slate-900">Telegram Webhook</h2>
         <p className="text-slate-500 mt-2 max-w-md mx-auto">
           Connect your Telegram Bot to this RAG Brain. Telegram will send updates to the endpoint below.
         </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
         <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-xl flex flex-col items-center text-center">
            <ShieldCheck className="text-emerald-600 mb-2" />
            <div className="font-semibold text-emerald-900 text-sm">HTTPS Required</div>
            <div className="text-xs text-emerald-700/80 mt-1">Telegram requires a valid SSL certificate.</div>
         </div>
         <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl flex flex-col items-center text-center col-span-2 items-start text-left md:items-start">
             <div className="flex items-center gap-2 mb-2">
               <Globe className="text-slate-400" size={16} />
               <span className="font-semibold text-slate-700 text-sm">Endpoint Route</span>
             </div>
             <div className="bg-white border border-slate-300 rounded-md px-3 py-2 w-full flex justify-between items-center">
                <code className="text-sm font-mono text-slate-800">{webhookPath}</code>
                <button onClick={copyPath} className="text-slate-400 hover:text-slate-600">
                  {copied ? <span className="text-emerald-600 text-xs font-bold">Copied</span> : <Copy size={14} />}
                </button>
             </div>
         </div>
      </div>
    </div>
  );
}
