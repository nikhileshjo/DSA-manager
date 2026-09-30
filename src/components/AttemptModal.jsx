import React, { useState } from 'react';
import { X, Clock, CheckCircle2, AlertTriangle, Sparkles } from 'lucide-react';

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
    { key: 'failed', label: 'Failed', desc: 'Could not solve / total block', interval: '1 day', style: 'btn-result-failed' },
    { key: 'needed_hints', label: 'Needed Hints', desc: 'Solved only after looking at hints', interval: '2 days', style: 'btn-result-hints' },
    { key: 'struggled', label: 'Struggled', desc: 'Solved with effort / slow', interval: '4 days', style: 'btn-result-struggled' },
    { key: 'comfortable', label: 'Comfortable', desc: 'Clean optimal solution', interval: '10 days', style: 'btn-result-comfortable' },
    { key: 'trivial', label: 'Trivial', desc: 'Effortless / instant solution', interval: '21 days', style: 'btn-result-trivial' },
  ];

  return (
    <div className="modal-overlay">
      <div className="glass-card rounded-2xl w-full max-w-xl border border-slate-700 p-6 space-y-6 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
        >
          <X className="h-5 w-5" />
        </button>

        <div>
          <span className="text-xs uppercase tracking-wider font-bold text-indigo-400">Log Practice Attempt</span>
          <h2 className="text-xl font-bold font-heading text-white mt-1">{problem.title}</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Result Buttons */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300 block">How did your attempt go? *</label>
            <div className="grid gap-2">
              {resultsConfig.map((res) => (
                <button
                  type="button"
                  key={res.key}
                  onClick={() => setResult(res.key)}
                  className={`p-3 rounded-xl border text-left transition-all flex items-center justify-between ${res.style} ${
                    result === res.key ? 'ring-2 ring-indigo-500 scale-[1.01]' : 'opacity-80 hover:opacity-100'
                  }`}
                >
                  <div>
                    <span className="font-bold text-sm block">{res.label}</span>
                    <span className="text-[11px] opacity-80">{res.desc}</span>
                  </div>
                  <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-950/60 border border-white/10 font-bold">
                    SRS: +{res.interval}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Time spent & notes */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="md:col-span-1">
              <label className="text-xs font-bold text-slate-300 block mb-1">Time Spent (mins)</label>
              <input
                type="number"
                min="1"
                max="300"
                placeholder="e.g. 25"
                value={timeSpent}
                onChange={(e) => setTimeSpent(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div className="md:col-span-2">
              <label className="text-xs font-bold text-slate-300 block mb-1">Attempt Notes / Takeaways</label>
              <input
                type="text"
                placeholder="e.g. Remember to handle empty array edge case"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-900 text-slate-300 border border-slate-800 font-semibold text-xs hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-bold text-xs shadow-md shadow-indigo-600/20 hover:bg-indigo-500 transition-all"
            >
              Save Attempt & Schedule
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
