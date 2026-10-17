import React from 'react';
import { BarChart3, BrainCircuit, Target, AlertTriangle, Award, CheckCircle2, RefreshCw, Layers, ArrowUpRight, TrendingUp } from 'lucide-react';

export default function StatsView({ stats, onRefresh }) {
  if (!stats) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-3">
        <div className="animate-spin rounded-full h-9 w-9 border-2 border-indigo-500/30 border-t-indigo-500"></div>
        <p className="text-xs font-medium text-slate-400">Loading performance analytics...</p>
      </div>
    );
  }

  const { overview, solveRates, generalizationInsight, tagLevelStats = [], weakTags = [], strongTags = [], repeatedlyFailedProblems = [] } = stats;

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mac-glass rounded-2xl p-6 border border-white/10 shadow-2xl relative">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[11px] uppercase tracking-wider font-bold text-emerald-400">Analytics Dashboard</span>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                Retention vs Generalization
              </span>
            </div>
            <h2 className="text-2xl font-bold font-heading text-white mt-1">Performance & Generalization</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Compare retention on familiar SRS reviews against real generalization on fresh and external problems
            </p>
          </div>

          <button
            onClick={onRefresh}
            className="mac-btn-secondary px-3.5 py-2 text-xs font-semibold rounded-xl flex items-center space-x-2"
          >
            <RefreshCw className="h-3.5 w-3.5 text-slate-300" />
            <span>Refresh Analytics</span>
          </button>
        </div>
      </div>

      {/* Generalization Insight Alert Banner */}
      {generalizationInsight && (
        <div className="glass-card rounded-2xl p-5 border border-amber-500/30 bg-amber-950/20 flex items-start space-x-4 shadow-lg">
          <AlertTriangle className="h-5 w-5 text-amber-400 flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-amber-300">Generalization vs Retention Notice</h4>
            <p className="text-xs text-slate-200 leading-relaxed">{generalizationInsight}</p>
          </div>
        </div>
      )}

      {/* Retention vs Generalization 3 Main Rate Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Review Solve Rate */}
        <div className="glass-card glass-card-hover rounded-2xl p-6 border border-indigo-500/20 space-y-3 relative overflow-hidden">
          <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-indigo-400">
            <span>Review Solve Rate</span>
            <RefreshCw className="h-4 w-4 text-indigo-400" />
          </div>
          <div className="text-4xl font-extrabold font-heading text-white flex items-baseline space-x-1">
            <span>{solveRates?.reviewSolveRate || 0}</span>
            <span className="text-xl text-indigo-400 font-semibold">%</span>
          </div>

          {/* Visual Mini Progress Bar */}
          <div className="w-full h-1.5 bg-black/40 rounded-full overflow-hidden border border-white/5">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-violet-400 rounded-full"
              style={{ width: `${Math.min(100, solveRates?.reviewSolveRate || 0)}%` }}
            />
          </div>

          <p className="text-xs text-slate-400 leading-relaxed">
            Retention on familiar database problems ({solveRates?.reviewStats?.solved || 0}/{solveRates?.reviewStats?.total || 0} solved)
          </p>
        </div>

        {/* Fresh Solve Rate */}
        <div className="glass-card glass-card-hover rounded-2xl p-6 border border-emerald-500/20 space-y-3 relative overflow-hidden">
          <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-emerald-400">
            <span>Fresh Solve Rate</span>
            <BrainCircuit className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="text-4xl font-extrabold font-heading text-white flex items-baseline space-x-1">
            <span>{solveRates?.freshSolveRate || 0}</span>
            <span className="text-xl text-emerald-400 font-semibold">%</span>
          </div>

          {/* Visual Mini Progress Bar */}
          <div className="w-full h-1.5 bg-black/40 rounded-full overflow-hidden border border-white/5">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full"
              style={{ width: `${Math.min(100, solveRates?.freshSolveRate || 0)}%` }}
            />
          </div>

          <p className="text-xs text-slate-400 leading-relaxed">
            Generalization on unseen database problems ({solveRates?.freshStats?.solved || 0}/{solveRates?.freshStats?.total || 0} solved)
          </p>
        </div>

        {/* External Solve Rate */}
        <div className="glass-card glass-card-hover rounded-2xl p-6 border border-amber-500/20 space-y-3 relative overflow-hidden">
          <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-amber-400">
            <span>External Solve Rate</span>
            <Target className="h-4 w-4 text-amber-400" />
          </div>
          <div className="text-4xl font-extrabold font-heading text-white flex items-baseline space-x-1">
            <span>{solveRates?.externalSolveRate || 0}</span>
            <span className="text-xl text-amber-400 font-semibold">%</span>
          </div>

          {/* Visual Mini Progress Bar */}
          <div className="w-full h-1.5 bg-black/40 rounded-full overflow-hidden border border-white/5">
            <div
              className="h-full bg-gradient-to-r from-amber-500 to-orange-400 rounded-full"
              style={{ width: `${Math.min(100, solveRates?.externalSolveRate || 0)}%` }}
            />
          </div>

          <p className="text-xs text-slate-400 leading-relaxed">
            Generalization on manual external slots ({solveRates?.externalStats?.solved || 0}/{solveRates?.externalStats?.total || 0} solved)
          </p>
        </div>
      </div>

      {/* Overview Stat Counters Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-card rounded-2xl p-4 border border-white/10">
          <div className="text-[11px] font-bold uppercase text-slate-400">Total Problems</div>
          <div className="text-2xl font-bold font-heading text-white mt-1">{overview?.totalProblems || 0}</div>
        </div>

        <div className="glass-card rounded-2xl p-4 border border-white/10">
          <div className="text-[11px] font-bold uppercase text-slate-400">Attempted</div>
          <div className="text-2xl font-bold font-heading text-indigo-400 mt-1">{overview?.problemsAttempted || 0}</div>
        </div>

        <div className="glass-card rounded-2xl p-4 border border-white/10">
          <div className="text-[11px] font-bold uppercase text-slate-400">Reviews Done</div>
          <div className="text-2xl font-bold font-heading text-emerald-400 mt-1">{overview?.reviewsCompleted || 0}</div>
        </div>

        <div className="glass-card rounded-2xl p-4 border border-white/10">
          <div className="text-[11px] font-bold uppercase text-slate-400">Due Reviews</div>
          <div className="text-2xl font-bold font-heading text-rose-400 mt-1">{overview?.dueReviewsCount || 0}</div>
        </div>
      </div>

      {/* Weak & Strong Tags Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Weak Tags */}
        <div className="glass-card rounded-2xl p-6 border border-white/10 space-y-4">
          <div className="flex items-center space-x-2 text-rose-400">
            <AlertTriangle className="h-5 w-5" />
            <h3 className="text-lg font-bold font-heading text-white">Weak Topics / Need Practice</h3>
          </div>
          {weakTags.length === 0 ? (
            <p className="text-xs text-slate-400 italic">No weak topics logged yet.</p>
          ) : (
            <div className="space-y-2">
              {weakTags.map((t) => (
                <div key={t.tagId} className="flex items-center justify-between p-3 rounded-xl bg-black/30 border border-white/10 text-xs">
                  <span className="font-bold text-slate-200">{t.tagName}</span>
                  <div className="flex items-center space-x-3">
                    <span className="text-slate-400">Fresh: {t.freshRate !== null ? `${t.freshRate}%` : 'N/A'}</span>
                    <span className="text-rose-400 font-bold font-mono">Overall: {t.overallRate}%</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Strong Tags */}
        <div className="glass-card rounded-2xl p-6 border border-white/10 space-y-4">
          <div className="flex items-center space-x-2 text-emerald-400">
            <Award className="h-5 w-5" />
            <h3 className="text-lg font-bold font-heading text-white">Strong Topics / High Recall</h3>
          </div>
          {strongTags.length === 0 ? (
            <p className="text-xs text-slate-400 italic">No strong topics logged yet.</p>
          ) : (
            <div className="space-y-2">
              {strongTags.map((t) => (
                <div key={t.tagId} className="flex items-center justify-between p-3 rounded-xl bg-black/30 border border-white/10 text-xs">
                  <span className="font-bold text-slate-200">{t.tagName}</span>
                  <div className="flex items-center space-x-3">
                    <span className="text-slate-400">Fresh: {t.freshRate !== null ? `${t.freshRate}%` : 'N/A'}</span>
                    <span className="text-emerald-400 font-bold font-mono">Overall: {t.overallRate}%</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Tag Performance Table */}
      <div className="mac-glass rounded-2xl p-6 border border-white/10 space-y-4 shadow-xl">
        <h3 className="text-lg font-bold font-heading text-white">Tag-Level Performance Breakdown</h3>
        {tagLevelStats.length === 0 ? (
          <p className="text-xs text-slate-400 italic">No tag-level statistics recorded yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-white/10 text-slate-400 font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4">Tag / Topic</th>
                  <th className="py-3 px-4">Fresh Solve Rate</th>
                  <th className="py-3 px-4">Review Solve Rate</th>
                  <th className="py-3 px-4">Overall Solve Rate</th>
                  <th className="py-3 px-4 text-right">Total Attempts</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {tagLevelStats.map((tag) => (
                  <tr key={tag.tagId} className="hover:bg-white/5 transition-colors">
                    <td className="py-3 px-4 font-bold text-slate-200">{tag.tagName}</td>
                    <td className="py-3 px-4 font-mono font-semibold text-emerald-400">
                      {tag.freshRate !== null ? `${tag.freshRate}% (${tag.freshSolved}/${tag.freshTotal})` : '—'}
                    </td>
                    <td className="py-3 px-4 font-mono font-semibold text-indigo-400">
                      {tag.reviewRate !== null ? `${tag.reviewRate}% (${tag.reviewSolved}/${tag.reviewTotal})` : '—'}
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-white">
                      {tag.overallRate}%
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-slate-400">{tag.overallTotal}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Repeatedly Failed Problems */}
      {repeatedlyFailedProblems.length > 0 && (
        <div className="glass-card rounded-2xl p-6 border border-rose-500/25 bg-rose-950/20 space-y-4">
          <h3 className="text-lg font-bold font-heading text-rose-300">Repeatedly Failed Problems</h3>
          <div className="grid gap-2">
            {repeatedlyFailedProblems.map((prob) => (
              <div key={prob.id} className="flex items-center justify-between p-3 rounded-xl bg-black/30 border border-white/10 text-xs">
                <span className="font-bold text-slate-200">{prob.title}</span>
                <span className="text-rose-400 font-bold px-2 py-0.5 rounded bg-rose-950 border border-rose-500/30">
                  {prob.fail_count} failed attempts
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
