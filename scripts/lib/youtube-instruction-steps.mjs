import {
  chaptersToTimedSteps,
  proseStepsToTimedSteps,
} from './fetch-youtube-timed-steps.mjs';
import { isTableOfContentsSteps } from './youtube-toc-steps.mjs';

export { isTableOfContentsSteps };

const TOC_LABEL = /^(intro|ingredients|outro)$/i;

const STEP_TO_CHAPTER = [
  { step: /dress the salad|pour dressing|toss to combine/i, chapter: /mixture/i },
  { step: /make the dressing|into a small mixing bowl/i, chapter: /dressing/i },
  { step: /mix the salad|large mixing bowl/i, chapter: /salad prep|prep/i },
  { step: /^serve:|refrigerat|chill before/i, chapter: /taste/i },
];

/**
 * Pair full instruction text from a blog with seek times from video chapters.
 * @param {string[]} stepTexts
 * @param {{ start_time?: number, title?: string }[] | undefined} chapters
 */
export function mergeBlogStepsWithChapters(stepTexts, chapters) {
  if (!stepTexts?.length) return [];

  const chapterSteps = chaptersToTimedSteps(chapters || []);
  const cookingChapters = chapterSteps.filter(
    (c) => !TOC_LABEL.test(c.text.trim()),
  );

  return stepTexts.map((text, index) => {
    const rule = STEP_TO_CHAPTER.find((r) => r.step.test(text));
    const matched = rule
      ? cookingChapters.find((c) => rule.chapter.test(c.text))
      : undefined;
    const chapter =
      matched ?? cookingChapters[Math.min(index, cookingChapters.length - 1)];

    return {
      text: text.trim(),
      startSeconds: chapter?.startSeconds ?? index * 60,
    };
  });
}

/**
 * @param {{ steps?: string[] }} blog
 * @param {{ chapters?: unknown[] }} meta
 * @param {{ timedSteps: { text: string, startSeconds: number }[] }} extracted
 */
export function resolveYouTubeTimedSteps({ blog, meta, extracted }) {
  const { timedSteps } = extracted;

  if (blog?.steps?.length >= 2) {
    if (isTableOfContentsSteps(timedSteps)) {
      return {
        timedSteps: mergeBlogStepsWithChapters(blog.steps, meta.chapters),
        source: 'blog-chapters',
      };
    }
  }

  if (isTableOfContentsSteps(timedSteps)) {
    const inline = extracted.inlineRecipe;
    if (inline?.steps?.length >= 2) {
      return {
        timedSteps: proseStepsToTimedSteps(inline.steps),
        source: 'description-recipe',
      };
    }
    return { timedSteps: [], source: 'none' };
  }

  return { timedSteps, source: extracted.source };
}
