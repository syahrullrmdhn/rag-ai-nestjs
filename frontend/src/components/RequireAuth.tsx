import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { apiFetch } from "../lib/api";
import { clearToken, getToken } from "../lib/auth";

export default function RequireAuth({ children }: { children: React.ReactNode }) {
  const loc = useLocation();
  const [ready, setReady] = React.useState(false);
  const [ok, setOk] = React.useState(false);

  React.useEffect(() => {
    let alive = true;
    (async () => {
      const token = getToken();
      if (!token) {
        if (!alive) return;
        setOk(false);
        setReady(true);
        return;
      }

      try {
        await apiFetch("/auth/me", { method: "GET" });
        if (!alive) return;
        setOk(true);
        setReady(true);
      } catch {
        clearToken();
        if (!alive) return;
        setOk(false);
        setReady(true);
      }
    })();
    return () => {
      alive = false;
    };
  }, [loc.pathname]);

  if (!ready) {
    return (
      <div className="min-h-screen grid place-items-center bg-[#f4fbf6]">
        <div className="rounded-2xl bg-white shadow-sm border border-black/5 px-6 py-4">
          <div className="text-sm text-black/70">Loading session…</div>
        </div>
      </div>
    );
  }

  if (!ok) return <Navigate to="/login" replace state={{ from: loc.pathname }} />;
  return <>{children}</>;
}
