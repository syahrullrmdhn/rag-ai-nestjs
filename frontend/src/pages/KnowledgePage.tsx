import React from "react";
import { apiFetch } from "../lib/api";
import { Badge, Button, Card, CardBody, CardHeader, Divider, Input, Modal, Textarea } from "../components/ui";

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

function statusTone(s: string) {
  if (s === "indexed") return "ok";
  if (s === "indexing") return "warn";
  if (s === "pending") return "muted";
  if (s === "failed" || s === "error") return "danger";
  return "muted";
}

export default function KnowledgePage() {
  const [rows, setRows] = React.useState<DocRow[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [err, setErr] = React.useState<string | null>(null);

  // upload
  const [title, setTitle] = React.useState("");
  const [file, setFile] = React.useState<File | null>(null);
  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const [uploading, setUploading] = React.useState(false);
  const [progress, setProgress] = React.useState<number>(0);

  // paste text
  const [textTitle, setTextTitle] = React.useState("");
  const [text, setText] = React.useState("");
  const [ingesting, setIngesting] = React.useState(false);

  async function load() {
    setErr(null);
    setLoading(true);
    try {
      const data = await apiFetch<DocRow[]>("/knowledge", { method: "GET" });
      setRows(data || []);
    } catch (e: any) {
      setErr(e?.message || "Failed to load");
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

  function openConfirm() {
    if (!file) {
      setErr("Pilih file dulu.");
      return;
    }
    setConfirmOpen(true);
  }

  async function doUpload() {
    if (!file) return;
    setConfirmOpen(false);
    setUploading(true);
    setErr(null);
    setProgress(0);

    await new Promise<void>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open("POST", "/knowledge/upload", true);
      xhr.setRequestHeader("Authorization", `Bearer ${localStorage.getItem("rag_ai_dev_token") || ""}`);

      xhr.upload.onprogress = (evt) => {
        if (!evt.lengthComputable) return;
        setProgress(Math.round((evt.loaded / evt.total) * 100));
      };
      xhr.onerror = () => reject(new Error("Upload failed"));
      xhr.onload = async () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve();
        } else if (xhr.status === 401) {
          reject(new Error("Unauthorized"));
        } else {
          try {
            const j = JSON.parse(xhr.responseText || "{}");
            reject(new Error(j.message || `Upload failed (${xhr.status})`));
          } catch {
            reject(new Error(`Upload failed (${xhr.status})`));
          }
        }
      };

      const fd = new FormData();
      if (title.trim()) fd.append("title", title.trim());
      fd.append("file", file);
      xhr.send(fd);
    });

    setUploading(false);
    setFile(null);
    setTitle("");
    setProgress(0);
    await load();
  }

  async function ingestText() {
    const t = (text || "").trim();
    if (!t) {
      setErr("Text kosong.");
      return;
    }
    setErr(null);
    setIngesting(true);
    try {
      await apiFetch("/knowledge/text", {
        method: "POST",
        body: JSON.stringify({ title: (textTitle || "").trim() || "Untitled", text: t }),
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

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader title="Add Knowledge" subtitle="Upload a file or paste text. Then query it in Chat." />
        <CardBody className="space-y-6">
          {err ? <div className="text-sm text-red-600">{err}</div> : null}

          {/* Upload */}
          <div>
            <div className="text-sm font-semibold text-black">Upload File</div>
            <div className="mt-1 text-sm text-black/60">PDF / TXT recommended.</div>

            <div className="mt-4 grid gap-3">
              <Input
                label="Title (optional)"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Kubernetes Basics"
              />

              <div className="rounded-2xl border border-dashed border-black/15 bg-white p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-black">Choose a file</div>
                    <div className="mt-1 text-xs text-black/50 truncate">
                      {file ? `${file.name} • ${Math.round(file.size / 1024)} KB` : "No file selected"}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <label className="inline-flex cursor-pointer items-center justify-center rounded-2xl px-4 py-2 text-sm font-medium bg-black/5 hover:bg-black/10">
                      Select
                      <input
                        type="file"
                        className="hidden"
                        accept=".pdf,.txt"
                        onChange={(e) => pickFile(e.target.files?.[0] || null)}
                      />
                    </label>
                    <Button variant="primary" onClick={openConfirm} disabled={!file || uploading}>
                      {uploading ? "Uploading…" : "Upload"}
                    </Button>
                  </div>
                </div>

                {uploading ? (
                  <div className="mt-3">
                    <div className="h-2 w-full rounded-full bg-black/5 overflow-hidden">
                      <div className="h-2 rounded-full bg-emerald-700" style={{ width: `${progress}%` }} />
                    </div>
                    <div className="mt-1 text-xs text-black/50">{progress}%</div>
                  </div>
                ) : null}
              </div>
            </div>
          </div>

          <Divider />

          {/* Paste text */}
          <div>
            <div className="text-sm font-semibold text-black">Paste Text</div>
            <div className="mt-1 text-sm text-black/60">Good for quick notes or runbooks.</div>

            <div className="mt-4 grid gap-3">
              <Input
                label="Title"
                value={textTitle}
                onChange={(e) => setTextTitle(e.target.value)}
                placeholder="e.g. Oncall SOP"
              />
              <Textarea
                label="Text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Paste knowledge text here…"
              />
              <div className="flex justify-end">
                <Button onClick={ingestText} disabled={ingesting}>
                  {ingesting ? "Ingesting…" : "Ingest Text"}
                </Button>
              </div>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* List */}
      <Card>
        <CardHeader title="Knowledge Library" subtitle="Your uploaded documents and ingested notes." />
        <CardBody>
          <div className="flex items-center justify-between">
            <div className="text-sm text-black/60">{loading ? "Loading…" : `${rows.length} items`}</div>
            <Button variant="ghost" onClick={load}>Refresh</Button>
          </div>

          <div className="mt-4 divide-y divide-black/5 rounded-2xl border border-black/5 overflow-hidden">
            {rows.length === 0 ? (
              <div className="p-4 text-sm text-black/60">No knowledge yet. Upload a file or paste text above.</div>
            ) : (
              rows.map((r) => (
                <div key={r.id} className="p-4 flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-black truncate">{r.title}</div>
                    <div className="mt-1 text-xs text-black/50">
                      {r.type.toUpperCase()} • {new Date(r.createdAt).toLocaleString()}
                      {r.sourcePath ? ` • ${String(r.sourcePath).split("/").pop()}` : ""}
                      {typeof r.progress === "number" ? ` • ${r.progress}%` : ""}
                      {(r.status === "failed" || r.status === "error") && r.errorMessage ? ` • ${r.errorMessage}` : ""}
                    </div>
                  </div>
                  <div className="shrink-0">
                    <Badge tone={statusTone(r.status) as any}>{r.status}</Badge>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardBody>
      </Card>

      <Modal
        open={confirmOpen}
        title="Confirm upload"
        onClose={() => setConfirmOpen(false)}
        actions={
          <>
            <Button variant="ghost" onClick={() => setConfirmOpen(false)}>Cancel</Button>
            <Button onClick={doUpload}>Upload</Button>
          </>
        }
      >
        <div className="text-sm text-black/70">
          Upload <span className="font-medium">{file?.name}</span> ?
        </div>
      </Modal>
    </div>
  );
}
