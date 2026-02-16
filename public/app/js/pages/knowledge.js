import { api } from "../api.js";
import { el } from "../ui.js";
import { toast } from "../components/toast.js";

export function mountKnowledge(root) {
  const node = el(`
  <div class="max-w-6xl mx-auto space-y-6">
    <div class="flex items-end justify-between">
      <div>
        <div class="text-xs tracking-widest text-slate-500 font-semibold">RAG AI DEV</div>
        <h1 class="text-3xl font-extrabold mt-1" style="font-family:Manrope,Inter">Knowledge</h1>
        <p class="text-slate-500 mt-2">Add knowledge via file upload or paste text. You’ll get clear status indicators.</p>
      </div>
      <a href="#/chat" class="btn btn-primary">Open Chat</a>
    </div>

    <div class="grid lg:grid-cols-2 gap-6">
      <div class="card p-6 space-y-4">
        <div>
          <div class="text-sm font-extrabold">Upload File</div>
          <div class="text-xs text-slate-500 mt-1">Supported: PDF / TXT (max depends on backend).</div>
        </div>

        <div>
          <label class="text-xs font-bold text-slate-600">Optional title</label>
          <input id="fileTitle" class="input mt-2" placeholder="e.g. Kubernetes Notes" />
        </div>

        <div class="flex items-center gap-3">
          <input id="fileInput" type="file" accept=".pdf,.txt" class="block w-full text-sm text-slate-600
            file:mr-4 file:rounded-xl file:border-0 file:bg-emerald-700 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white
            hover:file:bg-emerald-800" />
        </div>

        <div class="flex items-center gap-3">
          <button id="btnUpload" class="btn btn-primary">Upload & Ingest</button>
          <span id="uploadStatus" class="text-xs text-slate-500"></span>
        </div>

        <div class="w-full bg-slate-900/5 rounded-full h-2 overflow-hidden">
          <div id="uploadBar" class="h-2 bg-emerald-700 w-0 transition-all"></div>
        </div>

        <div class="text-xs text-slate-500">
          You’ll get a confirmation prompt before uploading.
        </div>
      </div>

      <div class="card p-6 space-y-4">
        <div>
          <div class="text-sm font-extrabold">Paste Text</div>
          <div class="text-xs text-slate-500 mt-1">Best for short docs, SOP, runbooks, notes.</div>
        </div>

        <div>
          <label class="text-xs font-bold text-slate-600">Title</label>
          <input id="textTitle" class="input mt-2" placeholder="e.g. Incident SOP" />
        </div>

        <div>
          <label class="text-xs font-bold text-slate-600">Content</label>
          <textarea id="textContent" class="input mt-2 min-h-[220px]" placeholder="Paste your knowledge text here..."></textarea>
        </div>

        <div class="flex items-center gap-3">
          <button id="btnIngestText" class="btn btn-primary">Ingest Text</button>
          <span id="textStatus" class="text-xs text-slate-500"></span>
        </div>
      </div>
    </div>

    <div class="card p-6">
      <div class="flex items-center justify-between">
        <div>
          <div class="text-sm font-extrabold">Documents</div>
          <div class="text-xs text-slate-500 mt-1">Track what has been ingested.</div>
        </div>
        <button id="btnReload" class="btn">Refresh</button>
      </div>

      <div class="mt-4 overflow-auto scrollbar">
        <table class="w-full text-sm">
          <thead>
            <tr class="text-left text-xs text-slate-500">
              <th class="py-2 pr-2">Title</th>
              <th class="py-2 pr-2">Type</th>
              <th class="py-2 pr-2">Status</th>
              <th class="py-2 pr-2">Created</th>
            </tr>
          </thead>
          <tbody id="docsBody"></tbody>
        </table>
      </div>
    </div>
  </div>`);

  root.appendChild(node);

  const fileTitle = node.querySelector("#fileTitle");
  const fileInput = node.querySelector("#fileInput");
  const btnUpload = node.querySelector("#btnUpload");
  const uploadStatus = node.querySelector("#uploadStatus");
  const uploadBar = node.querySelector("#uploadBar");

  const textTitle = node.querySelector("#textTitle");
  const textContent = node.querySelector("#textContent");
  const btnIngestText = node.querySelector("#btnIngestText");
  const textStatus = node.querySelector("#textStatus");

  const docsBody = node.querySelector("#docsBody");

  async function loadDocs() {
    try {
      const docs = await api.get("/knowledge");
      docsBody.innerHTML = docs.map(d => {
        const badge =
          d.status === "indexed" ? `<span class="badge"><span class="h-2 w-2 bg-emerald-600 rounded-full"></span>Indexed</span>` :
          `<span class="badge"><span class="h-2 w-2 bg-amber-500 rounded-full"></span>${d.status}</span>`;
        return `
          <tr class="border-t border-slate-900/5">
            <td class="py-3 pr-2 font-semibold">${escapeHtml(d.title || "(untitled)")}</td>
            <td class="py-3 pr-2 text-slate-600">${escapeHtml(d.type)}</td>
            <td class="py-3 pr-2">${badge}</td>
            <td class="py-3 pr-2 text-slate-600">${new Date(d.createdAt).toLocaleString()}</td>
          </tr>`;
      }).join("");
    } catch (e) {
      toast("Failed to load documents.", "err", String(e.message || e));
    }
  }

  node.querySelector("#btnReload").addEventListener("click", loadDocs);
  loadDocs();

  btnUpload.addEventListener("click", async () => {
    const f = fileInput.files?.[0];
    if (!f) return toast("Pick a file first.", "warn");

    const ok = confirm(`Upload & ingest "${f.name}"?`);
    if (!ok) return;

    const fd = new FormData();
    fd.append("file", f);
    if (fileTitle.value.trim()) fd.append("title", fileTitle.value.trim());

    uploadStatus.textContent = "Uploading...";
    uploadBar.style.width = "10%";

    try {
      await api.upload("/knowledge/upload", fd, (p) => {
        uploadBar.style.width = `${p}%`;
      });
      uploadStatus.textContent = "Done. Indexing complete.";
      toast("File ingested.", "ok");
      fileInput.value = "";
      fileTitle.value = "";
      await loadDocs();
    } catch (e) {
      uploadStatus.textContent = "Failed.";
      uploadBar.style.width = "0%";
      toast("Upload failed.", "err", String(e.message || e));
    }
  });

  btnIngestText.addEventListener("click", async () => {
    const title = textTitle.value.trim() || "Untitled text";
    const content = textContent.value.trim();
    if (!content) return toast("Text content is empty.", "warn");

    const ok = confirm(`Ingest text "${title}"?`);
    if (!ok) return;

    textStatus.textContent = "Ingesting...";
    try {
      await api.post("/knowledge/text", { title, content });
      textStatus.textContent = "Done.";
      toast("Text ingested.", "ok");
      textTitle.value = "";
      textContent.value = "";
      await loadDocs();
    } catch (e) {
      textStatus.textContent = "Failed.";
      toast("Ingest text failed.", "err", String(e.message || e));
    }
  });
}

function escapeHtml(s) {
  return String(s ?? "").replace(/[&<>"']/g, (m) => ({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"
  }[m]));
}
