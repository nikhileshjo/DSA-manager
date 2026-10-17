import React, { useState } from 'react';
import { X, ExternalLink, PlusCircle, CheckCircle2, Compass, Check } from 'lucide-react';
import TagSelector from './TagSelector';

export default function ExternalSlotModal({ slot, availableTags = [], onClose, onSubmit, onTagCreated }) {
  const [result, setResult] = useState('comfortable');
  const [notes, setNotes] = useState('');
  const [timeSpent, setTimeSpent] = useState('');
  const [addToDatabase, setAddToDatabase] = useState(false);

  // External problem save fields if user toggles addToDatabase
  const [title, setTitle] = useState('');
  const [difficulty, setDifficulty] = useState('medium');
  const [sourceType, setSourceType] = useState('leetcode');
  const [sourceUrl, setSourceUrl] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (addToDatabase && !title.trim()) {
      alert('Please enter a problem title to save it to your database.');
      return;
    }

    try {
      setIsSubmitting(true);
      await onSubmit({
        attempt_type: 'external',
        result,
        notes: notes.trim(),
        time_spent: timeSpent ? parseInt(timeSpent, 10) : null,
        addToDatabase,
        title: title.trim(),
        difficulty,
        source_type: sourceType,
        source_url: sourceUrl.trim(),
        tags: selectedTags,
      });

      onClose();
    } catch (err) {
      alert('Error recording external attempt: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resultsConfig = [
    { key: 'failed', label: 'Failed', style: 'btn-result-failed' },
    { key: 'needed_hints', label: 'Needed Hints', style: 'btn-result-hints' },
    { key: 'struggled', label: 'Struggled', style: 'btn-result-struggled' },
    { key: 'comfortable', label: 'Comfortable', style: 'btn-result-comfortable' },
    { key: 'trivial', label: 'Trivial', style: 'btn-result-trivial' },
  ];

  return (
    <div className="modal-overlay">
      <div className="mac-window rounded-2xl w-full max-w-xl p-6 space-y-6 shadow-2xl relative">
        {/* macOS Window Header with Traffic Lights */}
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

          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center space-x-1.5">
            <Compass className="h-3.5 w-3.5 text-amber-400" />
            <span>External Slot</span>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
            title="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div>
          <span className="text-[11px] uppercase tracking-wider font-bold text-amber-400">
            Generalization Test
          </span>
          <h2 className="text-xl font-bold font-heading text-white mt-1">Record Unseen Problem Attempt</h2>
          <p className="text-xs text-slate-300 mt-1 leading-relaxed">
            Pick 1 random unsolved problem from LeetCode or another platform. Test your pure intuition without looking at solutions first.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Result Selection Buttons */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300 block">How did you perform? *</label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {resultsConfig.map((res) => {
                const isSelected = result === res.key;

                return (
                  <button
                    type="button"
                    key={res.key}
                    onClick={() => setResult(res.key)}
                    className={`btn-result-card text-center font-bold text-xs p-2.5 rounded-xl border flex flex-col items-center justify-center space-y-1 ${res.style} ${
                      isSelected ? 'btn-result-selected' : 'opacity-85 hover:opacity-100'
                    }`}
                  >
                    <span>{res.label}</span>
                    {isSelected && <Check className="h-3.5 w-3.5 stroke-[3] text-white" />}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">Time Spent (mins)</label>
              <input
                type="number"
                min="1"
                placeholder="e.g. 30"
                value={timeSpent}
                onChange={(e) => setTimeSpent(e.target.value)}
                className="w-full px-3 py-2 rounded-xl mac-input text-xs text-white placeholder-slate-500 font-mono"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="text-xs font-bold text-slate-300 block mb-1">Attempt Notes / Key Takeaways</label>
              <input
                type="text"
                placeholder="e.g. Practiced sliding window pattern on external problem"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3 py-2 rounded-xl mac-input text-xs text-white placeholder-slate-500"
              />
            </div>
          </div>

          {/* Add to Database Toggle */}
          <div className="glass-card rounded-xl p-4 border border-amber-500/25 bg-amber-950/20 space-y-3">
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={addToDatabase}
                onChange={(e) => setAddToDatabase(e.target.checked)}
                className="h-4 w-4 rounded accent-indigo-500 cursor-pointer"
              />
              <span className="text-xs font-bold text-amber-200">
                Save this problem into your repository for future SRS review tracking
              </span>
            </label>

            {addToDatabase && (
              <div className="space-y-3 pt-3 border-t border-amber-500/20 text-xs">
                <div>
                  <label className="font-bold text-slate-300 block mb-1">Problem Title *</label>
                  <input
                    type="text"
                    required={addToDatabase}
                    placeholder="e.g. Minimum Window Substring"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl mac-input text-xs text-white placeholder-slate-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-300 block mb-1">Difficulty</label>
                    <select
                      value={difficulty}
                      onChange={(e) => setDifficulty(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl mac-input text-xs text-white"
                    >
                      <option value="easy">Easy</option>
                      <option value="medium">Medium</option>
                      <option value="hard">Hard</option>
                    </select>
                  </div>
                  <div>
                    <label className="font-bold text-slate-300 block mb-1">Source Type</label>
                    <select
                      value={sourceType}
                      onChange={(e) => setSourceType(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl mac-input text-xs text-white"
                    >
                      <option value="leetcode">LeetCode</option>
                      <option value="codeforces">Codeforces</option>
                      <option value="hackerrank">HackerRank</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-300 block mb-1">Source URL</label>
                  <input
                    type="url"
                    placeholder="https://leetcode.com/problems/..."
                    value={sourceUrl}
                    onChange={(e) => setSourceUrl(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl mac-input text-xs text-white placeholder-slate-500"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-300 block mb-1">Tags (Select existing or add new)</label>
                  <TagSelector
                    selectedTags={selectedTags}
                    onChange={setSelectedTags}
                    availableTags={availableTags}
                    onTagCreated={onTagCreated}
                    placeholder="Select or add tags..."
                  />
                </div>
              </div>
            )}
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
              className="mac-btn-amber px-5 py-2.5 text-xs font-bold shadow-lg"
            >
              <CheckCircle2 className="h-4 w-4" />
              <span>{isSubmitting ? 'Recording...' : 'Record External Attempt'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
