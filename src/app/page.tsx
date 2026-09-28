'use client';

import React, { useState } from 'react';
import { Header } from '../components/Header';
import { ScoreCard } from '../components/ScoreCard';
import { QuestionBox } from '../components/QuestionBox';
import { OptimizedPromptResult } from '../components/OptimizedPromptResult';
import { MyPromptsLibrary } from '../components/MyPromptsLibrary';
import { SettingsView } from '../components/SettingsView';
import { AuthModal } from '../components/AuthModal';
import {
  TARGET_TOOLS,
  SAMPLE_ROUGH_PROMPTS,
  ClarifyingQuestion,
} from '../lib/mockData';
import { PromptScores } from '../lib/tiers';
import {
  Sparkles,
  ShieldAlert,
  ArrowRight,
  RefreshCw,
  Wand2,
  Terminal,
  AlertCircle,
} from 'lucide-react';

export default function Home() {
  const [activeTab, setActiveTab] = useState<'optimize' | 'library' | 'settings'>('optimize');
  const [authModalOpen, setAuthModalOpen] = useState(false);

  // Form state
  const [selectedTool, setSelectedTool] = useState(TARGET_TOOLS[0].id);
  const [roughPrompt, setRoughPrompt] = useState('');
  const [secretWarning, setSecretWarning] = useState(false);

  // Pipeline execution state
  const [step, setStep] = useState<'idle' | 'analyzed' | 'generated'>('idle');
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Analysis result state
  const [taskType, setTaskType] = useState<string>('new_app');
  const [originalScores, setOriginalScores] = useState<PromptScores | null>(null);
  const [questions, setQuestions] = useState<ClarifyingQuestion[]>([]);

  // Generation result state
  const [optimizedPrompt, setOptimizedPrompt] = useState<string>('');
  const [changes, setChanges] = useState<{ add: string; why: string }[]>([]);
  const [assumptions, setAssumptions] = useState<string[]>([]);
  const [optimizedScores, setOptimizedScores] = useState<PromptScores | null>(null);

  // Secret detection warning
  const handlePromptChange = (text: string) => {
    setRoughPrompt(text);
    setErrorMessage(null);
    const secretPattern = /(sk-[a-zA-Z0-9]{20,}|AKIA[0-9A-Z]{16}|ghp_[a-zA-Z0-9]{30,})/i;
    setSecretWarning(secretPattern.test(text));
  };

  // Step 1: Call /api/analyze
  const handleAnalyze = async () => {
    if (!roughPrompt.trim()) return;
    setIsProcessing(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: roughPrompt, tool: selectedTool }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error?.message || 'Failed to analyze prompt.');
      }

      setTaskType(data.taskType);
      setOriginalScores(data.originalScores);
      setQuestions(data.questions || []);
      setStep('analyzed');
    } catch (err: any) {
      setErrorMessage(err?.message || 'Error communicating with analysis service.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Sample prompt selection
  const handleSelectSample = (sample: (typeof SAMPLE_ROUGH_PROMPTS)[0]) => {
    setRoughPrompt(sample.prompt);
    setSelectedTool(sample.tool);
    setSecretWarning(false);
    setErrorMessage(null);
    setStep('idle');
  };

  // Step 2: Call /api/generate
  const handleFinishQuestions = async (answers: Record<string, string>) => {
    setIsProcessing(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: roughPrompt,
          tool: selectedTool,
          taskType,
          answers,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error?.message || 'Failed to generate optimized prompt.');
      }

      setOptimizedPrompt(data.optimizedPrompt);
      setChanges(data.changes || []);
      setAssumptions(data.assumptions || []);
      setOptimizedScores(data.optimizedScores);
      setStep('generated');
    } catch (err: any) {
      setErrorMessage(err?.message || 'Error generating structured prompt.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Reset pipeline
  const handleReset = () => {
    setRoughPrompt('');
    setStep('idle');
    setOriginalScores(null);
    setOptimizedScores(null);
    setErrorMessage(null);
  };

  const currentToolObj = TARGET_TOOLS.find((t) => t.id === selectedTool) || TARGET_TOOLS[0];

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex flex-col font-sans transition-colors">
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAuth={() => setAuthModalOpen(true)}
      />

      <main className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 py-8">
        {activeTab === 'library' && <MyPromptsLibrary />}
        {activeTab === 'settings' && <SettingsView />}

        {activeTab === 'optimize' && (
          <div className="space-y-8">
            {/* Top Hero Banner */}
            <div className="text-center space-y-3 max-w-2xl mx-auto pt-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 text-xs font-semibold">
                <Wand2 className="w-3.5 h-3.5" />
                <span>Interrogate First, Rewrite Second</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-600 dark:from-white dark:via-zinc-200 dark:to-zinc-400 bg-clip-text text-transparent">
                Turn Rough Ideas into First-Try Code Prompts
              </h1>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Most AI prompts fail because they are incomplete. We detect missing details, ask only 2–4 targeted questions, apply defaults, and rate your prompt into quality tiers.
              </p>
            </div>

            {/* Error Message Alert */}
            {errorMessage && (
              <div className="flex items-center gap-2.5 p-4 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-300 text-xs font-medium">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Main Input Form */}
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 sm:p-6 shadow-sm space-y-5">
              {/* Target Tool Selection */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-zinc-100 dark:border-zinc-800">
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 flex items-center gap-1.5">
                  <Terminal className="w-4 h-4 text-indigo-500" />
                  <span>Target Coding Tool Preset</span>
                </label>

                <div className="flex items-center gap-2">
                  <select
                    value={selectedTool}
                    onChange={(e) => setSelectedTool(e.target.value)}
                    className="text-xs sm:text-sm font-semibold px-3 py-1.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    {TARGET_TOOLS.map((tool) => (
                      <option key={tool.id} value={tool.id}>
                        {tool.name} ({tool.category})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Sample Prompt Shortcuts */}
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="text-zinc-500 font-medium">Try an example:</span>
                {SAMPLE_ROUGH_PROMPTS.map((sample, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSelectSample(sample)}
                    className="px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 transition-all text-xs font-medium"
                  >
                    "{sample.label}"
                  </button>
                ))}
              </div>

              {/* Textarea Input */}
              <div className="relative">
                <textarea
                  rows={4}
                  maxLength={4000}
                  placeholder="Paste your rough prompt idea here (e.g. 'make me a todo app', 'fix the login form error', 'add dark mode to header')..."
                  value={roughPrompt}
                  onChange={(e) => handlePromptChange(e.target.value)}
                  className="w-full p-4 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder:text-zinc-400 resize-y"
                />
                <div className="flex items-center justify-between mt-2 text-xs text-zinc-500">
                  <span className="flex items-center gap-1.5 text-zinc-400">
                    <span>Target:</span>
                    <strong className="text-zinc-700 dark:text-zinc-300">{currentToolObj.name}</strong>
                  </span>
                  <span>{roughPrompt.length} / 4,000 chars</span>
                </div>
              </div>

              {/* Secret Warning Banner */}
              {secretWarning && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-400 text-xs font-medium">
                  <ShieldAlert className="w-4 h-4 shrink-0 text-amber-500" />
                  <span>
                    Warning: Detected potential API key or token in prompt. Please remove sensitive credentials before submitting.
                  </span>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-2">
                <span className="text-xs text-zinc-400 hidden sm:inline">
                  Do not paste passwords or API keys
                </span>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  {step !== 'idle' && (
                    <button
                      onClick={handleReset}
                      className="px-4 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-semibold text-xs flex items-center gap-1.5 transition-all"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Start Over</span>
                    </button>
                  )}

                  <button
                    onClick={handleAnalyze}
                    disabled={isProcessing || !roughPrompt.trim()}
                    className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm shadow-md transition-all ${
                      isProcessing || !roughPrompt.trim()
                        ? 'bg-zinc-300 dark:bg-zinc-800 text-zinc-500 cursor-not-allowed'
                        : 'bg-gradient-to-r from-indigo-600 via-purple-600 to-emerald-600 hover:opacity-95 text-white shadow-indigo-500/20'
                    }`}
                  >
                    {isProcessing ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Analyzing Gaps...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        <span>Optimize Prompt</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Analysis & Output Pipeline Results */}
            {originalScores && step !== 'idle' && (
              <div className="space-y-8 animate-in fade-in duration-300">
                {/* Score Card Section */}
                <ScoreCard
                  originalScores={originalScores}
                  optimizedScores={step === 'generated' ? (optimizedScores || undefined) : undefined}
                />

                {/* Clarifying Questions Step */}
                {step === 'analyzed' && questions.length > 0 && (
                  <QuestionBox
                    questions={questions}
                    onSubmitAnswers={handleFinishQuestions}
                    onSkipAll={() => handleFinishQuestions({})}
                  />
                )}

                {/* Final Generated Result Step */}
                {step === 'generated' && (
                  <OptimizedPromptResult
                    optimizedPrompt={optimizedPrompt}
                    changes={changes}
                    assumptions={assumptions}
                    targetToolName={currentToolObj.name}
                    onSavePrompt={(title) => {
                      alert(`Prompt "${title}" saved to library! (Phase 4 Firestore Preview)`);
                    }}
                  />
                )}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Auth Modal */}
      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
    </div>
  );
}
