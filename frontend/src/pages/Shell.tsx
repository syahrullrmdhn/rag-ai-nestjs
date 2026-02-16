import React from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { Button, cx } from "../components/ui";
import { clearToken } from "../lib/auth";
import { apiFetch } from "../lib/api";

const NAV = [
  { to: "/app", label: "Overview", icon: "⌂" },
  { to: "/app/knowledge", label: "Knowledge", icon: "📚" },
  { to: "/app/chat", label: "Chat", icon: "✦" },
  { to: "/app/settings", label: "Settings", icon: "⚙" },
  { to: "/app/telegram", label: "Telegram", icon: "✈" },
];

export default function Shell() {
  const [collapsed, setCollapsed] = React.useState(false);
  const nav = useNavigate();

  async function logout() {
    try { await apiFetch("/auth/logout", { method: "POST" }); } catch {}
    clearToken();
    nav("/login", { replace: true });
  }

  return (
    <div className="min-h-screen bg-[#f4fbf6]">
      <div className="mx-auto max-w-[1200px] px-4 py-6">
        <div className="flex gap-4">
          {/* Sidebar */}
          <aside
            className={cx(
              "sticky top-6 h-[calc(100vh-3rem)] rounded-3xl bg-white/90 backdrop-blur border border-black/5 shadow-sm",
              collapsed ? "w-[72px]" : "w-[260px]",
            )}
          >
            <div className="p-4">
              <div className={cx("flex items-center justify-between gap-2", collapsed && "justify-center")}>
                <div className={cx("leading-tight", collapsed && "hidden")}>
                  <div className="text-xs font-semibold tracking-wide text-emerald-800">RAG AI DEV</div>
                  <div className="text-sm font-semibold text-black">Knowledge Suite</div>
                </div>
                <button
                  className="rounded-2xl px-3 py-2 text-black/60 hover:bg-black/5"
                  onClick={() => setCollapsed((v) => !v)}
                  title="Toggle sidebar"
                >
                  {collapsed ? "→" : "←"}
                </button>
              </div>

              <div className="mt-4 space-y-1">
                {NAV.map((it) => (
                  <NavLink
                    key={it.to}
                    to={it.to}
                    end={it.to === "/app"}
                    className={({ isActive }) =>
                      cx(
                        "flex items-center gap-3 rounded-2xl px-3 py-2 text-sm transition",
                        isActive ? "bg-emerald-700 text-white" : "text-black/70 hover:bg-black/5",
                        collapsed && "justify-center",
                      )
                    }
                  >
                    <span className="text-base">{it.icon}</span>
                    <span className={cx(collapsed && "hidden")}>{it.label}</span>
                  </NavLink>
                ))}
              </div>
            </div>

            <div className="absolute bottom-0 left-0 right-0 p-4">
              <div className={cx("text-xs text-black/50", collapsed && "hidden")}>Syahrul Ramadhan</div>
              <div className="mt-3">
                <Button variant="ghost" className={cx("w-full justify-start", collapsed && "justify-center")} onClick={logout}>
                  <span className="mr-3">{collapsed ? "" : "Logout"}</span>
                  <span>⎋</span>
                </Button>
              </div>
            </div>
          </aside>

          {/* Content */}
          <main className="flex-1">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <div className="text-sm text-black/50">RAG AI DEV</div>
                <div className="text-2xl font-semibold text-black">Dashboard</div>
              </div>
            </div>
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
