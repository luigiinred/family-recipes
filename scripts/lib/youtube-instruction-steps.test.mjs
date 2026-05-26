import { describe, expect, it } from 'vitest';
import {
  isTableOfContentsSteps,
  mergeBlogStepsWithChapters,
  resolveYouTubeTimedSteps,
} from './youtube-instruction-steps.mjs';

describe('isTableOfContentsSteps', () => {
  it('flags YouTube chapter labels', () => {
    expect(
      isTableOfContentsSteps([
        { text: 'Intro', startSeconds: 0 },
        { text: 'Salad prep', startSeconds: 32 },
      ]),
    ).toBe(true);
  });

  it('accepts full instruction lines', () => {
    expect(
      isTableOfContentsSteps([
        {
          text: 'Make the dressing: whisk olive oil and lemon in a small bowl.',
          startSeconds: 118,
        },
      ]),
    ).toBe(false);
  });
});

describe('mergeBlogStepsWithChapters', () => {
  it('pairs blog instructions with chapter timestamps', () => {
    const merged = mergeBlogStepsWithChapters(
      [
        'Make the dressing: whisk oil and lemon.',
        'Mix the salad: combine chicken and vegetables.',
      ],
      [
        { start_time: 32, title: 'Salad prep' },
        { start_time: 118, title: 'Dressing prep' },
      ],
    );
    expect(merged[0].text).toMatch(/dressing/i);
    expect(merged[0].startSeconds).toBe(118);
    expect(merged[1].startSeconds).toBe(32);
  });
});

describe('resolveYouTubeTimedSteps', () => {
  it('prefers blog instructions over chapter TOC', () => {
    const { timedSteps, source } = resolveYouTubeTimedSteps({
      blog: {
        steps: [
          'Make the dressing: whisk oil and lemon.',
          'Mix the salad: combine chicken and vegetables.',
        ],
      },
      meta: {
        chapters: [
          { start_time: 0, title: 'Intro' },
          { start_time: 32, title: 'Salad prep' },
          { start_time: 118, title: 'Dressing prep' },
        ],
      },
      extracted: {
        timedSteps: [
          { text: 'Intro', startSeconds: 0 },
          { text: 'Salad prep', startSeconds: 32 },
        ],
        source: 'chapters',
      },
    });
    expect(source).toBe('blog-chapters');
    expect(timedSteps[0].text).toMatch(/dressing/i);
    expect(timedSteps[0].text.length).toBeGreaterThan(20);
  });
});
