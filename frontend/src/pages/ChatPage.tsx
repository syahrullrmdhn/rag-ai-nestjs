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
  RotateCcw,
  PlusCircle,
  MessageSquare,
  Zap
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

  // --- 1. LOAD HISTORY ---
  useEffect(() => {
    loadHistory();
  }, []);

  async function loadHistory() {
    setLoadingHistory(true);
    try {
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

  // --- 2. NEW CHAT (CLEAR HISTORY) ---
  async function startNewChat() {
    if (msgs.length === 0) return; 
    
    if(!confirm("Start a new chat? This will clear current conversation history.")) return;
    
    try {
        setBusy(true); 
        await apiFetch("/chat", { method: "DELETE" }); 
        setMsgs([]); 
        setQ("");
        setSelectedFile(null);
    } catch(e) {
        alert("Failed to start new chat");
    } finally {
        setBusy(false);
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
    
    // Optimistic Update
    let displayMsg = text;
    if (selectedFile) {
        displayMsg = text ? `[Uploaded ${selectedFile.name}] \n${text}` : `[Uploaded ${selectedFile.name}]`;
    }
    
    const newMsgs = [...msgs, { role: "user", text: displayMsg } as Msg];
    setMsgs(newMsgs);
    setQ(""); 
    
    try {
      if (selectedFile) {
        setStatusText("Uploading & Indexing document...");
        const formData = new FormData();
        formData.append('file', selectedFile);
        await apiFetch("/knowledge/upload", { method: "POST", body: formData });
        setSelectedFile(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
      }

      setStatusText("Thinking...");
      const finalMessage = text || `I have uploaded a document named ${selectedFile?.name}. Please analyze it.`;

      const res = await apiFetch<{ answer: string }>("/chat", { 
        method: "POST", 
        body: JSON.stringify({ message: finalMessage }) 
      });

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
    <div className="flex flex-col h-[calc(100vh-8rem)] bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden animate-in fade-in zoom-in-95 duration-300">
      
      {/* Header - Clean Style */}
      <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <Button 
              variant="ghost" 
              size="sm" 
              onClick={startNewChat}
              disabled={msgs.length === 0 || busy}
              className="text-slate-600 hover:text-slate-900 hover:bg-slate-100 gap-2 h-10 px-4 rounded-full transition-colors"
          >
              <PlusCircle size={18} />
              <span className="font-medium">New chat</span>
          </Button>
        </div>
        
        {/* Branding Title */}
        <div className="flex items-center gap-2 text-slate-500">
          <Zap size={16} className="text-emerald-600 fill-current"/>
          <span className="font-semibold text-sm text-slate-700">RAG AI Assistant</span>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-8 scroll-smooth bg-slate-50/30">
        {loadingHistory ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-3 animate-pulse">
                <RotateCcw size={24} className="animate-spin text-slate-300" />
                <span className="text-xs font-medium">Restoring conversation...</span>
            </div>
        ) : msgs.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center opacity-100 animate-in slide-in-from-bottom-4 duration-500">
            <div className="w-20 h-20 bg-gradient-to-br from-emerald-100 to-cyan-50 rounded-3xl flex items-center justify-center mb-6 shadow-md">
              <Sparkles size={40} className="text-emerald-600" />
            </div>
            <h3 className="text-2xl font-semibold text-slate-800 mb-3">Hello, Human.</h3>
            <p className="text-slate-500 max-w-sm leading-relaxed text-base">
              I'm your RAG assistant. Upload documents to train me, then ask anything.
            </p>
            
            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-md">
                <button onClick={() => setQ("Summarize the last uploaded document")} className="p-4 text-sm text-left bg-white border border-slate-200 hover:border-emerald-300 hover:shadow-md rounded-xl transition-all text-slate-600 flex items-center gap-3">
                    <MessageSquare size={18} className="text-emerald-500" /> Summarize document
                </button>
                <button onClick={() => setQ("What are the key takeaways?")} className="p-4 text-sm text-left bg-white border border-slate-200 hover:border-emerald-300 hover:shadow-md rounded-xl transition-all text-slate-600 flex items-center gap-3">
                    <File size={18} className="text-emerald-500" /> Key takeaways
                </button>
            </div>
          </div>
        ) : (
          msgs.map((m, i) => (
            <div key={i} className={`flex w-full ${m.role === "user" ? "justify-end" : "justify-start"} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
              <div className={`flex max-w-[85%] sm:max-w-[75%] gap-4 ${m.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                
                {/* Avatar */}
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow-sm ${
                  m.role === "user" ? "bg-slate-200 text-slate-600" : "bg-gradient-to-br from-emerald-100 to-cyan-50 text-emerald-600"
                }`}>
                  {m.role === "user" ? <User size={18} /> : <Sparkles size={20} />}
                </div>

                {/* Bubble */}
                <div className={`px-6 py-4 rounded-3xl text-[15px] leading-relaxed shadow-sm ${
                  m.role === "user" 
                    ? "bg-slate-800 text-white" 
                    : "bg-white border border-slate-200 text-slate-700"
                }`}>
                  <div className="whitespace-pre-wrap">{m.text}</div>
                </div>
              </div>
            </div>
          ))
        )}

        {/* Busy State */}
        {busy && (
          <div className="flex w-full justify-start animate-in fade-in duration-300">
            <div className="flex max-w-[80%] gap-4">
               <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-100 to-cyan-50 text-emerald-600 flex items-center justify-center shrink-0 shadow-sm">
                  <Sparkles size={20} />
               </div>
               <div className="flex flex-col justify-center">
                 <div className="px-6 py-5 rounded-3xl bg-white border border-slate-200 flex items-center gap-3 shadow-sm">
                   <LoaderAnimation />
                   {statusText && <span className="text-sm text-slate-500 font-medium animate-pulse">{statusText}</span>}
                 </div>
               </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {err && (
        <div className="px-6 py-3 bg-red-50 border-t border-red-100 flex items-center gap-3 text-sm text-red-600 animate-in slide-in-from-bottom-2">
          <AlertCircle size={16} className="shrink-0" />
          {err}
        </div>
      )}

      {/* Input Area */}
      <div className="p-6 border-t border-slate-200 bg-white">
        <div className="relative flex flex-col gap-3 bg-slate-50 border border-slate-200 rounded-3xl p-3 focus-within:ring-2 focus-within:ring-emerald-100 focus-within:border-emerald-400 transition-all shadow-inner">
          
          {/* File Preview */}
          {selectedFile && (
            <div className="mx-3 mt-2 flex items-center gap-3 self-start bg-white border border-slate-200 rounded-xl px-4 py-2 animate-in fade-in slide-in-from-bottom-1 shadow-sm">
                <div className="bg-emerald-50 text-emerald-600 p-1.5 rounded-lg"><File size={16} /></div>
                <span className="text-sm font-medium text-slate-700 max-w-[200px] truncate">{selectedFile.name}</span>
                <button 
                    onClick={() => { setSelectedFile(null); if(fileInputRef.current) fileInputRef.current.value = ""; }} 
                    className="ml-3 text-slate-400 hover:text-red-500 transition-colors p-1 hover:bg-slate-100 rounded-full"
                >
                    <X size={16} />
                </button>
            </div>
          )}

          <div className="flex items-center gap-2 px-2">
            <input type="file" ref={fileInputRef} className="hidden" accept=".pdf,.txt,.md" onChange={handleFileSelect}/>
            
            <button 
                onClick={() => fileInputRef.current?.click()} 
                disabled={busy} 
                className="p-3 text-slate-500 hover:text-slate-700 hover:bg-slate-200 rounded-full transition-all" 
                title="Attach file"
            >
                <Paperclip size={22} />
            </button>
            
            <textarea
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={busy}
              placeholder={selectedFile ? "Add a message about this file..." : "Message..."}
              className="flex-1 bg-transparent border-none focus:ring-0 resize-none text-base text-slate-800 placeholder:text-slate-500 max-h-40 py-3 px-3"
              rows={1}
              style={{ minHeight: "56px" }} 
            />
            
            <Button 
                disabled={busy || (!q.trim() && !selectedFile)} 
                onClick={send} 
                className={`shrink-0 w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                    busy || (!q.trim() && !selectedFile) 
                    ? "bg-slate-200 text-slate-400" 
                    : "bg-slate-900 hover:bg-black text-white shadow-md hover:shadow-lg"
                }`} 
                size="icon"
            >
              {busy ? <StopCircle size={22} /> : <Send size={22} className="ml-0.5" />}
            </Button>
          </div>
        </div>
        <div className="text-center mt-3">
          <p className="text-xs text-slate-400">
             AI can make mistakes. Check important info.
          </p>
        </div>
      </div>
    </div>
  );
}

function LoaderAnimation() {
    return (
        <div className="flex gap-1.5 px-1">
            <span className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
            <span className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
            <span className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce"></span>
        </div>
    );
}
