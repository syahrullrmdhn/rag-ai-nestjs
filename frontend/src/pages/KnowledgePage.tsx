import React from "react";
import { apiFetch } from "../lib/api";
import { Button, Input, Textarea } from "../components/ui";
import { 
  FileText, 
  UploadCloud, 
  RefreshCw, 
  FileUp, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  Trash2, 
  File,
  Library,
  AlertTriangle, // Icon untuk modal warning
  X // Icon close
} from "lucide-react";

type DocRow = {
  id: string;
  userId: string;
  title: string;
  type: "text" | "file";
  sourcePath?: string | null;
  status: "pending" | "indexing" | "indexed" | "failed" | string;
  progress?: number;
  errorMessage?: string | null;
  createdAt: string;
};

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    indexed: "bg-emerald-100 text-emerald-700 border-emerald-200",
    indexing: "bg-blue-100 text-blue-700 border-blue-200",
    pending: "bg-slate-100 text-slate-600 border-slate-200",
    failed: "bg-red-100 text-red-700 border-red-200",
  };
  
  const s = status.toLowerCase();
  const currentStyle = styles[s] || styles.pending;

  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${currentStyle} inline-flex items-center gap-1 capitalize`}>
      {s === 'indexed' && <CheckCircle2 size={12} />}
      {s === 'failed' && <AlertCircle size={12} />}
      {s === 'indexing' && <Loader2 size={12} className="animate-spin" />}
      {status}
    </span>
  );
}

export default function KnowledgePage() {
  const [rows, setRows] = React.useState<DocRow[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [err, setErr] = React.useState<string | null>(null);

  // upload
  const [title, setTitle] = React.useState("");
  const [file, setFile] = React.useState<File | null>(null);
  const [uploading, setUploading] = React.useState(false);
  const [progress, setProgress] = React.useState<number>(0);

  // paste text
  const [textTitle, setTextTitle] = React.useState("");
  const [text, setText] = React.useState("");
  const [ingesting, setIngesting] = React.useState(false);

  // DELETE STATE
  // docToDelete: menyimpan objek dokumen yang sedang dikonfirmasi untuk dihapus (jika null = modal tutup)
  const [docToDelete, setDocToDelete] = React.useState<DocRow | null>(null);
  // isDeleting: status loading saat request delete ke API berjalan
  const [isDeleting, setIsDeleting] = React.useState(false);

  async function load() {
    setErr(null);
    setLoading(true);
    try {
      // apiFetch sudah otomatis menambahkan /api prefix jika dikonfigurasi di api.ts
      // tapi untuk amannya, kita panggil endpoint yang sesuai
      const data = await apiFetch<DocRow[]>("/knowledge", { method: "GET" });
      setRows(data || []);
    } catch (e: any) {
      setErr(e?.message || "Unable to fetch documents");
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => { load(); }, []);

  function pickFile(f: File | null) {
    setFile(f);
    setProgress(0);
    if (f && !title) setTitle(f.name);
  }

  async function doUpload() {
    if (!file) return;
    setUploading(true);
    setErr(null);
    setProgress(0);

    try {
      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        
        // --- PERBAIKAN PENTING DISINI ---
        // Kita hardcode "/api" di sini karena XMLHttpRequest tidak menggunakan helper apiFetch
        // Backend mengharapkan request ke /api/knowledge/upload
        xhr.open("POST", "/api/knowledge/upload", true);
        // --------------------------------
        
        xhr.setRequestHeader("Authorization", `Bearer ${localStorage.getItem("rag_ai_dev_token") || ""}`);

        xhr.upload.onprogress = (evt) => {
          if (!evt.lengthComputable) return;
          setProgress(Math.round((evt.loaded / evt.total) * 100));
        };
        xhr.onerror = () => reject(new Error("Network Error"));
        xhr.onload = async () => {
          if (xhr.status >= 200 && xhr.status < 300) resolve();
          else {
             // Coba parse error message dari backend
             let errorMsg = `Upload failed (${xhr.status})`;
             try {
                const res = JSON.parse(xhr.responseText);
                if(res.message) errorMsg = res.message;
             } catch {}
             reject(new Error(errorMsg));
          }
        };

        const fd = new FormData();
        if (title.trim()) fd.append("title", title.trim());
        fd.append("file", file);
        xhr.send(fd);
      });
      setFile(null);
      setTitle("");
      setProgress(0);
      await load();
    } catch (e: any) {
      setErr(e.message);
    } finally {
      setUploading(false);
    }
  }

  async function ingestText() {
    const t = (text || "").trim();
    if (!t) return;
    setErr(null);
    setIngesting(true);
    try {
      await apiFetch("/knowledge/text", {
        method: "POST",
        body: JSON.stringify({ title: (textTitle || "").trim() || "Untitled Note", text: t }),
      });
      setText("");
      setTextTitle("");
      await load();
    } catch (e: any) {
      setErr(e?.message || "Ingest failed");
    } finally {
      setIngesting(false);
    }
  }

  // Fungsi eksekusi delete (dipanggil saat tombol 'Delete' di modal ditekan)
  async function confirmDelete() {
    if (!docToDelete) return;
    
    setIsDeleting(true);
    try {
      await apiFetch(`/knowledge/${docToDelete.id}`, { method: "DELETE" });
      setDocToDelete(null); // Tutup modal
      await load(); // Refresh data
    } catch (e: any) {
      alert(e?.message || "Failed to delete");
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 relative">
      
      {/* Top Section: Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left: File Upload */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
              <UploadCloud size={20} />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">Upload Document</h3>
              <p className="text-sm text-slate-500">PDF, TXT, or Markdown supported.</p>
            </div>
          </div>

          <div className="flex-1 space-y-4">
            <Input
              label="Document Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Q1 Financial Report"
            />
            
            <div className={`relative border-2 border-dashed rounded-xl p-6 text-center transition-colors ${file ? 'border-emerald-400 bg-emerald-50/30' : 'border-slate-200 hover:border-emerald-400 hover:bg-slate-50'}`}>
              <input
                type="file"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                accept=".pdf,.txt,.md"
                onChange={(e) => pickFile(e.target.files?.[0] || null)}
                disabled={uploading}
              />
              <div className="flex flex-col items-center justify-center space-y-2 pointer-events-none">
                {file ? (
                  <>
                    <FileText className="text-emerald-600" size={32} />
                    <div className="text-sm font-medium text-emerald-900">{file.name}</div>
                    <div className="text-xs text-emerald-600">{(file.size / 1024).toFixed(0)} KB</div>
                  </>
                ) : (
                  <>
                    <FileUp className="text-slate-400" size={32} />
                    <div className="text-sm font-medium text-slate-600">Click or drag file here</div>
                  </>
                )}
              </div>
            </div>

            {uploading && (
               <div className="space-y-1">
                 <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                   <div className="h-full bg-emerald-500 transition-all duration-300" style={{ width: `${progress}%` }} />
                 </div>
                 <div className="text-xs text-center text-slate-500">Uploading... {progress}%</div>
               </div>
            )}

            <Button 
              className="w-full bg-slate-900 hover:bg-slate-800 text-white" 
              onClick={doUpload} 
              disabled={!file || uploading}
            >
              {uploading ? "Processing..." : "Start Upload"}
            </Button>
          </div>
        </div>

        {/* Right: Paste Text */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <FileText size={20} />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">Direct Input</h3>
              <p className="text-sm text-slate-500">Paste snippets or raw text content.</p>
            </div>
          </div>

          <div className="flex-1 space-y-4 flex flex-col">
            <Input
              label="Snippet Title"
              value={textTitle}
              onChange={(e) => setTextTitle(e.target.value)}
              placeholder="e.g. System Prompts"
            />
            <Textarea
              label=""
              className="flex-1 min-h-[140px] font-mono text-sm"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Paste content here..."
            />
             <Button 
              className="w-full"
              variant="secondary"
              onClick={ingestText} 
              disabled={ingesting || !text}
            >
              {ingesting ? "Ingesting..." : "Save as Note"}
            </Button>
          </div>
        </div>
      </div>

      {err && (
        <div className="p-4 rounded-lg bg-red-50 text-red-700 text-sm border border-red-100 flex items-center gap-2">
          <AlertCircle size={16} />
          {err}
        </div>
      )}

      {/* List Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-800">Indexed Documents</h2>
          <Button variant="ghost" size="sm" onClick={load} className="text-slate-500 hover:text-slate-900 gap-2">
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            Refresh
          </Button>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
          {rows.length === 0 ? (
            <div className="p-12 text-center text-slate-500">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Library size={24} className="opacity-50" />
              </div>
              <p>No knowledge base items yet.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {rows.map((r) => (
                <div key={r.id} className="p-4 hover:bg-slate-50 transition-colors flex items-center gap-4 group">
                  <div className="p-2 rounded bg-slate-100 text-slate-500">
                    {r.type === 'file' ? <File size={18} /> : <FileText size={18} />}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-slate-900 truncate">{r.title}</div>
                    <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-2">
                      <span>{new Date(r.createdAt).toLocaleDateString()}</span>
                      <span className="w-1 h-1 bg-slate-300 rounded-full" />
                      <span className="uppercase">{r.type}</span>
                      {r.errorMessage && <span className="text-red-500">• {r.errorMessage}</span>}
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    {typeof r.progress === 'number' && r.status === 'indexing' && (
                       <span className="text-xs text-slate-500 font-mono">{r.progress}%</span>
                    )}
                    <StatusBadge status={r.status} />
                    
                    {/* BUTTON DELETE: Membuka Modal */}
                    <button 
                      onClick={() => setDocToDelete(r)} // Set row state untuk membuka modal
                      className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors group-hover:opacity-100 opacity-50"
                      title="Delete document"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* --- CUSTOM MODAL --- */}
      {docToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop Blur */}
          <div 
            className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity" 
            onClick={() => !isDeleting && setDocToDelete(null)}
          ></div>

          {/* Modal Card */}
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-xl ring-1 ring-black/5 p-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex flex-col items-center text-center sm:items-start sm:text-left sm:flex-row gap-4">
              
              {/* Icon Warning */}
              <div className="flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:h-10 sm:w-10">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>

              {/* Text Content */}
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-slate-900">Delete Document</h3>
                <div className="mt-2">
                  <p className="text-sm text-slate-500">
                    Are you sure you want to delete <span className="font-medium text-slate-900">"{docToDelete.title}"</span>? 
                    This action will remove the file and all associated indexes permanently.
                  </p>
                </div>
              </div>
            </div>

            {/* Buttons */}
            <div className="mt-6 flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
              <Button 
                variant="ghost" 
                onClick={() => setDocToDelete(null)}
                disabled={isDeleting}
                className="w-full sm:w-auto text-slate-700 hover:bg-slate-100"
              >
                Cancel
              </Button>
              <Button 
                onClick={confirmDelete} 
                disabled={isDeleting}
                className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white shadow-sm ring-1 ring-red-700/10 focus:ring-red-500"
              >
                {isDeleting ? (
                  <>
                    <Loader2 size={16} className="mr-2 animate-spin" /> 
                    Deleting...
                  </>
                ) : "Delete Forever"}
              </Button>
            </div>
            
            {/* Close X (Optional) */}
            <button 
              onClick={() => !isDeleting && setDocToDelete(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
            >
              <X size={20} />
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
