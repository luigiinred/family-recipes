import { describe, expect, it } from 'vitest';
import { parseYouTubeVideoId } from './parseYouTubeVideoId';

describe('parseYouTubeVideoId', () => {
  it('parses watch URLs', () => {
    expect(
      parseYouTubeVideoId('https://www.youtube.com/watch?v=dQw4w9WgXcQ'),
    ).toBe('dQw4w9WgXcQ');
  });

  it('parses short youtu.be links', () => {
    expect(parseYouTubeVideoId('https://youtu.be/dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ');
  });

  it('parses shorts URLs', () => {
    expect(
      parseYouTubeVideoId('https://www.youtube.com/shorts/dQw4w9WgXcQ'),
    ).toBe('dQw4w9WgXcQ');
  });

  it('returns undefined for non-YouTube URLs', () => {
    expect(parseYouTubeVideoId('https://example.com/recipe')).toBeUndefined();
  });
});
