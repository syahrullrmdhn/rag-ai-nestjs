import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button, Input } from "../components/ui"; // Pastikan path ini benar
import { apiFetch } from "../lib/api";
import { setToken } from "../lib/auth";
import { Command, ArrowRight, Loader2, Lock, Mail } from "lucide-react"; // Install lucide-react jika belum: npm i lucide-react

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
      setErr(e?.message || "Invalid credentials. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen w-full flex">
      {/* LEFT SIDE: Visual & Branding */}
      <div className="hidden lg:flex w-1/2 bg-emerald-950 relative overflow-hidden flex-col justify-between p-12 text-white">
        {/* Abstract Background Decoration */}
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-emerald-500 blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-[500px] h-[500px] rounded-full bg-emerald-400 blur-[100px]"></div>
        </div>

        {/* Logo / Brand */}
        <div className="relative z-10 flex items-center gap-2 font-medium tracking-tight text-lg">
          <div className="p-1.5 bg-white/10 rounded-md backdrop-blur-sm border border-white/10">
            <Command size={18} />
          </div>
          RAG AI Platform
        </div>

        {/* Quote / Value Prop */}
        <div className="relative z-10 max-w-md">
          <blockquote className="text-2xl font-medium leading-relaxed">
            "Orchestrate your knowledge base and chat workflows with precision."
          </blockquote>
          <div className="mt-4 text-emerald-400/80 text-sm">
            Internal Development Console v1.0
          </div>
        </div>
      </div>

      {/* RIGHT SIDE: Form */}
      <div className="flex-1 flex flex-col justify-center items-center p-8 bg-white text-slate-900">
        <div className="w-full max-w-sm space-y-8">
          
          {/* Header */}
          <div className="text-center lg:text-left">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Access your workspace
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              Enter your credentials to continue to the dashboard.
            </p>
          </div>

          <form className="space-y-5" onSubmit={onSubmit}>
            <div className="space-y-4">
              <div className="relative">
                 {/* Wrapper div untuk icon positioning jika komponen Input Anda support passing children/icons, 
                     jika tidak, hapus icon lucide ini atau sesuaikan stylingnya */}
                <Input
                  label="Email Address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  autoComplete="username"
                  // Pastikan Input component support className tambahan
                  className="pl-10" 
                />
              </div>
              
              <div className="relative">
                 <div className="flex items-center justify-between">
                    <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 mb-2 block">
                        Password
                    </label>
                    {/* Optional: Forgot Password Link */}
                    {/* <a href="#" className="text-xs text-emerald-600 hover:text-emerald-700 font-medium mb-2">Forgot?</a> */}
                 </div>
                <Input
                  label="" // Label handled manually above for custom layout if needed
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  type="password"
                  autoComplete="current-password"
                />
              </div>
            </div>

            {err && (
              <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-100 rounded-md flex items-center gap-2 animate-in fade-in slide-in-from-top-1">
                <span className="w-1 h-4 bg-red-600 rounded-full block"></span>
                {err}
              </div>
            )}

            <Button 
              className="w-full h-11 bg-emerald-600 hover:bg-emerald-700 text-white transition-all duration-200 flex items-center justify-center gap-2 shadow-sm hover:shadow-md" 
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Authenticating...
                </>
              ) : (
                <>
                  Sign In <ArrowRight className="w-4 h-4 opacity-50" />
                </>
              )}
            </Button>
          </form>

          <p className="px-8 text-center text-xs text-slate-400">
            By clicking continue, you agree to our internal <a href="#" className="underline underline-offset-4 hover:text-slate-900">Terms of Service</a>.
          </p>
        </div>
      </div>
    </div>
  );
}
