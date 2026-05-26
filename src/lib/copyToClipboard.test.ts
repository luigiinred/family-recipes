import { beforeEach, describe, expect, it, vi } from 'vitest';
import { copyToClipboard } from './copyToClipboard';

const writeText = vi.fn().mockResolvedValue(undefined);

describe('copyToClipboard', () => {
  beforeEach(() => {
    writeText.mockClear();
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText },
      configurable: true,
    });
  });

  it('writes text with the clipboard API when available', async () => {
    await copyToClipboard('hello');
    expect(writeText).toHaveBeenCalledWith('hello');
  });
});
