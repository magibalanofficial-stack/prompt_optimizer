import { PromptScores, QUALITY_TIERS, tierOf } from './tiers';

export interface TargetTool {
  id: string;
  name: string;
  category: 'IDE/CLI' | 'Web App Generator' | 'Chat Assistant';
  description: string;
}

export const TARGET_TOOLS: TargetTool[] = [
  { id: 'cursor', name: 'Cursor', category: 'IDE/CLI', description: 'AI Code Editor with workspace context' },
  { id: 'claude_code', name: 'Claude Code', category: 'IDE/CLI', description: 'Anthropic terminal coding agent' },
  { id: 'lovable', name: 'Lovable', category: 'Web App Generator', description: 'Full-stack web app builder' },
  { id: 'bolt', name: 'Bolt.new', category: 'Web App Generator', description: 'In-browser full-stack development environment' },
  { id: 'v0', name: 'v0 by Vercel', category: 'Web App Generator', description: 'UI component generator' },
  { id: 'chatgpt', name: 'ChatGPT / Claude Web', category: 'Chat Assistant', description: 'General web chat assistants' },
];

export interface ClarifyingQuestion {
  id: string;
  question: string;
  options: string[];
}

export interface OptimizationResultMock {
  taskType: 'new_app' | 'add_feature' | 'fix_bug' | 'refactor' | 'ui_design';
  originalScores: PromptScores;
  questions: ClarifyingQuestion[];
  optimizedPrompt: string;
  optimizedScores: PromptScores;
  changes: { add: string; why: string }[];
  assumptions: string[];
}

export const SAMPLE_ROUGH_PROMPTS = [
  {
    label: 'Todo App (New App)',
    prompt: 'make me a todo app',
    tool: 'cursor',
  },
  {
    label: 'Fix Login Bug (Fix Bug)',
    prompt: 'the login form gives a 401 error after submitting',
    tool: 'claude_code',
  },
  {
    label: 'Dark Mode Switch (Add Feature)',
    prompt: 'add dark mode to my app header with a toggle switch',
    tool: 'lovable',
  },
];

export const MOCK_TODO_OPTIMIZATION: OptimizationResultMock = {
  taskType: 'new_app',
  originalScores: {
    goal: 4,
    context: 1,
    stack: 0,
    requirements: 3,
    constraints: 1,
    acceptance: 1,
    scope: 5,
  },
  questions: [
    {
      id: 'stack',
      question: 'Which frontend tech stack and styling library do you prefer?',
      options: ['React + Vite + Tailwind CSS', 'Next.js (App Router) + CSS Modules', 'Plain HTML/JS + CSS', 'Vue 3 + Tailwind'],
    },
    {
      id: 'storage',
      question: 'Where should todo items be persisted?',
      options: ['Browser LocalStorage only', 'In-memory state (resets on reload)', 'Firebase Firestore', 'PostgreSQL backend'],
    },
    {
      id: 'features',
      question: 'Which core features are required for the initial version?',
      options: ['CRUD + Complete toggle + Category filter', 'Basic Add/Delete + Complete toggle only', 'Full CRUD + Priority tags + Due dates'],
    },
    {
      id: 'design',
      question: 'What is the desired design aesthetic?',
      options: ['Clean modern minimal dark/light UI', 'Dashboard style with sidebar', 'Playful colorful vibe'],
    },
  ],
  optimizedScores: {
    goal: 10,
    context: 9,
    stack: 10,
    requirements: 9,
    constraints: 8,
    acceptance: 9,
    scope: 9,
  },
  optimizedPrompt: `GOAL:
Build a responsive Todo Web Application allowing users to add, edit, toggle completion, filter, and delete personal tasks.

CONTEXT:
Single-user client-side web application. No user authentication or backend API needed for V1.

STACK:
React (TypeScript), Vite, Tailwind CSS for styling. No third-party UI component frameworks.

REQUIREMENTS:
1. Allow user to add a new task title via an input form with validation (non-empty).
2. Display task list items with a checkbox to mark complete/incomplete.
3. Allow inline editing of task title and single-click deletion.
4. Provide filter tabs: "All", "Active", and "Completed".
5. Persist tasks in browser LocalStorage so data survives page refreshes.

CONSTRAINTS:
- Single-page component layout with clean modular structure.
- Fully responsive design optimized for desktop and mobile viewports (down to 360px).
- Avoid unnecessary external state management libraries (use React hooks).

OUTPUT FORMAT:
Provide complete code for files created (e.g. App.tsx, index.css, components/TodoList.tsx).

ACCEPTANCE:
App compiles without TypeScript or console errors (` + '`npm run dev`' + ` works). All 5 core requirements pass manual validation.`,
  changes: [
    { add: 'Defined precise tech stack (React + Vite + Tailwind)', why: 'Prevents the model from picking arbitrary or outdated frameworks' },
    { add: 'Added browser LocalStorage persistence requirement', why: 'Clarifies data lifecycle expectation' },
    { add: 'Specified filtering and editing rules', why: 'Eliminates ambiguity in expected user interactions' },
    { add: 'Added responsive constraint & acceptance criteria', why: 'Ensures measurable definition of done' },
  ],
  assumptions: [
    'Single-user local app without server database',
    'Vanilla Tailwind utility classes used for styling',
    'State managed using React useState & useEffect',
  ],
};
