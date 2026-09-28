'use client';

import React, { useState } from 'react';
import { Copy, Check, Bookmark, FileText, ChevronDown, ChevronUp, Layers, Info } from 'lucide-react';

interface OptimizedPromptResultProps {
  optimizedPrompt: string;
  changes: { add: string; why: string }[];
  assumptions: string[];
  targetToolName: string;
  onSavePrompt?: (title: string) => void;
}

export function OptimizedPromptResult({
  optimizedPrompt,
  changes,
  assumptions,
  targetToolName,
  onSavePrompt,
}: OptimizedPromptResultProps) {
  const [copied, setCopied] = useState(false);
  const [showDiff, setShowDiff] = useState(true);
  const [showAssumptions, setShowAssumptions] = useState(true);
  const [saveTitle, setSaveTitle] = useState('');
  const [isSaved, setIsSaved] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(optimizedPrompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!saveTitle.trim()) return;
    if (onSavePrompt) {
      onSavePrompt(saveTitle);
    }
    setIsSaved(true);
  };

  return (
    <div className="w-full space-y-6">
      {/* Optimized Prompt Output Box */}
      <div className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="px-5 py-3.5 bg-zinc-50 dark:bg-zinc-950/80 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
              Structured Prompt (Tuned for {targetToolName})
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                copied
                  ? 'bg-emerald-600 text-white'
                  : 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 hover:opacity-90'
              }`}
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Prompt</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Prompt Markdown Content */}
        <div className="p-5 sm:p-6 bg-zinc-900 text-zinc-100 font-mono text-xs sm:text-sm leading-relaxed overflow-x-auto whitespace-pre-wrap rounded-b-2xl">
          {optimizedPrompt}
        </div>
      </div>

      {/* Changes & Assumptions Accordions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* What Changed and Why */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm">
          <button
            onClick={() => setShowDiff(!showDiff)}
            className="w-full flex items-center justify-between text-left font-bold text-sm text-zinc-900 dark:text-zinc-100 pb-2 border-b border-zinc-100 dark:border-zinc-800"
          >
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-500" />
              <span>What Changed & Why ({changes.length})</span>
            </div>
            {showDiff ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {showDiff && (
            <ul className="mt-4 space-y-3 text-xs">
              {changes.map((c, i) => (
                <li key={i} className="flex items-start gap-2 text-zinc-700 dark:text-zinc-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                  <div>
                    <span className="font-semibold">{c.add}:</span>{' '}
                    <span className="text-zinc-500 dark:text-zinc-400">{c.why}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Assumptions Applied */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm">
          <button
            onClick={() => setShowAssumptions(!showAssumptions)}
            className="w-full flex items-center justify-between text-left font-bold text-sm text-zinc-900 dark:text-zinc-100 pb-2 border-b border-zinc-100 dark:border-zinc-800"
          >
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 text-amber-500" />
              <span>Assumptions Applied ({assumptions.length})</span>
            </div>
            {showAssumptions ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {showAssumptions && (
            <ul className="mt-4 space-y-2 text-xs">
              {assumptions.map((a, i) => (
                <li key={i} className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                  <span>{a}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Save Prompt Section */}
      <div className="bg-gradient-to-r from-zinc-50 to-zinc-100 dark:from-zinc-900 dark:to-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm">
        <form onSubmit={handleSave} className="flex flex-col sm:flex-row items-center gap-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-zinc-800 dark:text-zinc-200 shrink-0">
            <Bookmark className="w-4 h-4 text-emerald-600" />
            <span>Save to My Library</span>
          </div>

          <input
            type="text"
            placeholder="Enter prompt title (e.g. React Todo App)..."
            value={saveTitle}
            onChange={(e) => setSaveTitle(e.target.value)}
            disabled={isSaved}
            className="flex-1 w-full text-xs sm:text-sm px-3.5 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />

          <button
            type="submit"
            disabled={isSaved || !saveTitle.trim()}
            className={`w-full sm:w-auto px-5 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 transition-all ${
              isSaved
                ? 'bg-emerald-600 text-white cursor-default'
                : saveTitle.trim()
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/20'
                : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-400 cursor-not-allowed'
            }`}
          >
            {isSaved ? (
              <>
                <Check className="w-4 h-4 stroke-[3]" />
                <span>Saved!</span>
              </>
            ) : (
              <span>Save Prompt</span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
