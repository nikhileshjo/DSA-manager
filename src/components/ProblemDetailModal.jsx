import React, { useState } from 'react';
import { X, Calendar, Clock, ExternalLink, BookOpen, Tag as TagIcon, Plus, Trash2, MessageSquare, Send, CheckCircle2, Play } from 'lucide-react';
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

  const isDue = problem.next_review && new Date(problem.next_review) <= new Date();

  return (
    <div className="modal-overlay">
      <div className="mac-window rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto p-6 space-y-6 shadow-2xl relative">
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
            Problem Inspector
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
            title="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Problem Header Information */}
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`text-[10px] px-3 py-0.5 rounded-full font-bold uppercase ${
              problem.difficulty === 'easy' ? 'badge-easy' : problem.difficulty === 'medium' ? 'badge-medium' : 'badge-hard'
            }`}>
              {problem.difficulty}
            </span>

            <span className="text-[10px] px-2.5 py-0.5 rounded-md bg-black/40 text-slate-300 font-semibold border border-white/10 uppercase">
              {problem.source_type}
            </span>

            {problem.next_review && (
              <span className={`text-[11px] px-2.5 py-0.5 rounded-md font-semibold flex items-center space-x-1.5 ${
                isDue 
                  ? 'bg-rose-950/70 text-rose-300 border border-rose-500/30' 
                  : 'bg-indigo-950/70 text-indigo-300 border border-indigo-500/30'
              }`}>
                <Calendar className="h-3 w-3" />
                <span>Next Review: {problem.next_review} (Interval: {problem.interval || 1}d)</span>
              </span>
            )}
          </div>

          <h2 className="text-2xl font-bold font-heading text-white">{problem.title}</h2>

          {/* Book / URL */}
          {problem.source_type === 'book' && problem.book_name && (
            <div className="text-xs text-slate-300 flex items-center space-x-2 bg-black/30 p-2.5 rounded-xl border border-white/10">
              <BookOpen className="h-4 w-4 text-indigo-400" />
              <span>Book: <strong>{problem.book_name}</strong> {problem.book_page ? `(Page ${problem.book_page})` : ''} {problem.book_problem_number ? `#${problem.book_problem_number}` : ''}</span>
            </div>
          )}

          {problem.source_url && (
            <div className="text-xs">
              <a
                href={problem.source_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sky-400 hover:text-sky-300 hover:underline flex items-center space-x-1.5 font-semibold"
              >
                <ExternalLink className="h-3.5 w-3.5 inline" />
                <span>Open Problem Source URL</span>
              </a>
            </div>
          )}

          {/* General Problem Notes */}
          {problem.notes && (
            <div className="p-3.5 rounded-xl bg-black/30 border border-white/10 text-xs text-slate-200 space-y-1">
              <span className="font-bold text-indigo-300 block">Problem Notes / Intuition:</span>
              <p className="whitespace-pre-wrap leading-relaxed">{problem.notes}</p>
            </div>
          )}

          {/* Problem Tags */}
          {problem.tags && problem.tags.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-[11px] font-semibold text-slate-400">Problem Tags:</span>
              {problem.tags.map((t) => (
                <span key={t.id} className="text-[11px] px-2.5 py-0.5 rounded-md bg-white/5 text-slate-200 border border-white/10 flex items-center space-x-1">
                  <TagIcon className="h-2.5 w-2.5 text-indigo-400" />
                  <span>{t.name}</span>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Big Easy-to-Find Primary CTA Bar */}
        <div className="flex items-center justify-between border-y border-white/10 py-3.5">
          <span className="text-xs text-slate-400 font-medium">Ready to test your recall or solve this problem?</span>
          <button
            onClick={() => onAttemptProblem(problem, problem.attempts && problem.attempts.length > 0 ? 'review' : 'fresh')}
            className={isDue ? "mac-btn-rose px-5 py-2.5 text-xs font-bold shadow-lg" : "mac-btn-primary px-5 py-2.5 text-xs font-bold shadow-lg"}
          >
            <Play className="h-3.5 w-3.5 fill-current" />
            <span>Record Attempt Now</span>
          </button>
        </div>

        {/* Comments & Discussion Section */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <MessageSquare className="h-4 w-4 text-indigo-400" />
            <h3 className="text-base font-bold font-heading text-white">Problem Notes & Discussion</h3>
          </div>

          {/* Add Comment Form */}
          <form onSubmit={handleAddComment} className="flex items-start space-x-2">
            <textarea
              rows={2}
              placeholder="Add an edge-case reminder, runtime observation, or mental model for this problem..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="flex-1 px-3 py-2 rounded-xl mac-input text-xs text-white placeholder-slate-500"
            />
            <button
              type="submit"
              disabled={isSubmittingComment || !newComment.trim()}
              className="mac-btn-primary px-4 py-2.5 text-xs font-bold disabled:opacity-50 flex items-center space-x-1.5 h-full"
            >
              <Send className="h-3.5 w-3.5" />
              <span>Post</span>
            </button>
          </form>

          {/* Comments List */}
          {problem.comments && problem.comments.length > 0 ? (
            <div className="space-y-2">
              {problem.comments.map((comment) => (
                <div key={comment.id} className="glass-card rounded-xl p-3 border border-white/10 text-xs space-y-1 relative group">
                  <div className="flex items-center justify-between text-slate-400 text-[11px]">
                    <span className="font-semibold text-slate-300">
                      {new Date(comment.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <button
                      onClick={() => handleDeleteComment(comment.id)}
                      className="text-slate-500 hover:text-rose-400 p-1 opacity-70 group-hover:opacity-100 transition-opacity"
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
            <p className="text-xs text-slate-400 italic">No notes or comments added yet.</p>
          )}
        </div>

        {/* Solutions Section */}
        <div className="space-y-4 border-t border-white/10 pt-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold font-heading text-white">Solutions & Editorials</h3>
            <button
              onClick={() => setShowAddSolution(!showAddSolution)}
              className="mac-btn-secondary px-3 py-1.5 text-xs font-semibold rounded-xl flex items-center space-x-1.5"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>{showAddSolution ? 'Cancel' : 'Add Solution Link'}</span>
            </button>
          </div>

          {/* Add Solution Form */}
          {showAddSolution && (
            <form onSubmit={handleAddSolution} className="mac-glass rounded-xl p-4 border border-indigo-500/30 space-y-3 bg-black/40">
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-indigo-400">New Solution Link</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="Solution Title (e.g., Two Heaps approach, NeetCode Video)"
                  value={solTitle}
                  onChange={(e) => setSolTitle(e.target.value)}
                  required
                  className="px-3 py-2 rounded-xl mac-input text-xs text-white placeholder-slate-500"
                />
                <input
                  type="url"
                  placeholder="Solution URL (e.g. https://...)"
                  value={solUrl}
                  onChange={(e) => setSolUrl(e.target.value)}
                  className="px-3 py-2 rounded-xl mac-input text-xs text-white placeholder-slate-500"
                />
              </div>

              <textarea
                placeholder="Optional Solution Notes / Time Complexity summary..."
                value={solNotes}
                onChange={(e) => setSolNotes(e.target.value)}
                rows={2}
                className="w-full px-3 py-2 rounded-xl mac-input text-xs text-white placeholder-slate-500"
              />

              <div>
                <label className="text-[11px] text-slate-400 font-semibold block mb-1">
                  Solution Specific Tags:
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
                className="mac-btn-emerald py-2 px-4 text-xs font-bold"
              >
                Save Solution
              </button>
            </form>
          )}

          {/* Solutions List */}
          {problem.solutions && problem.solutions.length > 0 ? (
            <div className="grid gap-3">
              {problem.solutions.map((sol) => (
                <div key={sol.id} className="glass-card rounded-xl p-4 border border-white/10 space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-white">{sol.title}</h4>
                      {sol.url && (
                        <a
                          href={sol.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-sky-400 hover:text-sky-300 hover:underline flex items-center space-x-1 mt-0.5"
                        >
                          <ExternalLink className="h-3 w-3 inline" />
                          <span>{sol.url}</span>
                        </a>
                      )}
                    </div>

                    <button
                      onClick={() => handleDeleteSolution(sol.id)}
                      className="text-slate-400 hover:text-rose-400 p-1"
                      title="Delete Solution"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  {sol.notes && (
                    <p className="text-xs text-slate-300 bg-black/40 p-2.5 rounded-lg border border-white/5 whitespace-pre-wrap">
                      {sol.notes}
                    </p>
                  )}

                  {sol.tags && sol.tags.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1 pt-1">
                      <span className="text-[11px] text-slate-400">Solution Tags:</span>
                      {sol.tags.map((st) => (
                        <span key={st.id} className="text-[10px] px-2 py-0.5 rounded-md bg-indigo-950/80 text-indigo-300 border border-indigo-500/25">
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
        <div className="space-y-3 border-t border-white/10 pt-4">
          <h3 className="text-base font-bold font-heading text-white">Attempt History</h3>
          {problem.attempts && problem.attempts.length > 0 ? (
            <div className="space-y-2">
              {problem.attempts.map((att) => (
                <div key={att.id} className="flex items-center justify-between p-3 rounded-xl bg-black/30 border border-white/10 text-xs">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className={`px-2.5 py-0.5 rounded-full font-bold uppercase text-[10px] ${
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
