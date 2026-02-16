import React from "react";

export default function TelegramPage() {
  return (
    <div className="rounded-3xl bg-white/80 backdrop-blur shadow-soft ring-1 ring-slate-200 p-6">
      <div className="text-lg font-semibold">Telegram</div>
      <div className="text-sm text-slate-500 mt-1">Webhook endpoint for Telegram updates.</div>

      <div className="mt-5 rounded-2xl bg-slate-50 ring-1 ring-slate-200 px-4 py-3 text-sm font-mono">
        POST /telegram/webhook
      </div>

      <div className="mt-4 text-sm text-slate-600">
        Pastikan base URL publik kamu HTTPS (Telegram wajib).
      </div>
    </div>
  );
}
