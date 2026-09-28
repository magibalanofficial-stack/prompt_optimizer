import { PromptScores } from './tiers';

export interface DynamicAnalysisResult {
  taskType: 'new_app' | 'add_feature' | 'fix_bug' | 'refactor' | 'ui_design';
  originalScores: PromptScores;
  questions: { id: string; question: string; options: string[] }[];
}

export interface DynamicGenerateResult {
  optimizedPrompt: string;
  changes: { add: string; why: string }[];
  assumptions: string[];
  optimizedScores: PromptScores;
}

/**
 * Classifies task type based on keywords in the prompt
 */
export function classifyTaskType(prompt: string): 'new_app' | 'add_feature' | 'fix_bug' | 'refactor' | 'ui_design' {
  const p = prompt.toLowerCase();
  if (p.includes('fix') || p.includes('bug') || p.includes('error') || p.includes('401') || p.includes('500') || p.includes('fails') || p.includes('crash')) {
    return 'fix_bug';
  }
  if (p.includes('add') || p.includes('feature') || p.includes('toggle') || p.includes('button') || p.includes('mode') || p.includes('integrate')) {
    return 'add_feature';
  }
  if (p.includes('refactor') || p.includes('clean') || p.includes('rewrite') || p.includes('optimize') || p.includes('structure')) {
    return 'refactor';
  }
  if (p.includes('design') || p.includes('ui') || p.includes('css') || p.includes('style') || p.includes('theme') || p.includes('layout')) {
    return 'ui_design';
  }
  return 'new_app';
}

/**
 * Generates dynamic gap analysis & targeted clarifying questions based on the exact user prompt
 */
export function generateDynamicAnalysis(prompt: string, tool: string): DynamicAnalysisResult {
  const taskType = classifyTaskType(prompt);
  const cleanPrompt = prompt.trim();

  let questions: { id: string; question: string; options: string[] }[] = [];
  let originalScores: PromptScores = {
    goal: cleanPrompt.length > 30 ? 5 : 2,
    context: cleanPrompt.length > 80 ? 4 : 1,
    stack: 0,
    requirements: cleanPrompt.length > 50 ? 4 : 2,
    constraints: 1,
    acceptance: 1,
    scope: 5,
  };

  if (taskType === 'fix_bug') {
    questions = [
      {
        id: 'stack',
        question: 'Which tech stack and framework is this bug occurring in?',
        options: ['Next.js (App Router) + TypeScript', 'React + Express API', 'Node.js Backend', 'Vanilla HTML/JS'],
      },
      {
        id: 'error_details',
        question: 'What is the exact error behavior or status code?',
        options: ['HTTP status error (e.g. 401, 500)', 'UI state / state update crash', 'Network CORS header error', 'Console runtime TypeError'],
      },
      {
        id: 'scope',
        question: 'Should the fix preserve existing component contracts?',
        options: ['Yes, keep function signatures unchanged', 'Refactor affected API route as needed', 'Add error boundary fallback'],
      },
    ];
  } else if (taskType === 'add_feature') {
    questions = [
      {
        id: 'stack',
        question: 'Which tech stack and styling solution are you using?',
        options: ['React + Tailwind CSS', 'Next.js App Router + Tailwind', 'Vue 3 + CSS Modules', 'Plain HTML/JS + CSS'],
      },
      {
        id: 'behavior',
        question: 'How should state & persistence be managed for this feature?',
        options: ['React Local State (useState)', 'Browser LocalStorage persistence', 'Global Context / Store', 'Database backend'],
      },
      {
        id: 'design_style',
        question: 'What design feel or UX behavior is expected?',
        options: ['Clean modern minimal theme', 'Smooth animated transitions', 'Accessible accessible WCAG standards'],
      },
    ];
  } else if (taskType === 'refactor') {
    questions = [
      {
        id: 'goal',
        question: 'What is the main goal of this refactor?',
        options: ['Improve code readability & modularity', 'Optimize execution speed & rendering', 'Convert JavaScript to strict TypeScript'],
      },
      {
        id: 'stack',
        question: 'Which architecture pattern do you want to follow?',
        options: ['Clean modular components', 'Custom hooks abstraction', 'Decoupled service modules'],
      },
      {
        id: 'tests',
        question: 'Should automated unit tests be provided with the refactor?',
        options: ['Yes, include Vitest / Jest unit tests', 'No tests required, clean code only'],
      },
    ];
  } else if (taskType === 'ui_design') {
    questions = [
      {
        id: 'stack',
        question: 'Which framework and component system are you using?',
        options: ['React + Tailwind CSS + Lucide Icons', 'Next.js + Shadcn UI', 'Pure HTML/CSS + Flexbox/Grid'],
      },
      {
        id: 'theme',
        question: 'Which color palette & layout structure do you prefer?',
        options: ['Dark mode glassmorphism', 'Clean minimal light mode', 'High-contrast dashboard layout'],
      },
      {
        id: 'responsiveness',
        question: 'What responsive breakpoints must be supported?',
        options: ['Mobile-first (360px) to Desktop (1440px)', 'Desktop layout only', 'Tablet and Mobile flex layout'],
      },
    ];
  } else {
    // New App / General Request (e.g. "can you explain yourself" or "make an app")
    questions = [
      {
        id: 'stack',
        question: 'Which target stack and framework should be specified?',
        options: ['Next.js (App Router) + TypeScript + Tailwind CSS', 'React + Vite + Tailwind CSS', 'Node.js + Express API', 'Plain HTML/JS + CSS'],
      },
      {
        id: 'scope_depth',
        question: 'What level of implementation depth do you expect?',
        options: ['Full single-pass working code', 'Step-by-step architectural breakdown', 'Core files & configuration setup'],
      },
      {
        id: 'acceptance_criteria',
        question: 'What is the definition of done for this request?',
        options: ['Compiles cleanly with zero errors', 'Includes unit tests & build verification', 'Interactive UI demo ready'],
      },
    ];
  }

  return {
    taskType,
    originalScores,
    questions,
  };
}

