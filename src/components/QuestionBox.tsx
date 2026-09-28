'use client';

import React, { useState } from 'react';
import { ClarifyingQuestion } from '../lib/mockData';
import { HelpCircle, Check, FastForward, Sparkles } from 'lucide-react';

interface QuestionBoxProps {
  questions: ClarifyingQuestion[];
  onSubmitAnswers: (answers: Record<string, string>) => void;
  onSkipAll: () => void;
}

export function QuestionBox({ questions, onSubmitAnswers, onSkipAll }: QuestionBoxProps) {
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [customInput, setCustomInput] = useState<Record<string, string>>({});

  const handleSelectOption = (qId: string, option: string) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [qId]: option,
    }));
  };

  const handleCustomChange = (qId: string, text: string) => {
    setCustomInput((prev) => ({ ...prev, [qId]: text }));
    if (text.trim()) {
      setSelectedAnswers((prev) => ({ ...prev, [qId]: text }));
    }
  };

  const answeredCount = Object.keys(selectedAnswers).filter(
    (k) => selectedAnswers[k] && selectedAnswers[k].trim().length > 0
  ).length;

  const handleFinish = () => {
    onSubmitAnswers(selectedAnswers);
  };

  return (
    <div className="w-full bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-200/80 dark:border-indigo-800/50 rounded-2xl p-5 sm:p-6 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-indigo-100 dark:border-indigo-900/40">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-sm">
            <HelpCircle className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
              Clarifying Questions (2–4 Max)
            </h3>
            <p className="text-xs text-zinc-600 dark:text-zinc-400">
              Answer the questions below or tap Skip to use intelligent defaults.
            </p>
          </div>
        </div>

        <button
          onClick={onSkipAll}
          className="self-start sm:self-auto flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border border-indigo-300 dark:border-indigo-700/60 bg-white dark:bg-zinc-900 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-all"
        >
          <FastForward className="w-3.5 h-3.5" />
          <span>Skip & Use Defaults</span>
        </button>
      </div>

      {/* Question Cards */}
      <div className="mt-5 space-y-6">
        {questions.map((q, idx) => {
          const currentAnswer = selectedAnswers[q.id];

          return (
            <div
              key={q.id}
              className="bg-white dark:bg-zinc-900 rounded-xl p-4 border border-zinc-200/80 dark:border-zinc-800 shadow-xs"
            >
              <div className="flex items-start gap-2.5 mb-3">
                <span className="w-5 h-5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                  {idx + 1}
                </span>
                <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                  {q.question}
                </p>
              </div>

              {/* Tappable Option Pills */}
              <div className="flex flex-wrap gap-2 ml-7">
                {q.options.map((opt) => {
                  const isSelected = currentAnswer === opt;
                  return (
                    <button
                      key={opt}
                      onClick={() => handleSelectOption(q.id, opt)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                        isSelected
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                          : 'bg-zinc-50 dark:bg-zinc-800/70 border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                      }`}
                    >
                      {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      <span>{opt}</span>
                    </button>
                  );
                })}
              </div>

              {/* Custom Answer Input */}
              <div className="ml-7 mt-3">
                <input
                  type="text"
                  placeholder="Or type a custom answer..."
                  value={customInput[q.id] || ''}
                  onChange={(e) => handleCustomChange(q.id, e.target.value)}
                  className="w-full text-xs px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Submit Action */}
      <div className="mt-6 flex items-center justify-between pt-4 border-t border-indigo-100 dark:border-indigo-900/40">
        <span className="text-xs text-zinc-500 font-medium">
          {answeredCount} of {questions.length} answered
        </span>

        <button
          onClick={handleFinish}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold text-sm shadow-md shadow-indigo-600/20 transition-all"
        >
          <Sparkles className="w-4 h-4" />
          <span>Generate Structured Prompt</span>
        </button>
      </div>
    </div>
  );
}
