import React, { useState, useRef, useEffect } from "react";
import { apiFetch } from "../lib/api";
import { 
  Send, 
  Bot, 
  User, 
  Sparkles, 
  AlertCircle, 
  StopCircle, 
  Paperclip, 
  File, 
  X,
  Trash2, // Icon sampah untuk clear history
  RotateCcw // Icon refresh/loading
} from "lucide-react";
import { Button } from "../components/ui";

type Msg = { role: "user" | "assistant"; text: string };

export default function ChatPage() {
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [q, setQ] = useState("");
  const [busy, setBusy] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [statusText, setStatusText] = useState(""); 
  const [err, setErr] = useState("");
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  // --- 1. LOAD HISTORY SAAT HALAMAN DIBUKA ---
  useEffect(() => {
    loadHistory();
  }, []);

  async function loadHistory() {
    setLoadingHistory(true);
    try {
      // Panggil endpoint GET /api/chat
      const history = await apiFetch<Msg[]>("/chat", { method: "GET" });
      if (Array.isArray(history)) {
        setMsgs(history);
      }
    } catch (e) {
      console.error("Failed to load history", e);
    } finally {
      setLoadingHistory(false);
    }
  }

  // --- 2. FUNGSI HAPUS HISTORY ---
  async function clearHistory() {
    if(!confirm("Are you sure you want to clear all chat history?")) return;
    try {
        await apiFetch("/chat", { method: "DELETE" });
        setMsgs([]); // Kosongkan UI
    } catch(e) {
        alert("Failed to clear history");
    }
  }

  // Auto scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs, busy, selectedFile]); 

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  async function send() {
    const text = q.trim();
    if ((!text && !selectedFile) || busy) return;

    setErr("");
    setBusy(true);
    
    // Optimistic Update: Tampilkan pesan user langsung di UI
    let displayMsg = text;
    if (selectedFile) {
        displayMsg = text ? `[Uploaded ${selectedFile.name}] \n${text}` : `[Uploaded ${selectedFile.name}]`;
    }
    
    const newMsgs = [...msgs, { role: "user", text: displayMsg } as Msg];
    setMsgs(newMsgs);
    setQ(""); 
    
    try {
      // Step A: Upload File ke Knowledge Base (Jika ada)
      if (selectedFile) {
        setStatusText("Uploading & Indexing document...");
        const formData = new FormData();
        formData.append('file', selectedFile);
        
        // Upload ke endpoint /api/knowledge/upload
        await apiFetch("/knowledge/upload", { method: "POST", body: formData });
        
        // Reset state file
        setSelectedFile(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
      }

      // Step B: Kirim Pesan Chat
      setStatusText("Thinking...");
      
      const finalMessage = text || `I have uploaded a document named ${selectedFile?.name}. Please analyze it.`;

      // Kirim ke endpoint /api/chat (akan disimpan ke DB oleh backend)
      const res = await apiFetch<{ answer: string }>("/chat", { 
        method: "POST", 
        body: JSON.stringify({ message: finalMessage }) 
      });

      // Tambahkan balasan bot ke UI
      setMsgs((m) => [...m, { role: "assistant", text: res.answer || "No response." }]);
    } catch (e: any) {
      setErr(e?.message || "Connection failed.");
    } finally {
      setBusy(false);
      setStatusText("");
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
      
      {/* Header */}
      <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
        <div className="flex items-center gap-2">
          <Sparkles className="text-emerald-600" size={18} />
          <span className="font-semibold text-slate-700">RAG Assistant</span>
        </div>
        <div className="flex items-center gap-3">
            <div className="text-xs text-slate-400 hidden sm:block">GPT-4.1-mini</div>
            {/* Tombol Clear History (Hanya muncul jika ada pesan) */}
            {msgs.length > 0 && (
                <button 
                    onClick={clearHistory} 
                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-all" 
                    title="Clear Chat History"
                >
                    <Trash2 size={16} />
                </button>
            )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {loadingHistory ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-2">
                <RotateCcw size={24} className="animate-spin" />
                <span className="text-sm">Loading history...</span>
            </div>
        ) : msgs.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center opacity-60">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
              <Bot size={32} className="text-slate-400" />
            </div>
            <h3 className="text-lg font-medium text-slate-900">How can I help you?</h3>
            <p className="text-sm text-slate-500 max-w-xs mt-2">
              Ask questions or attach documents. Your chat history is saved automatically.
            </p>
          </div>
        ) : (
          msgs.map((m, i) => (
            <div key={i} className={`flex w-full ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`flex max-w-[80%] gap-3 ${m.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                {/* Avatar */}
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                  m.role === "user" ? "bg-slate-900 text-white" : "bg-emerald-100 text-emerald-700"
                }`}>
                  {m.role === "user" ? <User size={14} /> : <Bot size={16} />}
                </div>
                {/* Bubble Chat */}
                <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                  m.role === "user" ? "bg-slate-900 text-white rounded-tr-sm" : "bg-slate-50 border border-slate-200 text-slate-800 rounded-tl-sm"
                }`}>
                  {m.text}
                </div>
              </div>
            </div>
          ))
        )}

        {/* Loading Indicator saat menjawab */}
        {busy && (
          <div className="flex w-full justify-start">
            <div className="flex max-w-[80%] gap-3">
               <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                  <Bot size={16} />
               </div>
               <div className="flex flex-col justify-center">
                 <div className="px-4 py-3 rounded-2xl bg-slate-50 border border-slate-100 rounded-tl-sm flex items-center gap-2">
                   <LoaderAnimation />
                   {statusText && <span className="text-xs text-slate-500 font-medium">{statusText}</span>}
                 </div>
               </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {err && (
        <div className="px-6 py-2 bg-red-50 border-t border-red-100 flex items-center gap-2 text-sm text-red-600">
          <AlertCircle size={16} />
          {err}
        </div>
      )}

      {/* Input Area */}
      <div className="p-4 border-t border-slate-200 bg-white">
        <div className="relative flex flex-col gap-2 bg-slate-50 border border-slate-200 rounded-xl p-2 focus-within:ring-2 focus-within:ring-emerald-100 focus-within:border-emerald-400 transition-all">
          
          {/* File Preview */}
          {selectedFile && (
            <div className="mx-2 mt-1 flex items-center gap-2 self-start bg-white border border-slate-200 rounded-lg px-3 py-1.5 shadow-sm animate-in fade-in slide-in-from-bottom-1">
                <div className="bg-emerald-100 text-emerald-600 p-1 rounded"><File size={14} /></div>
                <span className="text-xs font-medium text-slate-700 max-w-[200px] truncate">{selectedFile.name}</span>
                <button 
                    onClick={() => { setSelectedFile(null); if(fileInputRef.current) fileInputRef.current.value = ""; }} 
                    className="ml-1 text-slate-400 hover:text-red-500 transition-colors"
                >
                    <X size={14} />
                </button>
            </div>
          )}

          {/* Text Input & Buttons */}
          <div className="flex items-end gap-2">
            <input type="file" ref={fileInputRef} className="hidden" accept=".pdf,.txt,.md" onChange={handleFileSelect}/>
            
            <button 
                onClick={() => fileInputRef.current?.click()} 
                disabled={busy} 
                className="mb-0.5 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 rounded-lg transition-colors" 
                title="Attach file"
            >
                <Paperclip size={20} />
            </button>
            
            <textarea
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={busy}
              placeholder={selectedFile ? "Add a message..." : "Type your question..."}
              className="flex-1 bg-transparent border-none focus:ring-0 resize-none text-sm text-slate-900 placeholder:text-slate-400 max-h-32 py-2.5 px-2"
              rows={1}
              style={{ minHeight: "44px" }} 
            />
            
            <Button 
                disabled={busy || (!q.trim() && !selectedFile)} 
                onClick={send} 
                className={`shrink-0 mb-0.5 w-10 h-10 rounded-lg flex items-center justify-center transition-all ${busy || (!q.trim() && !selectedFile) ? "bg-slate-200 text-slate-400" : "bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"}`} 
                size="sm"
            >
              {busy ? <StopCircle size={18} /> : <Send size={18} className="ml-0.5" />}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function LoaderAnimation() {
    return (
        <div className="flex gap-1">
            <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
            <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
            <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></span>
        </div>
    );
}
