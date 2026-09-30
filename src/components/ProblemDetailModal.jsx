import React, { useState } from 'react';
import { X, Calendar, Clock, ExternalLink, BookOpen, Tag as TagIcon, Plus, Trash2, MessageSquare, Send, CheckCircle2 } from 'lucide-react';
import TagSelector from './TagSelector';
import { api } from '../api/client';

export default function ProblemDetailModal({ problem, availableTags = [], onClose, onRefreshProblem, onAttemptProblem, onTagCreated }) {
  const [showAddSolution, setShowAddSolution] = useState(false);
  const [solTitle, setSolTitle] = useState('');
  const [solUrl, setSolUrl] = useState('');
  const [solNotes, setSolNotes] = useState('');
  const [solSelectedTags, setSolSelectedTags] = useState([]);
  const [isSubmittingSol, setIsSubmittingSol] = useState(false);

  // Problem Comments state
  const [newComment, setNewComment] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  if (!problem) return null;

  const handleAddSolution = async (e) => {
    e.preventDefault();
    if (!solTitle.trim()) return;

    try {
      setIsSubmittingSol(true);
      await api.addSolution(problem.id, {
        title: solTitle.trim(),
        url: solUrl.trim(),
        notes: solNotes.trim(),
        tags: solSelectedTags,
      });

      setSolTitle('');
      setSolUrl('');
      setSolNotes('');
      setSolSelectedTags([]);
      setShowAddSolution(false);
      onRefreshProblem(problem.id);
    } catch (err) {
      alert('Error adding solution: ' + err.message);
    } finally {
      setIsSubmittingSol(false);
    }
  };

  const handleDeleteSolution = async (solId) => {
    if (!window.confirm('Delete this solution?')) return;
    try {
      await api.deleteSolution(solId);
      onRefreshProblem(problem.id);
    } catch (err) {
      alert('Error deleting solution: ' + err.message);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      setIsSubmittingComment(true);
      await api.addProblemComment(problem.id, newComment.trim());
      setNewComment('');
      onRefreshProblem(problem.id);
    } catch (err) {
      alert('Error adding comment: ' + err.message);
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('Delete this comment?')) return;
    try {
      await api.deleteProblemComment(commentId);
      onRefreshProblem(problem.id);
    } catch (err) {
      alert('Error deleting comment: ' + err.message);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="glass-card rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto border border-slate-700 p-6 space-y-6 shadow-2xl relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Problem Header */}
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`text-xs px-3 py-1 rounded-full font-bold uppercase ${
              problem.difficulty === 'easy' ? 'badge-easy' : problem.difficulty === 'medium' ? 'badge-medium' : 'badge-hard'
            }`}>
              {problem.difficulty}
            </span>

            <span className="text-xs px-2.5 py-1 rounded bg-slate-900 text-slate-300 font-semibold border border-slate-800 uppercase">
              {problem.source_type}
            </span>

            {problem.next_review && (
              <span className="text-xs px-2.5 py-1 rounded bg-indigo-950 text-indigo-300 font-semibold border border-indigo-500/30 flex items-center space-x-1">
                <Calendar className="h-3.5 w-3.5" />
                <span>Next Review: {problem.next_review} (Interval: {problem.interval || 1}d)</span>
              </span>
            )}
          </div>

          <h2 className="text-2xl font-bold font-heading text-white">{problem.title}</h2>

          {/* Book / URL */}
          {problem.source_type === 'book' && problem.book_name && (
            <div className="text-sm text-slate-300 flex items-center space-x-2 bg-slate-950 p-2.5 rounded-xl border border-slate-800">
              <BookOpen className="h-4 w-4 text-indigo-400" />
              <span>Book: <strong>{problem.book_name}</strong> {problem.book_page ? `(Page ${problem.book_page})` : ''} {problem.book_problem_number ? `#${problem.book_problem_number}` : ''}</span>
            </div>
          )}

          {problem.source_url && (
            <div className="text-sm">
              <a
                href={problem.source_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-indigo-400 hover:underline flex items-center space-x-1 font-semibold"
              >
                <ExternalLink className="h-4 w-4 inline" />
                <span>Open Problem Source URL</span>
              </a>
            </div>
          )}

          {/* General Problem Notes */}
          {problem.notes && (
            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-200 space-y-1">
              <span className="font-bold text-indigo-300 block">Problem Notes / Intuition:</span>
              <p className="whitespace-pre-wrap leading-relaxed">{problem.notes}</p>
            </div>
          )}

          {/* Problem Tags */}
          {problem.tags && problem.tags.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 pt-2">
              <span className="text-xs font-semibold text-slate-400">Problem Tags:</span>
              {problem.tags.map((t) => (
                <span key={t.id} className="text-xs px-2.5 py-1 rounded-md bg-slate-900 text-slate-200 border border-slate-800 flex items-center space-x-1">
                  <TagIcon className="h-3 w-3 text-indigo-400" />
                  <span>{t.name}</span>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Action Button */}
        <div className="flex items-center space-x-3 border-y border-slate-800 py-3">
          <button
            onClick={() => onAttemptProblem(problem, problem.attempts && problem.attempts.length > 0 ? 'review' : 'fresh')}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-bold text-sm shadow-lg shadow-indigo-600/20 hover:brightness-110"
          >
            Record Attempt Now
          </button>
        </div>

        {/* Comments & Discussion Section */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <MessageSquare className="h-5 w-5 text-indigo-400" />
            <h3 className="text-lg font-bold font-heading text-white">Problem Comments & Notes</h3>
          </div>

          {/* Add Comment Form */}
          <form onSubmit={handleAddComment} className="flex items-start space-x-2">
            <textarea
              rows={2}
              placeholder="Add a comment, edge case reminder, or key takeaway for this problem..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="flex-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
            <button
              type="submit"
              disabled={isSubmittingComment || !newComment.trim()}
              className="px-4 py-2.5 rounded-xl bg-indigo-600 text-white font-bold text-xs shadow-md shadow-indigo-600/20 hover:bg-indigo-500 disabled:opacity-50 transition-all flex items-center space-x-1 h-full"
            >
              <Send className="h-3.5 w-3.5" />
              <span>Post</span>
            </button>
          </form>

          {/* Comments List */}
          {problem.comments && problem.comments.length > 0 ? (
            <div className="space-y-2">
              {problem.comments.map((comment) => (
                <div key={comment.id} className="glass-card rounded-xl p-3.5 border border-slate-800 text-xs space-y-1 relative group">
                  <div className="flex items-center justify-between text-slate-400 text-[11px]">
                    <span className="font-semibold text-slate-300">
                      {new Date(comment.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <button
                      onClick={() => handleDeleteComment(comment.id)}
                      className="text-slate-500 hover:text-rose-400 p-1 opacity-80 group-hover:opacity-100 transition-opacity"
                      title="Delete Comment"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <p className="text-slate-200 whitespace-pre-wrap leading-relaxed">{comment.content}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400 italic">No comments added yet.</p>
          )}
        </div>

        {/* Solutions Section */}
        <div className="space-y-4 border-t border-slate-800 pt-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold font-heading text-white">Solutions & Editorials</h3>
            <button
              onClick={() => setShowAddSolution(!showAddSolution)}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 text-xs font-semibold hover:bg-slate-800"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>{showAddSolution ? 'Cancel' : 'Add Solution Link'}</span>
            </button>
          </div>

          {/* Add Solution Form */}
          {showAddSolution && (
            <form onSubmit={handleAddSolution} className="glass-card rounded-xl p-4 border border-indigo-500/30 space-y-3 bg-slate-950/60">
              <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-400">New Solution Link</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="Solution Title (e.g., Two Heaps approach, NeetCode Video)"
                  value={solTitle}
                  onChange={(e) => setSolTitle(e.target.value)}
                  required
                  className="px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
                <input
                  type="url"
                  placeholder="Solution URL (e.g. https://...)"
                  value={solUrl}
                  onChange={(e) => setSolUrl(e.target.value)}
                  className="px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <textarea
                placeholder="Optional Solution Notes / Summary..."
                value={solNotes}
                onChange={(e) => setSolNotes(e.target.value)}
                rows={2}
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />

              <div>
                <label className="text-[11px] text-slate-400 font-semibold block mb-1">
                  Solution Specific Tags (Independent of problem tags):
                </label>
                <TagSelector
                  selectedTags={solSelectedTags}
                  onChange={setSolSelectedTags}
                  availableTags={availableTags}
                  onTagCreated={onTagCreated}
                  placeholder="Select solution tags..."
                />
              </div>

              <button
                type="submit"
                disabled={isSubmittingSol}
                className="px-4 py-2 rounded-lg bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-500 transition-all"
              >
                Save Solution
              </button>
            </form>
          )}

          {/* Solutions List */}
          {problem.solutions && problem.solutions.length > 0 ? (
            <div className="grid gap-3">
              {problem.solutions.map((sol) => (
                <div key={sol.id} className="glass-card rounded-xl p-4 border border-slate-800 space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-white">{sol.title}</h4>
                      {sol.url && (
                        <a
                          href={sol.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-indigo-400 hover:underline flex items-center space-x-1 mt-0.5"
                        >
                          <ExternalLink className="h-3 w-3 inline" />
                          <span>{sol.url}</span>
                        </a>
                      )}
                    </div>

                    <button
                      onClick={() => handleDeleteSolution(sol.id)}
                      className="text-rose-400 hover:text-rose-300 p-1"
                      title="Delete Solution"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  {sol.notes && (
                    <p className="text-xs text-slate-300 bg-slate-950 p-2 rounded border border-slate-900 whitespace-pre-wrap">
                      {sol.notes}
                    </p>
                  )}

                  {sol.tags && sol.tags.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1 pt-1">
                      <span className="text-[11px] text-slate-400">Solution Tags:</span>
                      {sol.tags.map((st) => (
                        <span key={st.id} className="text-[11px] px-2 py-0.5 rounded bg-indigo-950/80 text-indigo-300 border border-indigo-500/20">
                          {st.name}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400 italic">No solution links added yet.</p>
          )}
        </div>

        {/* Attempt History Section */}
        <div className="space-y-3 border-t border-slate-800 pt-4">
          <h3 className="text-lg font-bold font-heading text-white">Attempt History</h3>
          {problem.attempts && problem.attempts.length > 0 ? (
            <div className="space-y-2">
              {problem.attempts.map((att) => (
                <div key={att.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className={`px-2.5 py-0.5 rounded-full font-bold uppercase text-[11px] ${
                        att.result === 'failed' ? 'btn-result-failed' :
                        att.result === 'needed_hints' ? 'btn-result-hints' :
                        att.result === 'struggled' ? 'btn-result-struggled' :
                        att.result === 'comfortable' ? 'btn-result-comfortable' : 'btn-result-trivial'
                      }`}>
                        {att.result.replace('_', ' ')}
                      </span>
                      <span className="text-slate-400 font-medium">
                        {new Date(att.attempted_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                      <span className="text-slate-500 capitalize">({att.attempt_type})</span>
                    </div>
                    {att.notes && <p className="text-slate-300 italic">{att.notes}</p>}
                  </div>

                  {att.time_spent && (
                    <span className="text-slate-400 font-mono text-[11px] flex items-center space-x-1">
                      <Clock className="h-3 w-3" />
                      <span>{att.time_spent} mins</span>
                    </span>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400 italic">No attempts logged yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
