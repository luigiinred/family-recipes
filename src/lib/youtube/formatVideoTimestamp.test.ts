import { describe, expect, it } from 'vitest';
import { formatVideoTimestamp } from './formatVideoTimestamp';

describe('formatVideoTimestamp', () => {
  it('formats sub-hour times as M:SS', () => {
    expect(formatVideoTimestamp(45)).toBe('0:45');
    expect(formatVideoTimestamp(125)).toBe('2:05');
  });

  it('formats hour-plus times as H:MM:SS', () => {
    expect(formatVideoTimestamp(3661)).toBe('1:01:01');
  });
});
