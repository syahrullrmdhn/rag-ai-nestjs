import React from "react";
import { Link } from "react-router-dom"; // Pastikan import Link
import { 
  Library, 
  MessageSquare, 
  Settings, 
  Activity, 
  CheckCircle2, 
  ArrowRight,
  Database,
  ShieldCheck
} from "lucide-react";

export default function OverviewPage() {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Hero / Welcome Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-slate-500 mt-1">Overview of your RAG pipeline and system status.</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100">
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
          System Operational
        </div>
      </div>

      {/* Quick Stats / Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: Knowledge */}
        <Link to="/app/knowledge" className="group block p-6 bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-emerald-200 transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-lg group-hover:bg-blue-100 transition-colors">
              <Library size={24} />
            </div>
            <ArrowRight size={18} className="text-slate-300 group-hover:text-blue-500 transition-colors" />
          </div>
          <h3 className="font-semibold text-slate-900">Knowledge Base</h3>
          <p className="text-sm text-slate-500 mt-1">Manage documents and text ingestion.</p>
        </Link>

        {/* Card 2: Chat */}
        <Link to="/app/chat" className="group block p-6 bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-emerald-200 transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg group-hover:bg-emerald-100 transition-colors">
              <MessageSquare size={24} />
            </div>
            <ArrowRight size={18} className="text-slate-300 group-hover:text-emerald-500 transition-colors" />
          </div>
          <h3 className="font-semibold text-slate-900">Chat Assistant</h3>
          <p className="text-sm text-slate-500 mt-1">Test retrieval and generation capabilities.</p>
        </Link>

        {/* Card 3: Settings */}
        <Link to="/app/settings" className="group block p-6 bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-emerald-200 transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-slate-100 text-slate-600 rounded-lg group-hover:bg-slate-200 transition-colors">
              <Settings size={24} />
            </div>
            <ArrowRight size={18} className="text-slate-300 group-hover:text-slate-600 transition-colors" />
          </div>
          <h3 className="font-semibold text-slate-900">Configuration</h3>
          <p className="text-sm text-slate-500 mt-1">API keys, model selection, and integration.</p>
        </Link>
      </div>

      {/* System Status Panel */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2">
          <Activity size={18} className="text-slate-400" />
          <h3 className="font-semibold text-slate-800">System Health & Pipeline</h3>
        </div>
        
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* List Kiri */}
          <div className="space-y-4">
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Services</h4>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Database size={16} className="text-slate-400" />
                <span className="text-sm text-slate-700">Vector Database</span>
              </div>
              <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                <CheckCircle2 size={12} /> Connected
              </span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <ShieldCheck size={16} className="text-slate-400" />
                <span className="text-sm text-slate-700">Auth Service</span>
              </div>
              <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                <CheckCircle2 size={12} /> Active
              </span>
            </div>
          </div>

          {/* List Kanan - Info Teknis */}
          <div className="space-y-4">
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Processing Note</h4>
            <div className="bg-slate-50 rounded-lg p-3 text-sm text-slate-600 leading-relaxed border border-slate-100">
              <p>
                Document ingestion is handled asynchronously. Large PDF files may take a moment to appear in the search index depending on the queue depth.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
