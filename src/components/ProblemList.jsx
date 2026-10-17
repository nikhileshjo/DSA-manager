import React from 'react';
import { Search, Plus, BookOpen, ExternalLink, Tag as TagIcon, Trash2, Edit3, Eye, Play, X, RotateCcw, Filter, Calendar } from 'lucide-react';

export default function ProblemList({
  problems = [],
  tags = [],
  filters,
  setFilters,
  onViewProblemDetails,
  onAttemptProblem,
  onEditProblem,
  onDeleteProblem,
  onOpenAddProblem,
}) {
  const hasActiveFilters = Boolean(
    filters.search ||
    filters.difficulty ||
    filters.sourceType ||
    filters.tagId ||
    filters.dueStatus ||
    filters.attemptedStatus
  );

  const handleClearFilters = () => {
    setFilters({
      search: '',
      difficulty: '',
      sourceType: '',
      tagId: '',
      dueStatus: '',
      attemptedStatus: '',
    });
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Search and Filters Header */}
      <div className="mac-glass rounded-2xl p-6 border border-white/10 space-y-5 shadow-2xl relative">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[11px] uppercase tracking-wider font-bold text-sky-400">Library</span>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-sky-500/15 text-sky-300 border border-sky-500/30">
                {problems.length} {problems.length === 1 ? 'Problem' : 'Problems'}
              </span>
            </div>
            <h2 className="text-2xl font-bold font-heading text-white mt-1">Problem Repository</h2>
          </div>

          {/* Big Prominent Easy-To-Find Add Button */}
          <button
            onClick={onOpenAddProblem}
            className="mac-btn-emerald py-2.5 px-4 rounded-xl flex items-center space-x-2 font-bold text-xs shadow-lg"
          >
            <Plus className="h-4 w-4 stroke-[2.5]" />
            <span>Add New Problem</span>
          </button>
        </div>

        {/* Mac Spotlight Search Bar */}
        <div className="relative">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search problems by title, book name, notes... (Spotlight)"
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            className="w-full pl-10 pr-10 py-2.5 rounded-xl mac-input text-xs text-white placeholder-slate-400 font-medium"
          />
          {filters.search && (
            <button
              onClick={() => setFilters({ ...filters, search: '' })}
              className="absolute right-3 top-2.5 p-1 rounded-full text-slate-400 hover:text-white hover:bg-white/10"
              title="Clear search"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Filters Toolbar */}
        <div className="space-y-2 pt-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center space-x-1.5">
              <Filter className="h-3 w-3 text-indigo-400" />
              <span>Filters</span>
            </span>

            {hasActiveFilters && (
              <button
                onClick={handleClearFilters}
                className="text-[11px] text-indigo-300 hover:text-indigo-200 font-semibold flex items-center space-x-1 py-0.5 px-2 rounded-lg bg-indigo-500/15 border border-indigo-500/30 transition-colors"
              >
                <RotateCcw className="h-3 w-3" />
                <span>Reset Filters</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5">
            {/* Difficulty */}
            <div>
              <label className="text-[10px] font-semibold text-slate-400 block mb-1">Difficulty</label>
              <select
                value={filters.difficulty}
                onChange={(e) => setFilters({ ...filters, difficulty: e.target.value })}
                className="w-full px-2.5 py-1.5 rounded-lg mac-input text-xs text-slate-200"
              >
                <option value="">All Difficulties</option>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>

            {/* Source Type */}
            <div>
              <label className="text-[10px] font-semibold text-slate-400 block mb-1">Source</label>
              <select
                value={filters.sourceType}
                onChange={(e) => setFilters({ ...filters, sourceType: e.target.value })}
                className="w-full px-2.5 py-1.5 rounded-lg mac-input text-xs text-slate-200"
              >
                <option value="">All Sources</option>
                <option value="leetcode">LeetCode</option>
                <option value="codeforces">Codeforces</option>
                <option value="hackerrank">HackerRank</option>
                <option value="book">Book</option>
                <option value="url">URL</option>
                <option value="other">Other</option>
              </select>
            </div>

            {/* Tag */}
            <div>
              <label className="text-[10px] font-semibold text-slate-400 block mb-1">Tag</label>
              <select
                value={filters.tagId}
                onChange={(e) => setFilters({ ...filters, tagId: e.target.value })}
                className="w-full px-2.5 py-1.5 rounded-lg mac-input text-xs text-slate-200"
              >
                <option value="">All Tags</option>
                {tags.map((t) => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>

            {/* Due Status */}
            <div>
              <label className="text-[10px] font-semibold text-slate-400 block mb-1">Due Status</label>
              <select
                value={filters.dueStatus}
                onChange={(e) => setFilters({ ...filters, dueStatus: e.target.value })}
                className="w-full px-2.5 py-1.5 rounded-lg mac-input text-xs text-slate-200"
              >
                <option value="">All Due Statuses</option>
                <option value="due">Due Today / Overdue</option>
                <option value="upcoming">Upcoming</option>
              </select>
            </div>

            {/* Attempt Status */}
            <div>
              <label className="text-[10px] font-semibold text-slate-400 block mb-1">Attempt Status</label>
              <select
                value={filters.attemptedStatus}
                onChange={(e) => setFilters({ ...filters, attemptedStatus: e.target.value })}
                className="w-full px-2.5 py-1.5 rounded-lg mac-input text-xs text-slate-200"
              >
                <option value="">All Problems</option>
                <option value="attempted">Attempted</option>
                <option value="unattempted">Unattempted (Fresh)</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Problems List */}
      <div className="grid gap-3.5">
        {problems.length === 0 ? (
          <div className="mac-glass rounded-2xl p-12 text-center text-slate-400 border border-white/10 space-y-3">
            <p className="text-sm">No problems found matching your current filter criteria.</p>
            {hasActiveFilters && (
              <button
                onClick={handleClearFilters}
                className="mac-btn-secondary px-4 py-2 text-xs font-semibold rounded-xl inline-flex items-center space-x-1.5"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Reset All Filters</span>
              </button>
            )}
          </div>
        ) : (
          problems.map((prob) => {
            const isDue = prob.next_review && new Date(prob.next_review) <= new Date();

            return (
              <div
                key={prob.id}
                className={`glass-card glass-card-hover rounded-2xl p-5 border flex flex-wrap items-center justify-between gap-4 transition-all ${
                  isDue ? 'border-rose-500/30' : 'border-white/10'
                }`}
              >
                <div className="space-y-2 max-w-2xl">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase ${
                      prob.difficulty === 'easy' ? 'badge-easy' : prob.difficulty === 'medium' ? 'badge-medium' : 'badge-hard'
                    }`}>
                      {prob.difficulty}
                    </span>

                    <span className="text-[10px] px-2 py-0.5 rounded-md bg-black/40 text-slate-300 font-semibold border border-white/10 uppercase">
                      {prob.source_type}
                    </span>

                    {prob.attempt_count > 0 ? (
                      <span className="text-[10px] px-2 py-0.5 rounded-md bg-indigo-950/70 text-indigo-300 font-semibold border border-indigo-500/25">
                        {prob.attempt_count} {prob.attempt_count === 1 ? 'attempt' : 'attempts'} {prob.last_result ? `(Last: ${prob.last_result})` : ''}
                      </span>
                    ) : (
                      <span className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-950/70 text-emerald-300 font-semibold border border-emerald-500/25">
                        Unattempted (Fresh)
                      </span>
                    )}

                    {isDue && (
                      <span className="text-[10px] px-2 py-0.5 rounded-md bg-rose-950/70 text-rose-300 font-semibold border border-rose-500/30 animate-pulse">
                        Review Due Today
                      </span>
                    )}
                  </div>

                  <h3
                    onClick={() => onViewProblemDetails(prob.id)}
                    className="text-base font-bold text-white hover:text-indigo-300 cursor-pointer transition-colors"
                  >
                    {prob.title}
                  </h3>

                  {/* Book details or source URL */}
                  {prob.source_type === 'book' && prob.book_name && (
                    <div className="text-xs text-slate-400 flex items-center space-x-1.5">
                      <BookOpen className="h-3.5 w-3.5 text-indigo-400" />
                      <span>{prob.book_name} {prob.book_page ? `(Page ${prob.book_page})` : ''} {prob.book_problem_number ? `#${prob.book_problem_number}` : ''}</span>
                    </div>
                  )}

                  {prob.source_url && (
                    <a
                      href={prob.source_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-sky-400 hover:text-sky-300 hover:underline flex items-center space-x-1.5 font-medium"
                    >
                      <ExternalLink className="h-3 w-3 inline" />
                      <span className="truncate max-w-md">{prob.source_url}</span>
                    </a>
                  )}

                  {/* Problem Tags */}
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

                {/* Right side: Easy-to-find Action Buttons */}
                <div className="flex items-center space-x-2">
                  {/* Primary CTA: Record Attempt */}
                  <button
                    onClick={() => onAttemptProblem(prob, prob.attempt_count > 0 ? 'review' : 'fresh')}
                    className={isDue ? "mac-btn-rose px-3.5 py-2 text-xs font-bold" : "mac-btn-primary px-3.5 py-2 text-xs font-bold"}
                  >
                    <Play className="h-3.5 w-3.5 fill-current" />
                    <span>Attempt</span>
                  </button>

                  {/* Secondary: Details */}
                  <button
                    onClick={() => onViewProblemDetails(prob.id)}
                    className="mac-btn-secondary px-3 py-2 text-xs font-semibold rounded-xl flex items-center space-x-1"
                    title="View Problem Details"
                  >
                    <Eye className="h-3.5 w-3.5" />
                    <span>View</span>
                  </button>

                  {/* Secondary: Edit */}
                  <button
                    onClick={() => onEditProblem(prob)}
                    className="mac-btn-secondary p-2 rounded-xl text-slate-300 hover:text-white"
                    title="Edit Problem"
                  >
                    <Edit3 className="h-3.5 w-3.5" />
                  </button>

                  {/* Danger: Delete */}
                  <button
                    onClick={() => onDeleteProblem(prob.id)}
                    className="mac-btn-danger p-2 rounded-xl text-rose-300"
                    title="Delete Problem"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
