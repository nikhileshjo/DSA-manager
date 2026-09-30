import React, { useState } from 'react';
import { X, ExternalLink, PlusCircle, CheckCircle2 } from 'lucide-react';
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
      <div className="glass-card rounded-2xl w-full max-w-xl border border-slate-700 p-6 space-y-6 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
        >
          <X className="h-5 w-5" />
        </button>

        <div>
          <span className="text-xs uppercase tracking-wider font-bold text-amber-400">External Practice Slot</span>
          <h2 className="text-xl font-bold font-heading text-white mt-1">Record Unseen Problem Attempt</h2>
          <p className="text-xs text-slate-400 mt-1">
            Pick 1 random unsolved problem from LeetCode or another source. Do not look at the solution first.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Result Selection */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300 block">How did you perform? *</label>
            <div className="grid grid-cols-5 gap-2">
              {resultsConfig.map((res) => (
                <button
                  type="button"
                  key={res.key}
                  onClick={() => setResult(res.key)}
                  className={`p-2.5 rounded-xl border text-center font-bold text-xs transition-all ${res.style} ${
                    result === res.key ? 'ring-2 ring-amber-500 scale-[1.02]' : 'opacity-80 hover:opacity-100'
                  }`}
                >
                  {res.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">Time Spent (mins)</label>
              <input
                type="number"
                min="1"
                placeholder="e.g. 30"
                value={timeSpent}
                onChange={(e) => setTimeSpent(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500"
              />
            </div>
            <div className="md:col-span-2">
              <label className="text-xs font-bold text-slate-300 block mb-1">Attempt Notes / Key Takeaways</label>
              <input
                type="text"
                placeholder="e.g. Practiced sliding window pattern on external problem"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500"
              />
            </div>
          </div>

          {/* Add to Database Toggle */}
          <div className="glass-card rounded-xl p-4 border border-amber-500/20 bg-amber-950/20 space-y-3">
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={addToDatabase}
                onChange={(e) => setAddToDatabase(e.target.checked)}
                className="h-4 w-4 rounded accent-indigo-600"
              />
              <span className="text-xs font-bold text-amber-300">
                Optionally add this problem to your database for future SRS review tracking
              </span>
            </label>

            {addToDatabase && (
              <div className="space-y-3 pt-2 border-t border-amber-500/20 text-xs">
                <div>
                  <label className="font-bold text-slate-300 block mb-1">Problem Title *</label>
                  <input
                    type="text"
                    required={addToDatabase}
                    placeholder="e.g. Minimum Window Substring"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-300 block mb-1">Difficulty</label>
                    <select
                      value={difficulty}
                      onChange={(e) => setDifficulty(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white"
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
                      className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white"
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
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-300 block mb-1">Tags (Select existing or add new)</label>
                  <TagSelector
                    selectedTags={selectedTags}
                    onChange={setSelectedTags}
                    availableTags={availableTags}
                    onTagCreated={onTagCreated}
                    placeholder="Select tags..."
                  />
                </div>
              </div>
            )}
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
              className="px-5 py-2.5 rounded-xl bg-amber-600 text-white font-bold text-xs shadow-md shadow-amber-600/20 hover:bg-amber-500 transition-all"
            >
              Record External Attempt
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
