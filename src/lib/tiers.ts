export interface PromptScores {
  goal: number;
  context: number;
  stack: number;
  requirements: number;
  constraints: number;
  acceptance: number;
  scope: number;
}

export type QualityTierKey = 'best' | 'good' | 'moderate' | 'not_bad' | 'bad' | 'very_bad';

export interface QualityTierInfo {
  key: QualityTierKey;
  label: string;
  minScore: number;
  maxScore: number;
  color: string;
  badgeBg: string;
  badgeText: string;
}

export const QUALITY_TIERS: QualityTierInfo[] = [
  {
    key: 'best',
    label: 'Best',
    minScore: 90,
    maxScore: 100,
    color: '#0a7d4f',
    badgeBg: 'bg-emerald-100 dark:bg-emerald-950/60 border-emerald-500/30',
    badgeText: 'text-emerald-700 dark:text-emerald-300',
  },
  {
    key: 'good',
    label: 'Good',
    minScore: 75,
    maxScore: 89,
    color: '#2f8f2f',
    badgeBg: 'bg-green-100 dark:bg-green-950/60 border-green-500/30',
    badgeText: 'text-green-700 dark:text-green-300',
  },
  {
    key: 'moderate',
    label: 'Moderate',
    minScore: 60,
    maxScore: 74,
    color: '#b58900',
    badgeBg: 'bg-amber-100 dark:bg-amber-950/60 border-amber-500/30',
    badgeText: 'text-amber-700 dark:text-amber-300',
  },
  {
    key: 'not_bad',
    label: 'Not bad',
    minScore: 45,
    maxScore: 59,
    color: '#d9822b',
    badgeBg: 'bg-orange-100 dark:bg-orange-950/60 border-orange-500/30',
    badgeText: 'text-orange-700 dark:text-orange-300',
  },
  {
    key: 'bad',
    label: 'Bad',
    minScore: 25,
    maxScore: 44,
    color: '#cc4b37',
    badgeBg: 'bg-rose-100 dark:bg-rose-950/60 border-rose-500/30',
    badgeText: 'text-rose-700 dark:text-rose-300',
  },
  {
    key: 'very_bad',
    label: 'Very bad',
    minScore: 0,
    maxScore: 24,
    color: '#9b1c1c',
    badgeBg: 'bg-red-100 dark:bg-red-950/60 border-red-500/30',
    badgeText: 'text-red-700 dark:text-red-300',
  },
];

export const DIMENSION_LABELS: Record<keyof PromptScores, { name: string; description: string }> = {
  goal: { name: 'Goal', description: 'Clear desired outcome' },
  context: { name: 'Context', description: 'Background, users & existing code' },
  stack: { name: 'Stack', description: 'Language, framework & versions' },
  requirements: { name: 'Requirements', description: 'Specific and testable items' },
  constraints: { name: 'Constraints', description: 'Limits & things to avoid' },
  acceptance: { name: 'Acceptance', description: 'Definition of done' },
  scope: { name: 'Scope', description: 'Manageable scope for 1-shot build' },
};

export function clampDimension(val: number): number {
  if (isNaN(val)) return 0;
  return Math.min(10, Math.max(0, Math.round(val)));
}

export function scoreOf(scores: Partial<PromptScores>): number {
  const keys: (keyof PromptScores)[] = [
    'goal',
    'context',
    'stack',
    'requirements',
    'constraints',
    'acceptance',
    'scope',
  ];

  let sum = 0;
  for (const k of keys) {
    sum += clampDimension(scores[k] ?? 0);
  }

  const score = Math.round((sum / 7) * 10);
  return Math.min(100, Math.max(0, score));
}

export function tierOf(score: number): QualityTierInfo {
  const clamped = Math.min(100, Math.max(0, Math.round(score)));
  if (clamped >= 90) return QUALITY_TIERS[0]; // Best
  if (clamped >= 75) return QUALITY_TIERS[1]; // Good
  if (clamped >= 60) return QUALITY_TIERS[2]; // Moderate
  if (clamped >= 45) return QUALITY_TIERS[3]; // Not bad
  if (clamped >= 25) return QUALITY_TIERS[4]; // Bad
  return QUALITY_TIERS[5]; // Very bad
}
