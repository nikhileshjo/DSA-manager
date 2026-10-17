import React from 'react';
import { RotateCcw, Sparkles, ExternalLink, CheckCircle2, Eye, Tag as TagIcon, Clock, AlertCircle, ArrowUpRight, Award, Compass, Play } from 'lucide-react';

export default function PracticeView({
  practiceSession,
  completedMap,
  onAttemptProblem,
  onAttemptExternal,
  onViewProblemDetails,
  onRefresh,
  onOpenSettings,
}) {
  if (!practiceSession) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-3">
        <div className="animate-spin rounded-full h-9 w-9 border-2 border-indigo-500/30 border-t-indigo-500"></div>
        <p className="text-xs font-medium text-slate-400">Loading daily practice queue...</p>
      </div>
    );
  }

  const { capacity, reviewProblems = [], freshProblems = [], externalSlots = [], explanation } = practiceSession;

  const totalItems = reviewProblems.length + freshProblems.length + externalSlots.length;
  const completedCount = Object.keys(completedMap).length;
  const progressPercent = capacity > 0 ? Math.min(100, Math.round((completedCount / capacity) * 100)) : 0;

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Top Header & Daily Capacity macOS Widget Card */}
      <div className="mac-glass rounded-2xl p-6 border border-white/10 space-y-5 shadow-2xl relative overflow-hidden">
        {/* Subtle background glow effect */}
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[11px] uppercase tracking-wider font-bold text-indigo-400">Adaptive Queue</span>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                Spaced Repetition
              </span>
            </div>
            <h2 className="text-2xl font-bold font-heading text-white mt-1">Today's Practice Queue</h2>
          </div>

          {/* Action Buttons: Easy to find */}
          <div className="flex items-center space-x-2.5">
            <button
              onClick={onRefresh}
              className="mac-btn-secondary py-2 px-3.5 text-xs font-semibold rounded-xl flex items-center space-x-2"
              title="Refresh Queue"
            >
              <RotateCcw className="h-3.5 w-3.5 text-slate-300" />
              <span>Refresh Queue</span>
            </button>

            <button
              onClick={onOpenSettings}
              className="mac-btn-secondary py-2 px-3.5 text-xs font-semibold rounded-xl flex items-center space-x-2 text-indigo-300 border-indigo-500/30 hover:border-indigo-500/50"
            >
              <span>Capacity: {capacity}/day</span>
            </button>
          </div>
        </div>

        {/* Progress bar */}
        <div className="space-y-2 bg-black/25 p-4 rounded-xl border border-white/5">
          <div className="flex justify-between items-center text-xs font-semibold">
            <span className="text-slate-300">Daily Practice Progress</span>
            <span className="text-indigo-400 font-bold">{completedCount} of {capacity} items completed ({progressPercent}%)</span>
          </div>
          <div className="w-full h-3 bg-black/40 rounded-full overflow-hidden border border-white/10 p-0.5 shadow-inner">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-400 rounded-full transition-all duration-500 shadow-lg shadow-indigo-500/30"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Allocation Strategy Box */}
        {explanation && (
          <div className="flex items-start space-x-3 p-3.5 rounded-xl bg-indigo-950/40 border border-indigo-500/25 text-slate-300 text-xs leading-relaxed">
            <Sparkles className="h-4 w-4 text-indigo-400 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-indigo-300">Allocation Strategy: </span>
              {explanation}
            </div>
          </div>
        )}
      </div>

      {totalItems === 0 && (
        <div className="mac-glass rounded-2xl p-12 text-center space-y-4 border border-white/10 shadow-xl">
          <div className="h-14 w-14 rounded-2xl bg-indigo-500/15 text-indigo-400 flex items-center justify-center mx-auto border border-indigo-500/30 shadow-lg shadow-indigo-500/20">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <h3 className="text-xl font-bold text-white font-heading">Queue All Clear!</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
            You have no pending SRS reviews due today. Add new problems to your repository or practice an external problem to keep your streak going!
          </p>
        </div>
      )}

      {/* SECTION A: REVIEWS */}
      {reviewProblems.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-1">
            <div className="flex items-center space-x-2.5">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500"></span>
              </span>
              <h3 className="text-lg font-bold text-white font-heading">
                Due Reviews ({reviewProblems.length})
              </h3>
            </div>
            <span className="text-[11px] text-rose-300 font-semibold px-2.5 py-0.5 rounded-full bg-rose-500/15 border border-rose-500/30">
              Spaced Repetition
            </span>
          </div>

          <div className="grid gap-3.5">
            {reviewProblems.map((prob) => {
              const isDone = !!completedMap[prob.id];

              return (
                <div
                  key={`rev-${prob.id}`}
                  className={`glass-card glass-card-hover rounded-2xl p-5 border transition-all ${
                    isDone ? 'opacity-65 border-emerald-500/30 bg-emerald-950/15' : 'border-white/10'
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="space-y-2 max-w-2xl">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase ${
                          prob.difficulty === 'easy' ? 'badge-easy' : prob.difficulty === 'medium' ? 'badge-medium' : 'badge-hard'
                        }`}>
                          {prob.difficulty}
                        </span>
                        <span className="text-[11px] px-2.5 py-0.5 rounded-lg bg-black/40 text-rose-300 font-medium border border-rose-500/25">
                          Due Review (Interval: {prob.interval || 1}d)
                        </span>
                        {isDone && (
                          <span className="text-[11px] px-2.5 py-0.5 rounded-lg bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30 flex items-center space-x-1.5">
                            <CheckCircle2 className="h-3.5 w-3.5 inline text-emerald-400" />
                            <span>Completed Today</span>
                          </span>
                        )}
                      </div>

                      <h4
                        onClick={() => onViewProblemDetails(prob.id)}
                        className="text-base font-bold text-white hover:text-indigo-300 cursor-pointer transition-colors"
                      >
                        {prob.title}
                      </h4>

                      {/* Tags */}
                      {prob.tags && prob.tags.length > 0 && (
                        <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                          {prob.tags.map((t) => (
                            <span key={t.id} className="text-[11px] px-2 py-0.5 rounded-md bg-white/5 text-slate-300 border border-white/10 flex items-center space-x-1">
                              <TagIcon className="h-2.5 w-2.5 text-indigo-400" />
                              <span>{t.name}</span>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Highly visible action buttons */}
                    <div className="flex items-center space-x-2.5">
                      <button
                        onClick={() => onViewProblemDetails(prob.id)}
                        className="mac-btn-secondary px-3.5 py-2 text-xs font-semibold rounded-xl flex items-center space-x-1.5"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        <span>Details</span>
                      </button>
                      
                      <button
                        onClick={() => onAttemptProblem(prob, 'review')}
                        className={isDone ? "mac-btn-secondary px-4 py-2 text-xs font-bold" : "mac-btn-rose px-4 py-2 text-xs font-bold shadow-lg"}
                      >
                        <Play className="h-3.5 w-3.5 fill-current" />
                        <span>{isDone ? 'Re-log Attempt' : 'Record Attempt'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SECTION B: FRESH PROBLEMS */}
      {freshProblems.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-1">
            <div className="flex items-center space-x-2.5">
              <span className="h-2.5 w-2.5 rounded-full bg-indigo-500 shadow-sm shadow-indigo-500"></span>
              <h3 className="text-lg font-bold text-white font-heading">
                Fresh Problems ({freshProblems.length})
              </h3>
            </div>
            <span className="text-[11px] text-indigo-300 font-semibold px-2.5 py-0.5 rounded-full bg-indigo-500/15 border border-indigo-500/30">
              Weak Topic Prioritized
            </span>
          </div>

          <div className="grid gap-3.5">
            {freshProblems.map((prob) => {
              const isDone = !!completedMap[prob.id];

              return (
                <div
                  key={`fresh-${prob.id}`}
                  className={`glass-card glass-card-hover rounded-2xl p-5 border transition-all ${
                    isDone ? 'opacity-65 border-emerald-500/30 bg-emerald-950/15' : 'border-white/10'
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="space-y-2 max-w-2xl">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase ${
                          prob.difficulty === 'easy' ? 'badge-easy' : prob.difficulty === 'medium' ? 'badge-medium' : 'badge-hard'
                        }`}>
                          {prob.difficulty}
                        </span>
                        <span className="text-[11px] px-2.5 py-0.5 rounded-lg bg-black/40 text-indigo-300 font-medium border border-indigo-500/25">
                          Unattempted Fresh
                        </span>
                        {isDone && (
                          <span className="text-[11px] px-2.5 py-0.5 rounded-lg bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30 flex items-center space-x-1.5">
                            <CheckCircle2 className="h-3.5 w-3.5 inline text-emerald-400" />
                            <span>Completed Today</span>
                          </span>
                        )}
                      </div>

                      <h4
                        onClick={() => onViewProblemDetails(prob.id)}
                        className="text-base font-bold text-white hover:text-indigo-300 cursor-pointer transition-colors"
                      >
                        {prob.title}
                      </h4>

                      {/* Tags */}
                      {prob.tags && prob.tags.length > 0 && (
                        <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                          {prob.tags.map((t) => (
                            <span key={t.id} className="text-[11px] px-2 py-0.5 rounded-md bg-white/5 text-slate-300 border border-white/10 flex items-center space-x-1">
                              <TagIcon className="h-2.5 w-2.5 text-indigo-400" />
                              <span>{t.name}</span>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Highly visible action buttons */}
                    <div className="flex items-center space-x-2.5">
                      <button
                        onClick={() => onViewProblemDetails(prob.id)}
                        className="mac-btn-secondary px-3.5 py-2 text-xs font-semibold rounded-xl flex items-center space-x-1.5"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        <span>Details</span>
                      </button>
                      
                      <button
                        onClick={() => onAttemptProblem(prob, 'fresh')}
                        className={isDone ? "mac-btn-secondary px-4 py-2 text-xs font-bold" : "mac-btn-primary px-4 py-2 text-xs font-bold shadow-lg"}
                      >
                        <Play className="h-3.5 w-3.5 fill-current" />
                        <span>{isDone ? 'Re-log Attempt' : 'Record Attempt'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SECTION C: EXTERNAL SLOTS */}
      {externalSlots.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-1">
            <div className="flex items-center space-x-2.5">
              <span className="h-2.5 w-2.5 rounded-full bg-amber-500 shadow-sm shadow-amber-500"></span>
              <h3 className="text-lg font-bold text-white font-heading">
                External Practice Slots ({externalSlots.length})
              </h3>
            </div>
            <span className="text-[11px] text-amber-300 font-semibold px-2.5 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30">
              Generalization Test
            </span>
          </div>

          <div className="grid gap-3.5">
            {externalSlots.map((slot) => {
              const isDone = !!completedMap[slot.id];

              return (
                <div
                  key={slot.id}
                  className={`glass-card glass-card-hover rounded-2xl p-5 border transition-all ${
                    isDone ? 'opacity-65 border-emerald-500/30 bg-emerald-950/15' : 'border-amber-500/30 bg-amber-950/10'
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="space-y-2 max-w-2xl">
                      <div className="flex items-center space-x-2">
                        <span className="text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center space-x-1">
                          <Compass className="h-3 w-3" />
                          <span>External Generalization</span>
                        </span>
                        {isDone && (
                          <span className="text-[11px] px-2.5 py-0.5 rounded-lg bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30 flex items-center space-x-1.5">
                            <CheckCircle2 className="h-3.5 w-3.5 inline text-emerald-400" />
                            <span>Completed Today</span>
                          </span>
                        )}
                      </div>

                      <h4 className="text-base font-bold text-white font-heading">{slot.title}</h4>
                      <p className="text-xs text-slate-300 leading-relaxed bg-black/40 p-3 rounded-xl border border-white/5">
                        {slot.instruction}
                      </p>
                    </div>

                    {/* Easy-to-find external action button */}
                    <div className="flex items-center space-x-2.5">
                      <button
                        onClick={() => onAttemptExternal(slot)}
                        className={isDone ? "mac-btn-secondary px-4 py-2.5 text-xs font-bold" : "mac-btn-amber px-4 py-2.5 text-xs font-bold shadow-lg"}
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                        <span>{isDone ? 'Re-log External Attempt' : 'Record External Attempt'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
