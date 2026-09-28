import { describe, it, expect } from 'vitest';
import {
  classifyTaskType,
  generateDynamicAnalysis,
  generateDynamicStructuredPrompt,
} from './dynamicGenerator';

describe('dynamicGenerator', () => {
  it('classifies task types accurately from prompt keywords', () => {
    expect(classifyTaskType('the login form gives a 401 error')).toBe('fix_bug');
    expect(classifyTaskType('add dark mode to header button')).toBe('add_feature');
    expect(classifyTaskType('refactor the user auth controller')).toBe('refactor');
    expect(classifyTaskType('design responsive mobile dashboard UI')).toBe('ui_design');
    expect(classifyTaskType('make me a todo app')).toBe('new_app');
  });

  it('generates prompt-relevant analysis and questions for bug reports', () => {
    const analysis = generateDynamicAnalysis('fix 401 error in auth API', 'cursor');
    expect(analysis.taskType).toBe('fix_bug');
    expect(analysis.questions.length).toBeGreaterThan(0);
    expect(analysis.questions[0].question.toLowerCase()).toContain('stack');
  });

  it('generates dynamic structured prompt matching exact user input text', () => {
    const inputPrompt = 'can you explain yourself';
    const result = generateDynamicStructuredPrompt(inputPrompt, 'cursor');
    expect(result.optimizedPrompt).toContain('can you explain yourself');
    expect(result.optimizedPrompt).toContain('GOAL:');
    expect(result.optimizedPrompt).toContain('REQUIREMENTS:');
  });
});
