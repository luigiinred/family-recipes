import { describe, expect, it } from 'vitest';
import type { Recipe } from '@/static-api/types/recipe';
import { isYouTubeRecipe, youTubeEmbedUrl } from './isYouTubeRecipe';

const base: Recipe = {
  id: '1',
  slug: 'demo',
  title: 'Demo',
  description: '',
  imageUrl: '',
  prepMinutes: 0,
  cookMinutes: 0,
  servings: 4,
  tags: [],
  ingredients: [],
  steps: ['Step one'],
};

describe('isYouTubeRecipe', () => {
  it('is true when kind, video id, and timed steps are present', () => {
    const recipe: Recipe = {
      ...base,
      recipeKind: 'youtube',
      youtubeVideoId: 'dQw4w9WgXcQ',
      timedSteps: [{ text: 'Step one', startSeconds: 30 }],
    };
    expect(isYouTubeRecipe(recipe)).toBe(true);
  });

  it('is false for standard recipes', () => {
    expect(isYouTubeRecipe(base)).toBe(false);
  });
});

describe('youTubeEmbedUrl', () => {
  it('includes start seconds in the embed URL', () => {
    const url = youTubeEmbedUrl('abc12345678', 90);
    expect(url).toContain('start=90');
    expect(url).toContain('youtube.com/embed/abc12345678');
    expect(url).toContain('playsinline=1');
  });

  it('adds autoplay when requested', () => {
    expect(youTubeEmbedUrl('abc12345678', 0, { autoplay: true })).toContain('autoplay=1');
    expect(youTubeEmbedUrl('abc12345678', 0)).not.toContain('autoplay=1');
  });

  it('adds origin when provided', () => {
    expect(
      youTubeEmbedUrl('abc12345678', 0, { origin: 'http://localhost:5173' }),
    ).toContain('origin=http%3A%2F%2Flocalhost%3A5173');
  });
});
