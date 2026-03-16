// ABOUTME: Smoke tests verifying basic utility imports and functionality
// ABOUTME: Provides baseline test coverage for the Vitest test framework setup
import { describe, it, expect } from 'vitest';
import { formatPointValue } from '@utils/index';

describe('smoke tests', () => {
  it('can import utility functions', () => {
    expect(formatPointValue).toBeDefined();
    expect(typeof formatPointValue).toBe('function');
  });

  describe('formatPointValue', () => {
    it('formats cent currency as dollars', () => {
      expect(formatPointValue(10, 'cent', 5)).toBe('$0.50');
    });

    it('formats non-cent currency with unit', () => {
      expect(formatPointValue(10, 'points', 2)).toBe('20 points');
    });

    it('handles zero points', () => {
      expect(formatPointValue(0, 'cent', 5)).toBe('$0.00');
    });
  });
});
