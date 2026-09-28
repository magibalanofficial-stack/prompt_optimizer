import { describe, it, expect } from 'vitest';
import { scoreOf, tierOf, clampDimension } from './tiers';

describe('clampDimension', () => {
  it('clamps values below 0 to 0', () => {
    expect(clampDimension(-5)).toBe(0);
  });

  it('clamps values above 10 to 10', () => {
    expect(clampDimension(15)).toBe(10);
  });

  it('rounds decimal values', () => {
    expect(clampDimension(7.4)).toBe(7);
    expect(clampDimension(7.6)).toBe(8);
  });
});

describe('scoreOf', () => {
  it('calculates 0 for all zero scores', () => {
    expect(
      scoreOf({
        goal: 0,
        context: 0,
        stack: 0,
        requirements: 0,
        constraints: 0,
        acceptance: 0,
        scope: 0,
      })
    ).toBe(0);
  });

  it('calculates 100 for all max scores (10 each)', () => {
    expect(
      scoreOf({
        goal: 10,
        context: 10,
        stack: 10,
        requirements: 10,
        constraints: 10,
        acceptance: 10,
        scope: 10,
      })
    ).toBe(100);
  });

  it('correctly clamps individual dimensions before summing', () => {
    expect(
      scoreOf({
        goal: 15, // clamped to 10
        context: -2, // clamped to 0
        stack: 10,
        requirements: 10,
        constraints: 10,
        acceptance: 10,
        scope: 10,
      })
    ).toBe(86); // (10+0+10+10+10+10+10)/7 * 10 = 60/7 * 10 = 85.71 => 86
  });
});

describe('tierOf boundaries', () => {
  it('handles 0-24 as Very bad', () => {
    expect(tierOf(0).key).toBe('very_bad');
    expect(tierOf(24).key).toBe('very_bad');
  });

  it('handles boundary 24 vs 25 (Very bad -> Bad)', () => {
    expect(tierOf(24).key).toBe('very_bad');
    expect(tierOf(25).key).toBe('bad');
  });

  it('handles 25-44 as Bad', () => {
    expect(tierOf(25).key).toBe('bad');
    expect(tierOf(44).key).toBe('bad');
  });

  it('handles boundary 44 vs 45 (Bad -> Not bad)', () => {
    expect(tierOf(44).key).toBe('bad');
    expect(tierOf(45).key).toBe('not_bad');
  });

  it('handles 45-59 as Not bad', () => {
    expect(tierOf(45).key).toBe('not_bad');
    expect(tierOf(59).key).toBe('not_bad');
  });

  it('handles boundary 59 vs 60 (Not bad -> Moderate)', () => {
    expect(tierOf(59).key).toBe('not_bad');
    expect(tierOf(60).key).toBe('moderate');
  });

  it('handles 60-74 as Moderate', () => {
    expect(tierOf(60).key).toBe('moderate');
    expect(tierOf(74).key).toBe('moderate');
  });

  it('handles boundary 74 vs 75 (Moderate -> Good)', () => {
    expect(tierOf(74).key).toBe('moderate');
    expect(tierOf(75).key).toBe('good');
  });

  it('handles 75-89 as Good', () => {
    expect(tierOf(75).key).toBe('good');
    expect(tierOf(89).key).toBe('good');
  });

  it('handles boundary 89 vs 90 (Good -> Best)', () => {
    expect(tierOf(89).key).toBe('good');
    expect(tierOf(90).key).toBe('best');
  });

  it('handles 90-100 as Best', () => {
    expect(tierOf(90).key).toBe('best');
    expect(tierOf(100).key).toBe('best');
  });
});
