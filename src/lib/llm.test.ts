import { describe, it, expect } from 'vitest';
import { cleanJsonFence } from './llm';

describe('cleanJsonFence', () => {
  it('strips ```json markdown fences', () => {
    const raw = '```json\n{"taskType": "new_app"}\n```';
    expect(cleanJsonFence(raw)).toBe('{"taskType": "new_app"}');
  });

  it('strips plain ``` fences', () => {
    const raw = '```\n{"score": 85}\n```';
    expect(cleanJsonFence(raw)).toBe('{"score": 85}');
  });

  it('returns clean JSON string untouched', () => {
    const raw = '{"goal": 10}';
    expect(cleanJsonFence(raw)).toBe('{"goal": 10}');
  });

  it('handles empty input gracefully', () => {
    expect(cleanJsonFence('')).toBe('');
  });
});
