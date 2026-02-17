import React, { useState, useRef, useEffect } from "react";
import { apiFetch } from "../lib/api";
import { Send, Bot, User, Sparkles, AlertCircle, StopCircle } from "lucide-react";
import { Button } from "../components/ui";

type Msg = { role: "user" | "assistant"; text: string };

export default function ChatPage() {
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [q, setQ] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  
  // Ref untuk auto-scroll ke bawah
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto scroll setiap kali pesan berubah atau status busy berubah
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs, busy]);

  async function send() {
    const text = q.trim();
    if (!text || busy) return;
    setErr("");
    setBusy(true);
    setQ("");
    
    // Optimistic update
    const newMsgs = [...msgs, { role: "user", text } as Msg];
    setMsgs(newMsgs);

    try {
      const res = await apiFetch<{ answer: string }>("/chat", { 
        method: "POST", 
        body: JSON.stringify({ message: text }) 
      });
      setMsgs((m) => [...m, { role: "assistant", text: res.answer || "No response generated." }]);
    } catch (e: any) {
      setErr(e?.message || "Connection to inference engine failed.");
    } finally {
      setBusy(false);
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      
      {/* Header Kecil di dalam Chat Box (Opsional, untuk konteks) */}
      <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
        <div className="flex items-center gap-2">
          <Sparkles className="text-emerald-600" size={18} />
          <span className="font-semibold text-slate-700">RAG Assistant</span>
        </div>
        <div className="text-xs text-slate-400">
           Model: GPT-4.1-mini
        </div>
      </div>

      {/* Area Chat */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {msgs.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center opacity-60">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
              <Bot size={32} className="text-slate-400" />
            </div>
            <h3 className="text-lg font-medium text-slate-900">How can I help you?</h3>
            <p className="text-sm text-slate-500 max-w-xs mt-2">
              Ask questions about your uploaded documents, reports, or knowledge base.
            </p>
          </div>
        ) : (
          msgs.map((m, i) => (
            <div 
              key={i} 
              className={`flex w-full ${m.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div className={`flex max-w-[80%] gap-3 ${m.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                
                {/* Avatar */}
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                  m.role === "user" ? "bg-slate-900 text-white" : "bg-emerald-100 text-emerald-700"
                }`}>
                  {m.role === "user" ? <User size={14} /> : <Bot size={16} />}
                </div>

                {/* Bubble */}
                <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                  m.role === "user" 
                    ? "bg-slate-900 text-white rounded-tr-sm" 
                    : "bg-slate-50 border border-slate-200 text-slate-800 rounded-tl-sm"
                }`}>
                  {m.text}
                </div>
              </div>
            </div>
          ))
        )}

        {/* Loading Indicator */}
        {busy && (
          <div className="flex w-full justify-start">
            <div className="flex max-w-[80%] gap-3">
               <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                  <Bot size={16} />
               </div>
               <div className="px-4 py-3 rounded-2xl bg-slate-50 border border-slate-100 rounded-tl-sm flex items-center gap-1">
                 <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                 <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                 <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></span>
               </div>
            </div>
          </div>
        )}
        
        {/* Invisible div untuk target scroll */}
        <div ref={bottomRef} />
      </div>

      {/* Error Message */}
      {err && (
        <div className="px-6 py-2 bg-red-50 border-t border-red-100 flex items-center gap-2 text-sm text-red-600">
          <AlertCircle size={16} />
          {err}
        </div>
      )}

      {/* Input Area */}
      <div className="p-4 border-t border-slate-200 bg-white">
        <div className="relative flex items-end gap-2 bg-slate-50 border border-slate-200 rounded-xl p-2 focus-within:ring-2 focus-within:ring-emerald-100 focus-within:border-emerald-400 transition-all">
          <textarea
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={busy}
            placeholder="Type your question..."
            className="w-full bg-transparent border-none focus:ring-0 resize-none text-sm text-slate-900 placeholder:text-slate-400 max-h-32 py-2.5 px-2"
            rows={1}
            style={{ minHeight: "44px" }} 
          />
          <Button 
            disabled={busy || !q.trim()}
            onClick={send}
            className={`shrink-0 mb-0.5 w-10 h-10 rounded-lg flex items-center justify-center transition-all ${
              busy || !q.trim() ? "bg-slate-200 text-slate-400" : "bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
            }`}
            size="sm" // Asumsi Button punya prop size, jika tidak hapus
          >
            {busy ? <StopCircle size={18} /> : <Send size={18} className="ml-0.5" />}
          </Button>
        </div>
        <div className="text-center mt-2">
          <p className="text-[10px] text-slate-400">
            AI can make mistakes. Please verify important information.
          </p>
        </div>
      </div>
    </div>
  );
}
