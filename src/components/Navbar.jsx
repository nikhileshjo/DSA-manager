import React from 'react';
import { BrainCircuit, CalendarCheck, Library, BarChart3, Settings, Plus } from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, onOpenAddProblem, onOpenSettings, stats }) {
  const capacity = stats?.overview?.dailyCapacity || 5;

  return (
    <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4 lg:px-8 py-3.5 shadow-xl">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
        {/* App Brand */}
        <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('practice')}>
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <BrainCircuit className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold font-heading bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-100 to-indigo-200">
              DSA Manager
            </h1>
            <p className="text-xs text-slate-400 font-medium">SRS & Practice Tracker</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center bg-slate-950/80 p-1.5 rounded-xl border border-slate-800/80">
          <button
            onClick={() => setActiveTab('practice')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              activeTab === 'practice'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
            }`}
          >
            <CalendarCheck className="h-4 w-4" />
            <span>Today's Practice</span>
          </button>

          <button
            onClick={() => setActiveTab('problems')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              activeTab === 'problems'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
            }`}
          >
            <Library className="h-4 w-4" />
            <span>Problems Library</span>
          </button>

          <button
            onClick={() => setActiveTab('stats')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              activeTab === 'stats'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
            }`}
          >
            <BarChart3 className="h-4 w-4" />
            <span>Analytics</span>
          </button>
        </nav>

        {/* Quick Actions */}
        <div className="flex items-center space-x-3">
          <button
            onClick={onOpenSettings}
            title="Daily Capacity Settings"
            className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/60 text-slate-300 hover:text-white hover:bg-slate-700 transition-all flex items-center space-x-2"
          >
            <Settings className="h-4 w-4" />
            <span className="text-xs font-semibold text-slate-300 px-1.5 py-0.5 rounded bg-slate-900 border border-slate-700">
              Capacity: {capacity}/day
            </span>
          </button>

          <button
            onClick={onOpenAddProblem}
            className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 text-white font-semibold text-sm shadow-md shadow-emerald-500/20 hover:brightness-110 active:scale-95 transition-all"
          >
            <Plus className="h-4 w-4" />
            <span>Add Problem</span>
          </button>
        </div>
      </div>
    </header>
  );
}
