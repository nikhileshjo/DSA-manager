import React from 'react';
import { RotateCcw, Sparkles, ExternalLink, CheckCircle2, BookOpen, Tag as TagIcon, Clock, AlertCircle } from 'lucide-react';

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
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  const { capacity, reviewProblems = [], freshProblems = [], externalSlots = [], explanation } = practiceSession;

  const totalItems = reviewProblems.length + freshProblems.length + externalSlots.length;
  const completedCount = Object.keys(completedMap).length;
  const progressPercent = capacity > 0 ? Math.min(100, Math.round((completedCount / capacity) * 100)) : 0;

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Top Header & Daily Capacity Banner */}
      <div className="glass-card rounded-2xl p-6 border border-slate-800 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs uppercase tracking-wider font-bold text-indigo-400">Daily Goal</span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                SRS & Adaptation
              </span>
            </div>
            <h2 className="text-2xl font-extrabold font-heading text-white mt-1">Today's Practice Queue</h2>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={onRefresh}
              className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 transition-all flex items-center space-x-2 text-xs font-semibold"
            >
              <RotateCcw className="h-4 w-4" />
              <span>Refresh Queue</span>
            </button>
            <button
              onClick={onOpenSettings}
              className="text-xs text-indigo-400 hover:text-indigo-300 underline font-medium"
            >
              Change Capacity ({capacity}/day)
            </button>
          </div>
        </div>

        {/* Progress bar */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-sm font-semibold">
            <span className="text-slate-300">Daily Practice Capacity</span>
            <span className="text-indigo-400 font-bold">{completedCount} of {capacity} completed</span>
          </div>
          <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden border border-slate-800 p-0.5">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-400 rounded-full transition-all duration-500 shadow-md"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Allocation Explanation */}
        {explanation && (
          <div className="flex items-start space-x-3 p-3.5 rounded-xl bg-indigo-950/40 border border-indigo-500/20 text-slate-300 text-xs leading-relaxed">
            <Sparkles className="h-4 w-4 text-indigo-400 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-indigo-300">Allocation Strategy: </span>
              {explanation}
            </div>
          </div>
        )}
      </div>

      {totalItems === 0 && (
        <div className="glass-card rounded-2xl p-12 text-center space-y-4 border border-slate-800">
          <div className="h-14 w-14 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mx-auto border border-indigo-500/20">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <h3 className="text-xl font-bold text-white">No practice items queued right now</h3>
          <p className="text-sm text-slate-400 max-w-md mx-auto">
            You have no reviews due today. Add new problems to your database to expand your practice queue!
          </p>
        </div>
      )}

      {/* SECTION A: REVIEWS */}
      {reviewProblems.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div className="flex items-center space-x-2">
              <div className="h-3 w-3 rounded-full bg-rose-500 animate-pulse"></div>
              <h3 className="text-lg font-bold text-white font-heading">
                Review Problems ({reviewProblems.length})
              </h3>
            </div>
            <span className="text-xs text-rose-400 font-semibold px-2.5 py-0.5 rounded-full bg-rose-500/10 border border-rose-500/20">
              Spaced Repetition Due
            </span>
          </div>

          <div className="grid gap-4">
            {reviewProblems.map((prob) => {
              const isDone = !!completedMap[prob.id];

              return (
                <div
                  key={`rev-${prob.id}`}
                  className={`glass-card glass-card-hover rounded-xl p-5 border transition-all ${
                    isDone ? 'opacity-60 border-emerald-500/30 bg-emerald-950/10' : 'border-slate-800'
                  }`}
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="space-y-2 max-w-2xl">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold uppercase ${
                          prob.difficulty === 'easy' ? 'badge-easy' : prob.difficulty === 'medium' ? 'badge-medium' : 'badge-hard'
                        }`}>
                          {prob.difficulty}
                        </span>
                        <span className="text-xs px-2 py-0.5 rounded bg-slate-900 text-rose-300 font-semibold border border-rose-500/20">
                          Due Today (Interval: {prob.interval || 1}d)
                        </span>
                        {isDone && (
                          <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30 flex items-center space-x-1">
                            <CheckCircle2 className="h-3 w-3 inline" />
                            <span>Completed Today</span>
                          </span>
                        )}
                      </div>

                      <h4
                        onClick={() => onViewProblemDetails(prob.id)}
                        className="text-lg font-bold text-white hover:text-indigo-400 cursor-pointer transition-colors"
                      >
                        {prob.title}
                      </h4>

                      {/* Tags */}
                      {prob.tags && prob.tags.length > 0 && (
                        <div className="flex flex-wrap items-center gap-1.5 pt-1">
                          {prob.tags.map((t) => (
                            <span key={t.id} className="text-xs px-2 py-0.5 rounded-md bg-slate-900 text-slate-300 border border-slate-800 flex items-center space-x-1">
                              <TagIcon className="h-3 w-3 text-indigo-400" />
                              <span>{t.name}</span>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => onViewProblemDetails(prob.id)}
                        className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 text-xs font-semibold transition-all"
                      >
                        Details
                      </button>
                      <button
                        onClick={() => onAttemptProblem(prob, 'review')}
                        className={`px-4 py-2 rounded-xl text-xs font-bold shadow-md transition-all ${
                          isDone
                            ? 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                            : 'bg-gradient-to-r from-rose-600 to-pink-600 text-white shadow-rose-600/20 hover:brightness-110'
                        }`}
                      >
                        {isDone ? 'Re-log Attempt' : 'Record Attempt'}
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
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div className="flex items-center space-x-2">
              <div className="h-3 w-3 rounded-full bg-indigo-500"></div>
              <h3 className="text-lg font-bold text-white font-heading">
                Fresh Database Problems ({freshProblems.length})
              </h3>
            </div>
            <span className="text-xs text-indigo-400 font-semibold px-2.5 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20">
              Weak Topic Prioritized
            </span>
          </div>

          <div className="grid gap-4">
            {freshProblems.map((prob) => {
              const isDone = !!completedMap[prob.id];

              return (
                <div
                  key={`fresh-${prob.id}`}
                  className={`glass-card glass-card-hover rounded-xl p-5 border transition-all ${
                    isDone ? 'opacity-60 border-emerald-500/30 bg-emerald-950/10' : 'border-slate-800'
                  }`}
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="space-y-2 max-w-2xl">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold uppercase ${
                          prob.difficulty === 'easy' ? 'badge-easy' : prob.difficulty === 'medium' ? 'badge-medium' : 'badge-hard'
                        }`}>
                          {prob.difficulty}
                        </span>
                        <span className="text-xs px-2 py-0.5 rounded bg-slate-900 text-indigo-300 font-semibold border border-indigo-500/20">
                          Unattempted Fresh
                        </span>
                        {isDone && (
                          <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30 flex items-center space-x-1">
                            <CheckCircle2 className="h-3 w-3 inline" />
                            <span>Completed Today</span>
                          </span>
                        )}
                      </div>

                      <h4
                        onClick={() => onViewProblemDetails(prob.id)}
                        className="text-lg font-bold text-white hover:text-indigo-400 cursor-pointer transition-colors"
                      >
                        {prob.title}
                      </h4>

                      {/* Tags */}
                      {prob.tags && prob.tags.length > 0 && (
                        <div className="flex flex-wrap items-center gap-1.5 pt-1">
                          {prob.tags.map((t) => (
                            <span key={t.id} className="text-xs px-2 py-0.5 rounded-md bg-slate-900 text-slate-300 border border-slate-800 flex items-center space-x-1">
                              <TagIcon className="h-3 w-3 text-indigo-400" />
                              <span>{t.name}</span>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => onViewProblemDetails(prob.id)}
                        className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 text-xs font-semibold transition-all"
                      >
                        Details
                      </button>
                      <button
                        onClick={() => onAttemptProblem(prob, 'fresh')}
                        className={`px-4 py-2 rounded-xl text-xs font-bold shadow-md transition-all ${
                          isDone
                            ? 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                            : 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-indigo-600/20 hover:brightness-110'
                        }`}
                      >
                        {isDone ? 'Re-log Attempt' : 'Record Attempt'}
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
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div className="flex items-center space-x-2">
              <div className="h-3 w-3 rounded-full bg-amber-500"></div>
              <h3 className="text-lg font-bold text-white font-heading">
                External Practice Slots ({externalSlots.length})
              </h3>
            </div>
            <span className="text-xs text-amber-400 font-semibold px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20">
              Generalization Test
            </span>
          </div>

          <div className="grid gap-4">
            {externalSlots.map((slot) => {
              const isDone = !!completedMap[slot.id];

              return (
                <div
                  key={slot.id}
                  className={`glass-card glass-card-hover rounded-xl p-5 border border-amber-500/20 bg-amber-950/10 transition-all ${
                    isDone ? 'opacity-60 border-emerald-500/30 bg-emerald-950/10' : ''
                  }`}
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="space-y-2 max-w-2xl">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs px-2.5 py-0.5 rounded-full font-bold uppercase bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center space-x-1">
                          <ExternalLink className="h-3 w-3" />
                          <span>External Slot</span>
                        </span>
                        {isDone && (
                          <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30 flex items-center space-x-1">
                            <CheckCircle2 className="h-3 w-3 inline" />
                            <span>Completed Today</span>
                          </span>
                        )}
                      </div>

                      <h4 className="text-lg font-bold text-white">{slot.title}</h4>
                      <p className="text-xs text-slate-300 leading-relaxed bg-slate-900/80 p-3 rounded-lg border border-slate-800">
                        {slot.instruction}
                      </p>
                    </div>

                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => onAttemptExternal(slot)}
                        className={`px-4 py-2.5 rounded-xl text-xs font-bold shadow-md transition-all ${
                          isDone
                            ? 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                            : 'bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-amber-600/20 hover:brightness-110'
                        }`}
                      >
                        {isDone ? 'Re-log External Attempt' : 'Record External Attempt'}
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
