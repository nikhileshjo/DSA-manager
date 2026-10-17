import React, { useState, useEffect } from 'react';
import { X, Plus, Tag as TagIcon, AlertTriangle, ExternalLink, Eye, CheckCircle2, BookOpen } from 'lucide-react';
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
      <div className="mac-window rounded-2xl w-full max-w-2xl p-6 space-y-6 shadow-2xl relative max-h-[92vh] overflow-y-auto">
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

          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            {isEditing ? 'Edit Problem Item' : 'New Problem Item'}
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
          <span className="text-[11px] uppercase tracking-wider font-bold text-indigo-400">
            Repository Management
          </span>
          <h2 className="text-xl font-bold font-heading text-white mt-1">
            {isEditing ? 'Edit Problem' : 'Add New Problem'}
          </h2>
        </div>

        {/* Duplicate Alert Banner */}
        {duplicateWarning && (
          <div className="glass-card rounded-xl p-4 border border-rose-500/40 bg-rose-950/40 text-xs space-y-3">
            <div className="flex items-start space-x-3 text-rose-300 font-semibold">
              <AlertTriangle className="h-5 w-5 text-rose-400 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-rose-200 text-sm">Duplicate Problem Detected</h4>
                <p className="mt-0.5 leading-relaxed">{duplicateWarning.reason}</p>
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
                  className="mac-btn-primary py-1.5 px-3 text-xs font-bold flex items-center space-x-1"
                >
                  <Eye className="h-3.5 w-3.5" />
                  <span>View Existing Problem</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => handleSubmit(null, true)}
                className="mac-btn-secondary py-1.5 px-3 text-xs font-semibold"
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
              className="w-full px-3 py-2.5 rounded-xl mac-input text-xs text-white placeholder-slate-500 font-medium"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Difficulty */}
            <div>
              <label className="font-bold text-slate-300 block mb-1">Difficulty *</label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl mac-input text-xs text-white font-medium"
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
                className="w-full px-3 py-2.5 rounded-xl mac-input text-xs text-white font-medium"
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
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 rounded-xl bg-black/30 border border-white/10">
              <div>
                <label className="text-[11px] text-slate-400 font-semibold block mb-1">Book Name</label>
                <input
                  type="text"
                  placeholder="e.g. SQL Queries for Mere Mortals"
                  value={bookName}
                  onChange={(e) => setBookName(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg mac-input text-xs text-white placeholder-slate-500"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-400 font-semibold block mb-1">Page Number</label>
                <input
                  type="text"
                  placeholder="e.g. 142"
                  value={bookPage}
                  onChange={(e) => setBookPage(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg mac-input text-xs text-white placeholder-slate-500"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-400 font-semibold block mb-1">Problem #</label>
                <input
                  type="text"
                  placeholder="e.g. 4.2"
                  value={bookProblemNumber}
                  onChange={(e) => setBookProblemNumber(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg mac-input text-xs text-white placeholder-slate-500"
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
                className="w-full px-3 py-2 rounded-xl mac-input text-xs text-white placeholder-slate-500"
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
              className="w-full px-3 py-2 rounded-xl mac-input text-xs text-white placeholder-slate-500"
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
              <span>{isEditing ? 'Save Changes' : 'Create Problem'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
