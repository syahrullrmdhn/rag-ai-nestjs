import React from "react";
import { apiFetch } from "../lib/api";
import { Button, Card, CardBody, CardHeader, Input } from "../components/ui";

type Settings = {
  id: number;
  openaiApiKey: string | null;
  chatModel: string | null;
  embeddingModel: string | null;
  telegramBotToken: string | null;
  telegramBotUsername: string | null;
};

function maskSecret(v: string | null) {
  if (!v) return "";
  // keep prefix hint, hide middle
  if (v.length <= 10) return "••••••••";
  return `${v.slice(0, 6)}…${v.slice(-4)}`;
}

export default function SettingsPage() {
  const [data, setData] = React.useState<Settings | null>(null);
  const [form, setForm] = React.useState({
    openaiApiKey: "",
    chatModel: "gpt-4.1-mini",
    embeddingModel: "text-embedding-3-large",
    telegramBotToken: "",
    telegramBotUsername: "",
  });
  const [loading, setLoading] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [msg, setMsg] = React.useState<string | null>(null);
  const [err, setErr] = React.useState<string | null>(null);

  async function load() {
    setLoading(true);
    setErr(null);
    setMsg(null);
    try {
      const s = await apiFetch<Settings>("/settings", { method: "GET" });
      setData(s);
      setForm({
        openaiApiKey: maskSecret(s.openaiApiKey),
        chatModel: s.chatModel || "gpt-4.1-mini",
        embeddingModel: s.embeddingModel || "text-embedding-3-large",
        telegramBotToken: maskSecret(s.telegramBotToken),
        telegramBotUsername: s.telegramBotUsername || "",
      });
    } catch (e: any) {
      setErr(e?.message || "Failed to load settings");
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => { load(); }, []);

  async function save() {
    setSaving(true);
    setErr(null);
    setMsg(null);
    try {
      // send masked values too — backend should ignore masked placeholder (kamu sudah mulai benerin)
      const payload = {
        openaiApiKey: form.openaiApiKey,
        chatModel: form.chatModel,
        embeddingModel: form.embeddingModel,
        telegramBotToken: form.telegramBotToken,
        telegramBotUsername: form.telegramBotUsername,
      };
      const s = await apiFetch<Settings>("/settings", { method: "PUT", body: JSON.stringify(payload) });
      setData(s);
      setForm((prev) => ({
        ...prev,
        openaiApiKey: maskSecret(s.openaiApiKey),
        telegramBotToken: maskSecret(s.telegramBotToken),
      }));
      setMsg("Saved.");
    } catch (e: any) {
      setErr(e?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader title="Settings" subtitle="Configure models and integrations." />
        <CardBody className="space-y-4">
          {loading ? <div className="text-sm text-black/60">Loading…</div> : null}
          {err ? <div className="text-sm text-red-600">{err}</div> : null}
          {msg ? <div className="text-sm text-emerald-700">{msg}</div> : null}

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <Input
              label="OpenAI API Key"
              value={form.openaiApiKey}
              onChange={(e) => setForm((p) => ({ ...p, openaiApiKey: e.target.value }))}
              placeholder="sk-…"
              hint="Masked in UI. Replace to update."
            />
            <Input
              label="Chat Model"
              value={form.chatModel}
              onChange={(e) => setForm((p) => ({ ...p, chatModel: e.target.value }))}
              placeholder="gpt-4.1-mini"
            />
            <Input
              label="Embedding Model"
              value={form.embeddingModel}
              onChange={(e) => setForm((p) => ({ ...p, embeddingModel: e.target.value }))}
              placeholder="text-embedding-3-large"
            />
            <Input
              label="Telegram Bot Token"
              value={form.telegramBotToken}
              onChange={(e) => setForm((p) => ({ ...p, telegramBotToken: e.target.value }))}
              placeholder="123:AA…"
              hint="Masked in UI. Replace to update."
            />
            <Input
              label="Telegram Bot Username"
              value={form.telegramBotUsername}
              onChange={(e) => setForm((p) => ({ ...p, telegramBotUsername: e.target.value }))}
              placeholder="your_bot"
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={load}>Reload</Button>
            <Button onClick={save} disabled={saving}>{saving ? "Saving…" : "Save"}</Button>
          </div>

          <div className="text-xs text-black/50">
            Note: secrets displayed as masked placeholders. Your backend must ignore masked values on update.
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
