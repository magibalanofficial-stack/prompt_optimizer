'use client';

import React from 'react';
import { PromptScores, scoreOf, tierOf, DIMENSION_LABELS } from '../lib/tiers';
import { ArrowUpRight, CheckCircle2 } from 'lucide-react';

interface ScoreCardProps {
  originalScores: PromptScores;
  optimizedScores?: PromptScores;
}

export function ScoreCard({ originalScores, optimizedScores }: ScoreCardProps) {
  const origScore = scoreOf(originalScores);
  const origTier = tierOf(origScore);

  const optScore = optimizedScores ? scoreOf(optimizedScores) : null;
  const optTier = optScore !== null ? tierOf(optScore) : null;

  const scoreDiff = optScore !== null ? optScore - origScore : 0;

  const dimensions: (keyof PromptScores)[] = [
    'goal',
    'context',
    'stack',
    'requirements',
    'constraints',
    'acceptance',
    'scope',
  ];

  return (
    <div className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 sm:p-6 shadow-sm">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-zinc-100 dark:border-zinc-800/80">
        {/* Score comparison */}
        <div className="flex items-center gap-4 sm:gap-6">
          {/* Before Badge */}
          <div className="flex flex-col items-center">
            <span className="text-xs uppercase tracking-wider text-zinc-500 font-semibold mb-1">
              Before Score
            </span>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-extrabold text-zinc-800 dark:text-zinc-200">
                {origScore}
              </span>
              <span className="text-xs text-zinc-400">/100</span>
            </div>
            <span
              className={`mt-1.5 text-xs px-2.5 py-0.5 rounded-full font-medium border ${origTier.badgeBg} ${origTier.badgeText}`}
            >
              {origTier.label}
            </span>
          </div>

          {optScore !== null && optTier && (
            <>
              {/* Arrow */}
              <div className="flex flex-col items-center justify-center text-emerald-500">
                <div className="w-8 h-8 rounded-full bg-emerald-50 dark:bg-emerald-950/60 flex items-center justify-center border border-emerald-500/20">
                  <ArrowUpRight className="w-5 h-5 stroke-[2.5]" />
                </div>
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                  +{scoreDiff} pts
                </span>
              </div>

              {/* After Badge */}
              <div className="flex flex-col items-center">
                <span className="text-xs uppercase tracking-wider text-emerald-600 dark:text-emerald-400 font-semibold mb-1">
                  Optimized Score
                </span>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">
                    {optScore}
                  </span>
                  <span className="text-xs text-zinc-400">/100</span>
                </div>
                <span
                  className={`mt-1.5 text-xs px-2.5 py-0.5 rounded-full font-medium border ${optTier.badgeBg} ${optTier.badgeText}`}
                >
                  {optTier.label}
                </span>
              </div>
            </>
          )}
        </div>

        {/* Quality Tier legend / callout */}
        <div className="bg-zinc-50 dark:bg-zinc-950 p-3.5 rounded-xl border border-zinc-100 dark:border-zinc-800 text-xs text-zinc-600 dark:text-zinc-400 max-w-xs">
          <div className="flex items-center gap-1.5 text-zinc-900 dark:text-zinc-200 font-medium mb-1">
            <CheckCircle2 className="w-4 h-4 text-indigo-500" />
            <span>7 Quality Dimensions</span>
          </div>
          <p>
            Prompts are scored across clarity, tech stack, testable requirements, limits, definition of done, and single-pass build scope.
          </p>
        </div>
      </div>

      {/* Per-dimension breakdown bars */}
      <div className="mt-6">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-4">
          Dimension Breakdown
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3.5">
          {dimensions.map((dim) => {
            const origVal = originalScores[dim] ?? 0;
            const optVal = optimizedScores ? optimizedScores[dim] ?? 0 : null;
            const meta = DIMENSION_LABELS[dim];

            return (
              <div key={dim} className="flex flex-col gap-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-zinc-700 dark:text-zinc-300">
                    {meta.name}
                  </span>
                  <div className="flex items-center gap-2 font-mono text-[11px]">
                    <span className="text-zinc-500">{origVal}/10</span>
                    {optVal !== null && (
                      <>
                        <span className="text-zinc-400">→</span>
                        <span className="font-bold text-emerald-600 dark:text-emerald-400">
                          {optVal}/10
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* Dual progress bar */}
                <div className="w-full h-2 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden relative">
                  {/* Original bar */}
                  <div
                    className="h-full bg-zinc-400 dark:bg-zinc-600 rounded-full transition-all duration-500 absolute top-0 left-0"
                    style={{ width: `${(origVal / 10) * 100}%` }}
                  />
                  {/* Optimized overlay bar */}
                  {optVal !== null && (
                    <div
                      className="h-full bg-emerald-500 rounded-full transition-all duration-500 absolute top-0 left-0 opacity-85"
                      style={{ width: `${(optVal / 10) * 100}%` }}
                    />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
