import React, { useState, useEffect } from 'react';
import { X, Plus, Tag as TagIcon, AlertTriangle, ExternalLink, Eye } from 'lucide-react';
import TagSelector from './TagSelector';

export default function ProblemFormModal({ problem, availableTags = [], onClose, onSave, onTagCreated, onViewExistingProblem }) {
  const isEditing = !!problem;

  const [title, setTitle] = useState('');
  const [difficulty, setDifficulty] = useState('medium');
  const [sourceType, setSourceType] = useState('leetcode');
  const [sourceUrl, setSourceUrl] = useState('');
  const [bookName, setBookName] = useState('');
  const [bookPage, setBookPage] = useState('');
  const [bookProblemNumber, setBookProblemNumber] = useState('');
  const [notes, setNotes] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Duplicate warning state
  const [duplicateWarning, setDuplicateWarning] = useState(null); // { reason, existingProblem }

  useEffect(() => {
    if (problem) {
      setTitle(problem.title || '');
      setDifficulty(problem.difficulty || 'medium');
      setSourceType(problem.source_type || 'leetcode');
      setSourceUrl(problem.source_url || '');
      setBookName(problem.book_name || '');
      setBookPage(problem.book_page || '');
      setBookProblemNumber(problem.book_problem_number || '');
      setNotes(problem.notes || '');
      if (problem.tags) {
        setSelectedTags(problem.tags.map((t) => t.name));
      }
    }
  }, [problem]);

  const handleSubmit = async (e, allowDuplicate = false) => {
    if (e) e.preventDefault();
    if (!title.trim()) return;

    try {
      setIsSubmitting(true);
      setDuplicateWarning(null);

      const payload = {
        title: title.trim(),
        difficulty,
        source_type: sourceType,
        source_url: sourceUrl.trim(),
        book_name: bookName.trim(),
        book_page: bookPage.trim(),
        book_problem_number: bookProblemNumber.trim(),
        notes: notes.trim(),
        tags: selectedTags,
        allowDuplicate,
      };

      await onSave(payload, problem?.id);
      onClose();
    } catch (err) {
      if (err.isDuplicate || err.message?.includes('already exists')) {
        setDuplicateWarning({
          reason: err.message,
          existingProblem: err.existingProblem,
        });
      } else {
        alert('Error saving problem: ' + err.message);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="glass-card rounded-2xl w-full max-w-2xl border border-slate-700 p-6 space-y-6 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
        >
          <X className="h-5 w-5" />
        </button>

        <h2 className="text-xl font-bold font-heading text-white">
          {isEditing ? 'Edit Problem' : 'Add New Problem'}
        </h2>

        {/* Duplicate Alert Banner */}
        {duplicateWarning && (
          <div className="glass-card rounded-xl p-4 border border-rose-500/40 bg-rose-950/30 text-xs space-y-3">
            <div className="flex items-start space-x-3 text-rose-300 font-semibold">
              <AlertTriangle className="h-5 w-5 text-rose-400 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-rose-200 text-sm">Duplicate Problem Detected</h4>
                <p className="mt-0.5">{duplicateWarning.reason}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3 pt-1">
              {duplicateWarning.existingProblem && onViewExistingProblem && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onViewExistingProblem(duplicateWarning.existingProblem.id);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-indigo-600 text-white font-bold flex items-center space-x-1 hover:bg-indigo-500"
                >
                  <Eye className="h-3.5 w-3.5" />
                  <span>View Existing Problem</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => handleSubmit(null, true)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-200 border border-slate-700 font-semibold hover:bg-slate-700"
              >
                Add Anyway (Force Create)
              </button>
            </div>
          </div>
        )}

        <form onSubmit={(e) => handleSubmit(e, false)} className="space-y-4 text-xs">
          {/* Title */}
          <div>
            <label className="font-bold text-slate-300 block mb-1">Problem Title *</label>
            <input
              type="text"
              required
              placeholder="e.g. 3Sum, Binary Tree Zigzag Level Order Traversal"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Difficulty */}
            <div>
              <label className="font-bold text-slate-300 block mb-1">Difficulty *</label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>

            {/* Source Type */}
            <div>
              <label className="font-bold text-slate-300 block mb-1">Source Type</label>
              <select
                value={sourceType}
                onChange={(e) => setSourceType(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="leetcode">LeetCode</option>
                <option value="codeforces">Codeforces</option>
                <option value="hackerrank">HackerRank</option>
                <option value="book">Book</option>
                <option value="url">Web URL</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          {/* Conditional Fields */}
          {sourceType === 'book' ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-3 rounded-xl bg-slate-950 border border-slate-800">
              <div>
                <label className="text-[11px] text-slate-400 font-semibold block mb-1">Book Name</label>
                <input
                  type="text"
                  placeholder="e.g. Cracking the Coding Interview"
                  value={bookName}
                  onChange={(e) => setBookName(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-400 font-semibold block mb-1">Page Number</label>
                <input
                  type="text"
                  placeholder="e.g. 142"
                  value={bookPage}
                  onChange={(e) => setBookPage(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-400 font-semibold block mb-1">Problem #</label>
                <input
                  type="text"
                  placeholder="e.g. 4.2"
                  value={bookProblemNumber}
                  onChange={(e) => setBookProblemNumber(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500"
                />
              </div>
            </div>
          ) : (
            <div>
              <label className="font-bold text-slate-300 block mb-1">Source URL</label>
              <input
                type="url"
                placeholder="https://leetcode.com/problems/..."
                value={sourceUrl}
                onChange={(e) => setSourceUrl(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>
          )}

          {/* Problem Notes */}
          <div>
            <label className="font-bold text-slate-300 block mb-1">Problem Notes / Intuition (Optional)</label>
            <textarea
              rows={2}
              placeholder="e.g. Edge cases to keep in mind, intuition notes, or formula summary..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Problem Tags Select Feature */}
          <div>
            <label className="font-bold text-slate-300 block mb-1">
              Problem Tags (Select existing or add new)
            </label>
            <TagSelector
              selectedTags={selectedTags}
              onChange={setSelectedTags}
              availableTags={availableTags}
              onTagCreated={onTagCreated}
              placeholder="Select from existing tags or type to create..."
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-slate-800">
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
              {isEditing ? 'Save Changes' : 'Create Problem'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
