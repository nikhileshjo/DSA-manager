import React from 'react';
import { BarChart3, BrainCircuit, Target, AlertTriangle, Award, CheckCircle2, RefreshCw, Layers } from 'lucide-react';

export default function StatsView({ stats, onRefresh }) {
  if (!stats) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  const { overview, solveRates, generalizationInsight, tagLevelStats = [], weakTags = [], strongTags = [], repeatedlyFailedProblems = [] } = stats;

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold font-heading text-white">Performance & Generalization Analytics</h2>
          <p className="text-xs text-slate-400">Track retention on past reviews versus generalization on fresh and external problems</p>
        </div>

        <button
          onClick={onRefresh}
          className="flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white text-xs font-semibold"
        >
          <RefreshCw className="h-4 w-4" />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* Generalization Insight Alert Banner */}
      {generalizationInsight && (
        <div className="glass-card rounded-2xl p-5 border border-amber-500/30 bg-amber-950/20 flex items-start space-x-4">
          <AlertTriangle className="h-6 w-6 text-amber-400 flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-amber-300">Generalization vs Retention Notice</h4>
            <p className="text-xs text-slate-200 leading-relaxed">{generalizationInsight}</p>
          </div>
        </div>
      )}

      {/* Retention vs Generalization Key Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Review Solve Rate */}
        <div className="glass-card rounded-2xl p-6 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-indigo-400">
            <span>Review Solve Rate</span>
            <RefreshCw className="h-4 w-4 text-indigo-400" />
          </div>
          <div className="text-4xl font-extrabold font-heading text-white">
            {solveRates?.reviewSolveRate || 0}%
          </div>
          <p className="text-xs text-slate-400">
            Retention on familiar database problems ({solveRates?.reviewStats?.solved || 0}/{solveRates?.reviewStats?.total || 0} solved)
          </p>
        </div>

        {/* Fresh Solve Rate */}
        <div className="glass-card rounded-2xl p-6 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-emerald-400">
            <span>Fresh Solve Rate</span>
            <BrainCircuit className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="text-4xl font-extrabold font-heading text-white">
            {solveRates?.freshSolveRate || 0}%
          </div>
          <p className="text-xs text-slate-400">
            Generalization on unseen database problems ({solveRates?.freshStats?.solved || 0}/{solveRates?.freshStats?.total || 0} solved)
          </p>
        </div>

        {/* External Solve Rate */}
        <div className="glass-card rounded-2xl p-6 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-amber-400">
            <span>External Solve Rate</span>
            <Target className="h-4 w-4 text-amber-400" />
          </div>
          <div className="text-4xl font-extrabold font-heading text-white">
            {solveRates?.externalSolveRate || 0}%
          </div>
          <p className="text-xs text-slate-400">
            Performance on manual external slots ({solveRates?.externalStats?.solved || 0}/{solveRates?.externalStats?.total || 0} solved)
          </p>
        </div>
      </div>

      {/* Overview Stat Counters Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-card rounded-xl p-4 border border-slate-800">
          <div className="text-[11px] font-bold uppercase text-slate-400">Total Problems</div>
          <div className="text-2xl font-bold text-white mt-1">{overview?.totalProblems || 0}</div>
        </div>

        <div className="glass-card rounded-xl p-4 border border-slate-800">
          <div className="text-[11px] font-bold uppercase text-slate-400">Problems Attempted</div>
          <div className="text-2xl font-bold text-indigo-400 mt-1">{overview?.problemsAttempted || 0}</div>
        </div>

        <div className="glass-card rounded-xl p-4 border border-slate-800">
          <div className="text-[11px] font-bold uppercase text-slate-400">Reviews Completed</div>
          <div className="text-2xl font-bold text-emerald-400 mt-1">{overview?.reviewsCompleted || 0}</div>
        </div>

        <div className="glass-card rounded-xl p-4 border border-slate-800">
          <div className="text-[11px] font-bold uppercase text-slate-400">Due Reviews</div>
          <div className="text-2xl font-bold text-rose-400 mt-1">{overview?.dueReviewsCount || 0}</div>
        </div>
      </div>

      {/* Weak & Strong Tags Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Weak Tags */}
        <div className="glass-card rounded-2xl p-6 border border-slate-800 space-y-4">
          <div className="flex items-center space-x-2 text-rose-400">
            <AlertTriangle className="h-5 w-5" />
            <h3 className="text-lg font-bold font-heading text-white">Weak Topics / Tags</h3>
          </div>
          {weakTags.length === 0 ? (
            <p className="text-xs text-slate-400 italic">No weak topics logged yet.</p>
          ) : (
            <div className="space-y-2">
              {weakTags.map((t) => (
                <div key={t.tagId} className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs">
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
        <div className="glass-card rounded-2xl p-6 border border-slate-800 space-y-4">
          <div className="flex items-center space-x-2 text-emerald-400">
            <Award className="h-5 w-5" />
            <h3 className="text-lg font-bold font-heading text-white">Strong Topics / Tags</h3>
          </div>
          {strongTags.length === 0 ? (
            <p className="text-xs text-slate-400 italic">No strong topics logged yet.</p>
          ) : (
            <div className="space-y-2">
              {strongTags.map((t) => (
                <div key={t.tagId} className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs">
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
      <div className="glass-card rounded-2xl p-6 border border-slate-800 space-y-4">
        <h3 className="text-lg font-bold font-heading text-white">Tag-Level Performance Breakdown</h3>
        {tagLevelStats.length === 0 ? (
          <p className="text-xs text-slate-400 italic">No tag-level statistics recorded yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider">
                  <th className="py-3 px-4">Tag / Topic</th>
                  <th className="py-3 px-4">Fresh Solve Rate</th>
                  <th className="py-3 px-4">Review Solve Rate</th>
                  <th className="py-3 px-4">Overall Solve Rate</th>
                  <th className="py-3 px-4 text-right">Total Attempts</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {tagLevelStats.map((tag) => (
                  <tr key={tag.tagId} className="hover:bg-slate-900/50">
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
        <div className="glass-card rounded-2xl p-6 border border-rose-500/20 bg-rose-950/10 space-y-4">
          <h3 className="text-lg font-bold font-heading text-rose-300">Repeatedly Failed Problems</h3>
          <div className="grid gap-2">
            {repeatedlyFailedProblems.map((prob) => (
              <div key={prob.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs">
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
