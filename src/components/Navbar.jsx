import React from 'react';
import { BrainCircuit, CalendarCheck, Library, BarChart3, Settings, Plus, Sparkles, Moon, Download } from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, onOpenAddProblem, onOpenSettings, onOpenBackup, stats, isMidnight, onToggleTheme }) {
  const capacity = stats?.overview?.dailyCapacity || 5;
  const dueCount = stats?.overview?.dueReviewsCount || 0;

  return (
    <header className="sticky top-0 z-40 mac-glass border-b border-white/10 px-4 lg:px-8 py-3 shadow-2xl">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
        
        {/* Left Section: macOS Traffic Lights + Brand */}
        <div className="flex items-center space-x-4">
          {/* Traffic Lights */}
          <div className="mac-traffic-lights pr-2 hidden sm:flex">
            <div className="mac-dot mac-dot-close" title="Close">
              <span>✕</span>
            </div>
            <div className="mac-dot mac-dot-minimize" title="Minimize">
              <span>−</span>
            </div>
            <div className="mac-dot mac-dot-maximize" title="Zoom">
              <span>⤢</span>
            </div>
          </div>

          <div className="h-4 w-px bg-white/10 hidden sm:block" />

          {/* App Brand */}
          <div
            className="flex items-center space-x-3 cursor-pointer group"
            onClick={() => setActiveTab('practice')}
          >
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-500 via-indigo-600 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/25 border border-white/20 group-hover:scale-105 transition-transform">
              <BrainCircuit className="h-5 w-5 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-base lg:text-lg font-bold font-heading text-white tracking-tight">
                  Spark Manager
                </h1>
                <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  SRS
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium">Practice & Retention</p>
            </div>
          </div>
        </div>

        {/* Center: macOS Segmented Navigation Pill */}
        <nav className="flex items-center bg-black/40 backdrop-blur-md p-1 rounded-xl border border-white/10 shadow-inner">
          <button
            onClick={() => setActiveTab('practice')}
            className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
              activeTab === 'practice'
                ? 'bg-white/20 text-white shadow-md border border-white/20 backdrop-blur-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
            }`}
          >
            <CalendarCheck className="h-3.5 w-3.5 text-indigo-400" />
            <span>Today's Practice</span>
            {dueCount > 0 && (
              <span className="ml-1 px-1.5 py-0.2 rounded-full bg-rose-500/80 text-[10px] font-bold text-white shadow-sm">
                {dueCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('problems')}
            className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
              activeTab === 'problems'
                ? 'bg-white/20 text-white shadow-md border border-white/20 backdrop-blur-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
            }`}
          >
            <Library className="h-3.5 w-3.5 text-sky-400" />
            <span>Problems</span>
          </button>

          <button
            onClick={() => setActiveTab('stats')}
            className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
              activeTab === 'stats'
                ? 'bg-white/20 text-white shadow-md border border-white/20 backdrop-blur-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
            }`}
          >
            <BarChart3 className="h-3.5 w-3.5 text-emerald-400" />
            <span>Analytics</span>
          </button>
        </nav>

        {/* Right Section: Easy-to-find Action Buttons */}
        <div className="flex items-center space-x-2.5">
          {/* Dark Mode Switcher */}
          <button
            onClick={onToggleTheme}
            title={isMidnight ? "Active: Midnight OLED Black. Click for macOS Graphite Dark." : "Active: macOS Graphite Dark. Click for Midnight OLED Black."}
            className="mac-btn-secondary py-2 px-3 rounded-xl flex items-center space-x-1.5 group"
          >
            <Moon className="h-3.5 w-3.5 text-indigo-400 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-semibold text-slate-200">
              {isMidnight ? 'Midnight OLED' : 'Dark Mode'}
            </span>
          </button>

          {/* Capacity Settings Pill */}
          <button
            onClick={onOpenSettings}
            title="Configure Daily Capacity"
            className="mac-btn-secondary py-2 px-3 rounded-xl flex items-center space-x-2 group"
          >
            <Settings className="h-3.5 w-3.5 text-slate-300 group-hover:rotate-45 transition-transform" />
            <span className="text-xs font-semibold text-slate-200">
              Capacity: <span className="text-indigo-400 font-bold">{capacity}</span>/d
            </span>
          </button>

          {/* Prominent Easy-to-Find Add Problem CTA */}
          <button
            onClick={onOpenAddProblem}
            className="mac-btn-emerald py-2 px-4 rounded-xl flex items-center space-x-2 font-bold text-xs shadow-lg"
          >
            <Plus className="h-4 w-4 stroke-[2.5]" />
            <span>Add Problem</span>
          </button>

          {/* Backup / Restore */}
          <button
            onClick={onOpenBackup}
            title="Export or import your database backup"
            className="mac-btn-secondary py-2 px-3 rounded-xl flex items-center space-x-1.5 group"
          >
            <Download className="h-3.5 w-3.5 text-indigo-400 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-semibold text-slate-200 hidden sm:inline">Backup</span>
          </button>
        </div>

      </div>
    </header>
  );
}
