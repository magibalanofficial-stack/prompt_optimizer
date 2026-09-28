'use client';

import React, { useState } from 'react';
import { TARGET_TOOLS } from '../lib/mockData';
import { User, Shield, Sliders, Trash2, Check } from 'lucide-react';

export function SettingsView() {
  const [displayName, setDisplayName] = useState('Vibecoder Demo User');
  const [defaultTool, setDefaultTool] = useState('cursor');
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  return (
    <div className="w-full max-w-3xl mx-auto space-y-6 py-6">
      <div>
        <h2 className="text-xl font-extrabold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
          <User className="w-5 h-5 text-indigo-500" />
          <span>Account & Preferences</span>
        </h2>
        <p className="text-xs text-zinc-500">Manage your profile, target tool preset, and account data.</p>
      </div>

      <form onSubmit={handleSave} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 space-y-5 shadow-sm">
        <div>
          <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
            Display Name
          </label>
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="w-full text-sm px-3.5 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
            Default Target Tool Preset
          </label>
          <select
            value={defaultTool}
            onChange={(e) => setDefaultTool(e.target.value)}
            className="w-full text-sm px-3.5 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {TARGET_TOOLS.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name} ({t.category})
              </option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 font-semibold text-xs transition-all hover:opacity-90"
        >
          {isSaved ? <Check className="w-4 h-4 text-emerald-500" /> : null}
          <span>{isSaved ? 'Settings Saved' : 'Save Changes'}</span>
        </button>
      </form>

      {/* Danger Zone */}
      <div className="bg-red-50/50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 rounded-2xl p-6 space-y-3">
        <div className="flex items-center gap-2 text-red-600 dark:text-red-400 font-bold text-sm">
          <Shield className="w-4 h-4" />
          <span>Danger Zone</span>
        </div>
        <p className="text-xs text-zinc-600 dark:text-zinc-400">
          Deleting your account will immediately erase all saved prompts and conversation history.
        </p>
        <button
          onClick={() => alert('Account deletion preview.')}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-semibold text-xs transition-all shadow-xs"
        >
          <Trash2 className="w-4 h-4" />
          <span>Delete Account & Data</span>
        </button>
      </div>
    </div>
  );
}
