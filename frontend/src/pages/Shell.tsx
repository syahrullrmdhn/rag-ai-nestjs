import React from "react";
import { NavLink, Outlet, useNavigate, useLocation } from "react-router-dom";
import { Button } from "../components/ui"; // Asumsi cx ada di utils atau bisa pakai template literal
import { clearToken } from "../lib/auth";
import { apiFetch } from "../lib/api";
import { 
  LayoutDashboard, 
  Library, 
  MessageSquare, 
  Settings, 
  Send, 
  LogOut, 
  ChevronLeft, 
  ChevronRight,
  Command
} from "lucide-react";

// Helper untuk conditional class
const cx = (...classes: (string | undefined | false | null)[]) => classes.filter(Boolean).join(" ");

const NAV = [
  { to: "/app", label: "Overview", icon: LayoutDashboard },
  { to: "/app/knowledge", label: "Knowledge Base", icon: Library },
  { to: "/app/chat", label: "Chat Assistant", icon: MessageSquare },
  { to: "/app/telegram", label: "Telegram Bot", icon: Send },
  { to: "/app/settings", label: "Configuration", icon: Settings },
];

export default function Shell() {
  const [collapsed, setCollapsed] = React.useState(false);
  const nav = useNavigate();
  const location = useLocation();

  async function logout() {
    try { await apiFetch("/auth/logout", { method: "POST" }); } catch {}
    clearToken();
    nav("/login", { replace: true });
  }

  // Get current page title for header
  const currentTitle = NAV.find(n => n.to === location.pathname)?.label || "Dashboard";

  return (
    <div className="flex h-screen w-full bg-slate-50 overflow-hidden text-slate-900 font-sans">
      {/* SIDEBAR */}
      <aside 
        className={cx(
          "flex flex-col border-r border-slate-200 bg-white transition-all duration-300 ease-in-out relative z-20",
          collapsed ? "w-[72px]" : "w-64"
        )}
      >
        {/* Brand */}
        <div className="h-16 flex items-center px-4 border-b border-slate-100">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="min-w-[40px] h-10 bg-emerald-600 rounded-lg flex items-center justify-center text-white shadow-sm shadow-emerald-200">
              <Command size={20} />
            </div>
            <div className={cx("transition-opacity duration-200", collapsed ? "opacity-0 w-0" : "opacity-100")}>
              <div className="font-bold text-slate-900 leading-none">RAG Platform</div>
              <div className="text-[10px] uppercase tracking-wider font-semibold text-emerald-600 mt-1">Dev Environment</div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/app"}
              className={({ isActive }) =>
                cx(
                  "flex items-center gap-3 px-3 py-2.5 rounded-md transition-all duration-200 group",
                  isActive 
                    ? "bg-emerald-50 text-emerald-700 font-medium" 
                    : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                )
              }
            >
              <item.icon size={20} className={cx("shrink-0", collapsed && "mx-auto")} />
              <span className={cx("whitespace-nowrap transition-all", collapsed ? "opacity-0 w-0 hidden" : "opacity-100")}>
                {item.label}
              </span>
            </NavLink>
          ))}
        </div>

        {/* Footer / User */}
        <div className="p-3 border-t border-slate-100">
           <button 
            onClick={logout}
            className={cx(
              "flex items-center gap-3 w-full px-3 py-2 rounded-md text-slate-500 hover:text-red-600 hover:bg-red-50 transition-colors",
              collapsed && "justify-center"
            )}
            title="Sign Out"
          >
            <LogOut size={20} />
            <span className={cx(collapsed ? "hidden" : "block")}>Sign Out</span>
          </button>
        </div>

        {/* Collapse Toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-20 bg-white border border-slate-200 rounded-full p-1 shadow-sm hover:bg-slate-50 text-slate-400 hover:text-slate-600 z-50"
        >
          {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>
      </aside>

      {/* MAIN CONTENT Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <header className="h-16 border-b border-slate-200 bg-white px-8 flex items-center justify-between shrink-0">
          <h1 className="text-xl font-semibold text-slate-800">{currentTitle}</h1>
          <div className="text-sm text-slate-500">
             admin@local
          </div>
        </header>

        {/* Scrollable Page Content */}
        <div className="flex-1 overflow-y-auto p-8">
          <div className="max-w-5xl mx-auto">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
}
