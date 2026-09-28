'use client';

import React, { useState } from 'react';
import { QUALITY_TIERS, tierOf } from '../lib/tiers';
import { Search, Copy, Check, Trash2, Tag, Bookmark } from 'lucide-react';

export interface SavedPromptItem {
  id: string;
  title: string;
  original: string;
  optimized: string;
  tool: string;
  taskType: string;
  score: number;
  beforeScore: number;
  createdAt: string;
}

const INITIAL_SAVED_PROMPTS: SavedPromptItem[] = [
  {
    id: '1',
    title: 'React Todo App with LocalStorage',
    original: 'make me a todo app',
    optimized: `GOAL: Build a todo app with filtering and persistence.\nSTACK: React + Vite + Tailwind CSS.\nREQUIREMENTS: 1. Add item 2. Toggle complete 3. LocalStorage persistence`,
    tool: 'Cursor',
    taskType: 'New App',
    score: 91,
    beforeScore: 21,
    createdAt: '2026-09-28',
  },
  {
    id: '2',
    title: 'Fix Auth Form 401 Error',
    original: 'the login form gives a 401 error after submitting',
    optimized: `GOAL: Diagnose and fix 401 unauthorized status error on login submission.\nCONTEXT: Express JWT API + React Auth Provider.\nREQUIREMENTS: Check credentials header format & CORS configuration.`,
    tool: 'Claude Code',
    taskType: 'Fix Bug',
    score: 84,
    beforeScore: 32,
    createdAt: '2026-09-27',
  },
];

export function MyPromptsLibrary() {
  const [prompts, setPrompts] = useState<SavedPromptItem[]>(INITIAL_SAVED_PROMPTS);
  const [filterTier, setFilterTier] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDelete = (id: string) => {
    setPrompts((prev) => prev.filter((p) => p.id !== id));
  };

  const filteredPrompts = prompts.filter((p) => {
    const tier = tierOf(p.score);
    if (filterTier !== 'all' && tier.key !== filterTier) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        p.title.toLowerCase().includes(q) ||
        p.original.toLowerCase().includes(q) ||
        p.optimized.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 py-6">
      {/* Search & Filter Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <Bookmark className="w-5 h-5 text-emerald-600" />
            <span>My Saved Prompts ({prompts.length})</span>
          </h2>
          <p className="text-xs text-zinc-500">Search and organize your optimized prompts.</p>
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-zinc-400" />
          <input
            type="text"
            placeholder="Search prompts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs pl-9 pr-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>

      {/* Tier Filter Chips */}
      <div className="flex flex-wrap items-center gap-1.5">
        <button
          onClick={() => setFilterTier('all')}
          className={`px-3 py-1 rounded-full text-xs font-semibold border transition-all ${
            filterTier === 'all'
              ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 border-zinc-900'
              : 'bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100'
          }`}
        >
          All Tiers
        </button>

        {QUALITY_TIERS.map((tier) => {
          const isActive = filterTier === tier.key;
          return (
            <button
              key={tier.key}
              onClick={() => setFilterTier(tier.key)}
              className={`px-3 py-1 rounded-full text-xs font-semibold border transition-all ${
                isActive
                  ? `${tier.badgeBg} ${tier.badgeText} border-current`
                  : 'bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100'
              }`}
            >
              {tier.label} ({tier.minScore}–{tier.maxScore})
            </button>
          );
        })}
      </div>

      {/* Prompt List Cards */}
      {filteredPrompts.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-8">
          <Bookmark className="w-8 h-8 text-zinc-400 mx-auto mb-2" />
          <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
            No prompts found matching your criteria.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredPrompts.map((p) => {
            const tier = tierOf(p.score);
            return (
              <div
                key={p.id}
                className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-xs transition-all hover:border-zinc-300 dark:hover:border-zinc-700"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-100 dark:border-zinc-800">
                  <div>
                    <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">{p.title}</h3>
                    <div className="flex items-center gap-2 mt-1 text-xs text-zinc-500">
                      <span className="flex items-center gap-1">
                        <Tag className="w-3 h-3" />
                        {p.tool}
                      </span>
                      <span>•</span>
                      <span>{p.taskType}</span>
                      <span>•</span>
                      <span>{p.createdAt}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {/* Tier badge & scores */}
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-zinc-400 line-through">was {p.beforeScore}</span>
                      <span
                        className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${tier.badgeBg} ${tier.badgeText}`}
                      >
                        {p.score} ({tier.label})
                      </span>
                    </div>

                    <button
                      onClick={() => handleCopy(p.id, p.optimized)}
                      className="p-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 transition-all"
                      title="Copy Optimized Prompt"
                    >
                      {copiedId === p.id ? (
                        <Check className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>

                    <button
                      onClick={() => handleDelete(p.id)}
                      className="p-2 rounded-lg bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 hover:bg-red-100 transition-all"
                      title="Delete Prompt"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="mt-3 text-xs text-zinc-600 dark:text-zinc-400 font-mono bg-zinc-50 dark:bg-zinc-950 p-3 rounded-xl overflow-x-auto max-h-28">
                  {p.optimized}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
