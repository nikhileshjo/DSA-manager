import React, { useState, useRef, useEffect } from 'react';
import { Tag as TagIcon, X, Plus, ChevronDown } from 'lucide-react';
import { api } from '../api/client';

export default function TagSelector({
  selectedTags = [], // Array of string tag names (e.g. ["Array", "Heap"])
  onChange, // (newTagsArray: string[]) => void
  availableTags = [], // Array of { id, name } objects
  onTagCreated, // () => void
  placeholder = 'Select or search tags...',
}) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const containerRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter available tags that are not already selected
  const normalizedSelectedLower = selectedTags.map((t) => t.toLowerCase());

  const filteredTags = availableTags.filter((t) => {
    const isAlreadySelected = normalizedSelectedLower.includes(t.name.toLowerCase());
    const matchesQuery = t.name.toLowerCase().includes(query.toLowerCase().trim());
    return !isAlreadySelected && matchesQuery;
  });

  // Check if typed query exact match exists
  const exactMatchExists = availableTags.some(
    (t) => t.name.toLowerCase() === query.trim().toLowerCase()
  );

  const canCreateNew = query.trim().length > 0 && !exactMatchExists && !normalizedSelectedLower.includes(query.trim().toLowerCase());

  const handleSelectTag = (tagName) => {
    if (!normalizedSelectedLower.includes(tagName.toLowerCase())) {
      onChange([...selectedTags, tagName]);
    }
    setQuery('');
    setIsOpen(false);
  };

  const handleRemoveTag = (tagNameToRemove) => {
    onChange(selectedTags.filter((t) => t.toLowerCase() !== tagNameToRemove.toLowerCase()));
  };

  const handleCreateNewTag = async () => {
    const newTagName = query.trim();
    if (!newTagName) return;

    try {
      setCreating(true);
      await api.createTag(newTagName);
      if (onTagCreated) {
        await onTagCreated();
      }
      handleSelectTag(newTagName);
    } catch (err) {
      console.error('Error creating tag:', err);
      // Fallback: select it locally
      handleSelectTag(newTagName);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div ref={containerRef} className="relative space-y-2">
      {/* Selected Tag Badges */}
      <div className="flex flex-wrap items-center gap-1.5 min-h-[32px]">
        {selectedTags.map((tagName) => (
          <span
            key={tagName}
            className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-indigo-950/80 text-indigo-200 border border-indigo-500/30 text-xs font-semibold"
          >
            <TagIcon className="h-3 w-3 text-indigo-400" />
            <span>{tagName}</span>
            <button
              type="button"
              onClick={() => handleRemoveTag(tagName)}
              className="text-indigo-400 hover:text-indigo-100 rounded p-0.5"
              title="Remove tag"
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
      </div>

      {/* Select / Search Input */}
      <div className="relative">
        <div
          onClick={() => setIsOpen(true)}
          className="flex items-center justify-between w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white cursor-text focus-within:border-indigo-500 transition-all"
        >
          <input
            type="text"
            placeholder={selectedTags.length === 0 ? placeholder : 'Add more tags...'}
            value={query}
            onFocus={() => setIsOpen(true)}
            onChange={(e) => {
              setQuery(e.target.value);
              setIsOpen(true);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                if (canCreateNew) {
                  handleCreateNewTag();
                } else if (filteredTags.length > 0) {
                  handleSelectTag(filteredTags[0].name);
                }
              }
            }}
            className="w-full bg-transparent text-white placeholder-slate-500 focus:outline-none"
          />
          <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </div>

        {/* Dropdown Options */}
        {isOpen && (
          <div className="absolute z-50 left-0 right-0 mt-1 max-h-48 overflow-y-auto rounded-xl bg-slate-900 border border-slate-700 shadow-2xl p-1 text-xs">
            {/* Create option if query typed */}
            {canCreateNew && (
              <button
                type="button"
                onClick={handleCreateNewTag}
                disabled={creating}
                className="w-full text-left px-3 py-2 rounded-lg bg-indigo-950/60 hover:bg-indigo-900/80 text-indigo-300 font-bold flex items-center space-x-2 transition-all mb-1"
              >
                <Plus className="h-4 w-4 text-indigo-400" />
                <span>Add <strong>"{query.trim()}"</strong> as a new tag</span>
              </button>
            )}

            {/* List of existing available tags */}
            {filteredTags.length > 0 ? (
              filteredTags.map((tag) => (
                <button
                  type="button"
                  key={tag.id || tag.name}
                  onClick={() => handleSelectTag(tag.name)}
                  className="w-full text-left px-3 py-2 rounded-lg text-slate-200 hover:bg-slate-800 hover:text-white flex items-center justify-between transition-all"
                >
                  <span className="flex items-center space-x-2">
                    <TagIcon className="h-3 w-3 text-slate-400" />
                    <span>{tag.name}</span>
                  </span>
                  {tag.problem_count !== undefined && (
                    <span className="text-[10px] text-slate-500 font-mono">{tag.problem_count} problems</span>
                  )}
                </button>
              ))
            ) : !canCreateNew ? (
              <div className="px-3 py-2 text-slate-500 italic text-center">
                No matching tags found. Type a name to create one!
              </div>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}
