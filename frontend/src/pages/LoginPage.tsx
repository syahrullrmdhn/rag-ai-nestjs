import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button, Card, CardBody, CardHeader, Input } from "../components/ui";
import { apiFetch } from "../lib/api";
import { setToken } from "../lib/auth";

export default function LoginPage() {
  const nav = useNavigate();
  const loc = useLocation() as any;
  const [email, setEmail] = React.useState("admin@local");
  const [password, setPassword] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [err, setErr] = React.useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    try {
      const res = await apiFetch<{ accessToken: string }>("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
        auth: false,
      });
      setToken(res.accessToken);
      const to = loc?.state?.from || "/app";
      nav(to, { replace: true });
    } catch (e: any) {
      setErr(e?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#f4fbf6] grid place-items-center p-4">
      <div className="w-full max-w-md">
        <div className="mb-4">
          <div className="text-xs font-semibold tracking-wide text-emerald-800">RAG AI DEV</div>
          <div className="text-3xl font-semibold text-black">Welcome back</div>
          <div className="mt-1 text-sm text-black/60">Sign in to manage knowledge and chat workflows.</div>
        </div>

        <Card>
          <CardHeader title="Login" subtitle="Use your account credentials." />
          <CardBody>
            <form className="space-y-3" onSubmit={onSubmit}>
              <Input
                label="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@local"
                autoComplete="username"
              />
              <Input
                label="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                type="password"
                autoComplete="current-password"
              />
              {err ? <div className="text-sm text-red-600">{err}</div> : null}
              <Button className="w-full" disabled={loading}>
                {loading ? "Signing in…" : "Login"}
              </Button>
              <div className="text-xs text-black/50">
                Tip: token disimpan lokal. Kalau 401, sistem auto logout.
              </div>
            </form>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
