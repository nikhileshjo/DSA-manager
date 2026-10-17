import React, { useState } from 'react';
import { X, Clock, CheckCircle2, AlertTriangle, Sparkles, Calendar, Check, Send } from 'lucide-react';

export default function AttemptModal({ problem, attemptType = 'review', onClose, onSubmit }) {
  const [result, setResult] = useState('comfortable');
  const [notes, setNotes] = useState('');
  const [timeSpent, setTimeSpent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!problem) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      await onSubmit({
        problem_id: problem.id,
        attempt_type: attemptType,
        result,
        notes: notes.trim(),
        time_spent: timeSpent ? parseInt(timeSpent, 10) : null,
      });
      onClose();
    } catch (err) {
      alert('Error submitting attempt: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resultsConfig = [
    { key: 'failed', label: 'Failed', desc: 'Could not solve / total block', interval: '1 day', colorClass: 'btn-result-failed', dotColor: 'bg-rose-500' },
    { key: 'needed_hints', label: 'Needed Hints', desc: 'Solved only after looking at editorial or hints', interval: '2 days', colorClass: 'btn-result-hints', dotColor: 'bg-orange-500' },
    { key: 'struggled', label: 'Struggled', desc: 'Solved but with high friction / slow intuition', interval: '4 days', colorClass: 'btn-result-struggled', dotColor: 'bg-yellow-500' },
    { key: 'comfortable', label: 'Comfortable', desc: 'Clean, confident optimal solution', interval: '10 days', colorClass: 'btn-result-comfortable', dotColor: 'bg-emerald-500' },
    { key: 'trivial', label: 'Trivial', desc: 'Effortless / solved almost immediately', interval: '21 days', colorClass: 'btn-result-trivial', dotColor: 'bg-purple-500' },
  ];

  return (
    <div className="modal-overlay">
      <div className="mac-window rounded-2xl w-full max-w-xl p-6 space-y-6 shadow-2xl relative">
        {/* macOS Window Titlebar with Traffic Lights */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="mac-traffic-lights">
            <div className="mac-dot mac-dot-close" onClick={onClose} title="Close">
              <span>✕</span>
            </div>
            <div className="mac-dot mac-dot-minimize" title="Minimize">
              <span>−</span>
            </div>
            <div className="mac-dot mac-dot-maximize" title="Zoom">
              <span>⤢</span>
            </div>
          </div>

          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            {attemptType === 'review' ? 'SRS Review Attempt' : 'Fresh Practice Attempt'}
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
            title="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Header */}
        <div className="space-y-1">
          <span className="text-[11px] uppercase tracking-wider font-bold text-indigo-400">
            Log Performance
          </span>
          <h2 className="text-xl font-bold font-heading text-white">{problem.title}</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Result Selection Buttons: Tactile macOS Cards */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300 block">
              How did your attempt go? *
            </label>
            <div className="grid gap-2">
              {resultsConfig.map((res) => {
                const isSelected = result === res.key;

                return (
                  <button
                    type="button"
                    key={res.key}
                    onClick={() => setResult(res.key)}
                    className={`btn-result-card flex items-center justify-between ${res.colorClass} ${
                      isSelected ? 'btn-result-selected' : 'opacity-85 hover:opacity-100'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <span className={`h-2.5 w-2.5 rounded-full ${res.dotColor} shadow-sm`} />
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-sm text-white">{res.label}</span>
                          {isSelected && <Check className="h-3.5 w-3.5 text-white stroke-[3]" />}
                        </div>
                        <span className="text-[11px] opacity-80 block text-slate-300">{res.desc}</span>
                      </div>
                    </div>

                    <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-black/50 border border-white/10 font-bold text-slate-200">
                      SRS: +{res.interval}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Time spent & notes */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-1">
              <label className="text-xs font-bold text-slate-300 block mb-1">Time Spent (mins)</label>
              <input
                type="number"
                min="1"
                max="300"
                placeholder="e.g. 25"
                value={timeSpent}
                onChange={(e) => setTimeSpent(e.target.value)}
                className="w-full px-3 py-2 rounded-xl mac-input text-xs text-white placeholder-slate-500 font-mono"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="text-xs font-bold text-slate-300 block mb-1">Attempt Notes / Key Takeaways</label>
              <input
                type="text"
                placeholder="e.g. Remember to watch out for duplicate elements"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3 py-2 rounded-xl mac-input text-xs text-white placeholder-slate-500"
              />
            </div>
          </div>

          {/* Easy-to-find Dialog Buttons */}
          <div className="flex justify-end items-center space-x-3 pt-4 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="mac-btn-secondary px-4 py-2.5 text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="mac-btn-primary px-5 py-2.5 text-xs font-bold shadow-lg"
            >
              <CheckCircle2 className="h-4 w-4" />
              <span>{isSubmitting ? 'Scheduling...' : 'Save Attempt & Schedule'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
