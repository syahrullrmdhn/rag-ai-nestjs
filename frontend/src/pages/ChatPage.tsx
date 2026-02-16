import React, { useState } from "react";
import { apiFetch } from "../lib/api";

type Msg = { role: "user" | "assistant"; text: string };

export default function ChatPage() {
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [q, setQ] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  async function send() {
    const text = q.trim();
    if (!text || busy) return;
    setErr("");
    setBusy(true);
    setQ("");
    setMsgs((m) => [...m, { role: "user", text }]);

    try {
      const res = await apiFetch("/chat", { method: "POST", body: JSON.stringify({ message: text }) });
      setMsgs((m) => [...m, { role: "assistant", text: res.answer || "No answer" }]);
    } catch (e: any) {
      setErr(e?.message || "Failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-3xl bg-white/80 backdrop-blur shadow-soft ring-1 ring-slate-200 p-6">
      <div className="text-lg font-semibold">Chat</div>
      <div className="text-sm text-slate-500 mt-1">Ask questions based on uploaded knowledge.</div>

      <div className="mt-5 h-[420px] overflow-auto rounded-2xl bg-slate-50 ring-1 ring-slate-200 p-4 space-y-3">
        {msgs.length === 0 ? (
          <div className="text-sm text-slate-500">No messages yet.</div>
        ) : (
          msgs.map((m, i) => (
            <div key={i} className={"flex " + (m.role === "user" ? "justify-end" : "justify-start")}>
              <div className={(m.role === "user"
                ? "max-w-[80%] rounded-2xl bg-emerald-700 text-white px-4 py-3 text-sm"
                : "max-w-[80%] rounded-2xl bg-white ring-1 ring-slate-200 px-4 py-3 text-sm")}>
                {m.text}
              </div>
            </div>
          ))
        )}
      </div>

      <div className="mt-4 flex gap-3">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") send(); }}
          className="flex-1 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:ring-4 focus:ring-emerald-100 focus:border-emerald-300"
          placeholder="Type your question..."
        />
        <button
          disabled={busy}
          onClick={send}
          className="rounded-2xl bg-emerald-700 hover:bg-emerald-800 disabled:opacity-60 text-white px-5 py-3 text-sm font-semibold"
        >
          Send
        </button>
      </div>

      {err && <div className="mt-3 text-sm text-rose-700">{err}</div>}
    </div>
  );
}