/**
 * Dynamically constructs a structured prompt specific to the user's exact input topic
 */
export function generateDynamicStructuredPrompt(
  prompt: string,
  tool: string,
  answers: Record<string, string> = {}
): DynamicGenerateResult {
  const taskType = classifyTaskType(prompt);
  const cleanPrompt = prompt.trim();

  // Extract stack choice or default
  const chosenStack = answers.stack || 'React + TypeScript + Tailwind CSS';
  const chosenBehavior = answers.behavior || answers.storage || answers.error_details || 'Client-side state management';

  let goalText = '';
  let contextText = '';
  let requirements: string[] = [];
  let constraints: string[] = [];
  let acceptanceText = '';

  if (taskType === 'fix_bug') {
    goalText = `Diagnose and resolve issue regarding "${cleanPrompt}".`;
    contextText = `Existing application bug reported during runtime execution. Needs root-cause identification and targeted fix without breaking existing contracts.`;
    requirements = [
      `Inspect code logic related to "${cleanPrompt}".`,
      `Fix underlying cause (${chosenBehavior}) with non-null checks & proper error handling.`,
      `Ensure no regression side-effects occur in adjacent modules.`,
    ];
    constraints = [
      `Do not swallow exceptions silently; handle errors gracefully.`,
      `Keep modifications strictly scoped to affected functions.`,
    ];
    acceptanceText = `Issue "${cleanPrompt}" is resolved; zero runtime console errors; build passes cleanly.`;
  } else if (taskType === 'add_feature') {
    goalText = `Implement feature: "${cleanPrompt}".`;
    contextText = `Feature addition to enhance existing workflow and user interface.`;
    requirements = [
      `Build interactive component / module for "${cleanPrompt}".`,
      `Manage state cleanly using ${chosenBehavior}.`,
      `Ensure responsive rendering across mobile and desktop viewports.`,
    ];
    constraints = [
      `Maintain consistent visual theme with existing UI token system.`,
      `Avoid adding unnecessary heavy external dependencies.`,
    ];
    acceptanceText = `Feature "${cleanPrompt}" is fully interactive, responsive, and passes build verification.`;
  } else if (taskType === 'refactor') {
    goalText = `Refactor code for: "${cleanPrompt}".`;
    contextText = `Codebase optimization for improved readability, maintainability, and architectural structure.`;
    requirements = [
      `Refactor modules associated with "${cleanPrompt}".`,
      `Decouple logic into clear single-responsibility helper functions.`,
      `Ensure full TypeScript type safety with explicit interface signatures.`,
    ];
    constraints = [
      `Preserve existing public API contracts and return types.`,
      `Do not alter core business logic behavior.`,
    ];
    acceptanceText = `Refactored code compiles cleanly with zero TypeScript warnings or broken tests.`;
  } else if (taskType === 'ui_design') {
    goalText = `Design and implement UI interface for: "${cleanPrompt}".`;
    contextText = `Front-end component design requiring rich visual aesthetics and dynamic interactions.`;
    requirements = [
      `Create layout and visual styling for "${cleanPrompt}".`,
      `Incorporate curated color palette, typography hierarchy, and glassmorphic micro-animations.`,
      `Support mobile-first responsive layout down to 360px viewports.`,
    ];
    constraints = [
      `Avoid default unstyled browser elements; use custom Tailwind utilities.`,
      `Ensure contrast ratio meets WCAG accessibility guidelines.`,
    ];
    acceptanceText = `UI renders visually appealingly with smooth interactive state transitions across desktop and mobile.`;
  } else {
    // New App or General Query (e.g. "can you explain yourself")
    goalText = `Execute request: "${cleanPrompt}".`;
    contextText = `Targeted task execution tuned for ${tool}. Needs comprehensive, structured output.`;
    requirements = [
      `Provide complete, structured solution addressing "${cleanPrompt}".`,
      `Outline architecture, component setup, and core code logic.`,
      `Ensure all code blocks are production-ready without pseudo-code placeholders.`,
    ];
    constraints = [
      `Follow clean modern coding practices for ${chosenStack}.`,
      `Keep execution plan focused on the requested outcome without scope creep.`,
    ];
    acceptanceText = `Output fulfills the requirements of "${cleanPrompt}" with clear, runnable code and documentation.`;
  }

  const reqString = requirements.map((r, i) => `${i + 1}. ${r}`).join('\n');
  const constrString = constraints.map((c) => `- ${c}`).join('\n');

  const optimizedPrompt = `GOAL:
${goalText}

CONTEXT:
${contextText}

STACK:
${chosenStack}.

REQUIREMENTS:
${reqString}

CONSTRAINTS:
${constrString}

OUTPUT FORMAT:
Provide full complete code files, explaining rationale where necessary.

ACCEPTANCE:
${acceptanceText}`;

  const changes = [
    { add: `Tailored goal to "${cleanPrompt}"`, why: 'Provides explicit outcome for the model' },
    { add: `Specified stack (${chosenStack})`, why: 'Prevents arbitrary technology choices' },
    { add: 'Added concrete testable requirements & acceptance criteria', why: 'Defines unambiguous definition of done' },
  ];

  const assumptions = [
    `Target tool optimized for ${tool}`,
    `Standard conventions applied for ${chosenStack}`,
  ];

  const optimizedScores: PromptScores = {
    goal: 10,
    context: 9,
    stack: 10,
    requirements: 9,
    constraints: 8,
    acceptance: 9,
    scope: 9,
  };

  return {
    optimizedPrompt,
    changes,
    assumptions,
    optimizedScores,
  };
}
