import React, { useState } from 'react';
import { Search, Filter, Plus, BookOpen, ExternalLink, Tag as TagIcon, Trash2, Edit3, Eye, Calendar, CheckCircle2 } from 'lucide-react';

export default function ProblemList({
  problems,
  tags,
  filters,
  setFilters,
  onViewProblemDetails,
  onAttemptProblem,
  onEditProblem,
  onDeleteProblem,
  onOpenAddProblem,
}) {
  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Search and Filters Header */}
      <div className="glass-card rounded-2xl p-6 border border-slate-800 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold font-heading text-white">Problem Repository</h2>
            <p className="text-xs text-slate-400">Search, filter, and manage your saved DSA problems</p>
          </div>

          <button
            onClick={onOpenAddProblem}
            className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-indigo-600 text-white font-semibold text-sm shadow-md shadow-indigo-600/20 hover:bg-indigo-500 transition-all"
          >
            <Plus className="h-4 w-4" />
            <span>Add New Problem</span>
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search problems by title, book name..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-all"
          />
        </div>

        {/* Filters Grid */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 pt-2">
          {/* Difficulty */}
          <div>
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Difficulty</label>
            <select
              value={filters.difficulty}
              onChange={(e) => setFilters({ ...filters, difficulty: e.target.value })}
              className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              <option value="">All Difficulties</option>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>

          {/* Source Type */}
          <div>
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Source</label>
            <select
              value={filters.sourceType}
              onChange={(e) => setFilters({ ...filters, sourceType: e.target.value })}
              className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
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
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Tag</label>
            <select
              value={filters.tagId}
              onChange={(e) => setFilters({ ...filters, tagId: e.target.value })}
              className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              <option value="">All Tags</option>
              {tags.map((t) => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>

          {/* Due Status */}
          <div>
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Due Status</label>
            <select
              value={filters.dueStatus}
              onChange={(e) => setFilters({ ...filters, dueStatus: e.target.value })}
              className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              <option value="">All Due Statuses</option>
              <option value="due">Due Today / Overdue</option>
              <option value="upcoming">Upcoming</option>
            </select>
          </div>

          {/* Attempt Status */}
          <div>
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Attempt Status</label>
            <select
              value={filters.attemptedStatus}
              onChange={(e) => setFilters({ ...filters, attemptedStatus: e.target.value })}
              className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              <option value="">All Problems</option>
              <option value="attempted">Attempted</option>
              <option value="unattempted">Unattempted (Fresh)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Problems List */}
      <div className="grid gap-4">
        {problems.length === 0 ? (
          <div className="glass-card rounded-2xl p-12 text-center text-slate-400 border border-slate-800">
            No problems match your current filters.
          </div>
        ) : (
          problems.map((prob) => {
            const isDue = prob.next_review && new Date(prob.next_review) <= new Date();

            return (
              <div
                key={prob.id}
                className="glass-card glass-card-hover rounded-xl p-5 border border-slate-800 flex flex-wrap items-start justify-between gap-4 transition-all"
              >
                <div className="space-y-2 max-w-2xl">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold uppercase ${
                      prob.difficulty === 'easy' ? 'badge-easy' : prob.difficulty === 'medium' ? 'badge-medium' : 'badge-hard'
                    }`}>
                      {prob.difficulty}
                    </span>

                    <span className="text-xs px-2 py-0.5 rounded bg-slate-900 text-slate-300 font-semibold border border-slate-800 uppercase">
                      {prob.source_type}
                    </span>

                    {prob.attempt_count > 0 ? (
                      <span className="text-xs px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 font-semibold border border-indigo-500/20">
                        {prob.attempt_count} attempts {prob.last_result ? `(Last: ${prob.last_result})` : ''}
                      </span>
                    ) : (
                      <span className="text-xs px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 font-semibold border border-emerald-500/20">
                        Unattempted (Fresh)
                      </span>
                    )}

                    {isDue && (
                      <span className="text-xs px-2 py-0.5 rounded bg-rose-950 text-rose-300 font-semibold border border-rose-500/20">
                        Review Due
                      </span>
                    )}
                  </div>

                  <h3
                    onClick={() => onViewProblemDetails(prob.id)}
                    className="text-lg font-bold text-white hover:text-indigo-400 cursor-pointer transition-colors"
                  >
                    {prob.title}
                  </h3>

                  {/* Book details or source URL */}
                  {prob.source_type === 'book' && prob.book_name && (
                    <div className="text-xs text-slate-400 flex items-center space-x-1">
                      <BookOpen className="h-3.5 w-3.5 text-indigo-400" />
                      <span>{prob.book_name} {prob.book_page ? `(Page ${prob.book_page})` : ''} {prob.book_problem_number ? `#${prob.book_problem_number}` : ''}</span>
                    </div>
                  )}

                  {prob.source_url && (
                    <a
                      href={prob.source_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-indigo-400 hover:underline flex items-center space-x-1"
                    >
                      <ExternalLink className="h-3 w-3 inline" />
                      <span>{prob.source_url}</span>
                    </a>
                  )}

                  {/* Problem Tags */}
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

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => onViewProblemDetails(prob.id)}
                    className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 transition-all text-xs font-semibold flex items-center space-x-1"
                    title="View Details & Solutions"
                  >
                    <Eye className="h-4 w-4" />
                    <span>View</span>
                  </button>

                  <button
                    onClick={() => onAttemptProblem(prob, prob.attempt_count > 0 ? 'review' : 'fresh')}
                    className="px-3 py-2 rounded-lg bg-indigo-600 text-white text-xs font-bold shadow hover:bg-indigo-500 transition-all"
                  >
                    Record Attempt
                  </button>

                  <button
                    onClick={() => onEditProblem(prob)}
                    className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
                    title="Edit Problem"
                  >
                    <Edit3 className="h-4 w-4" />
                  </button>

                  <button
                    onClick={() => onDeleteProblem(prob.id)}
                    className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 transition-all"
                    title="Delete Problem"
                  >
                    <Trash2 className="h-4 w-4" />
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
