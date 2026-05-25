import type { Recipe, TimedStep } from '@/static-api/types/recipe';

export type YouTubeRecipe = Recipe & {
  recipeKind: 'youtube';
  youtubeVideoId: string;
  timedSteps: TimedStep[];
};

export function isYouTubeRecipe(recipe: Recipe): recipe is YouTubeRecipe {
  return (
    recipe.recipeKind === 'youtube' &&
    typeof recipe.youtubeVideoId === 'string' &&
    recipe.youtubeVideoId.length > 0 &&
    Array.isArray(recipe.timedSteps) &&
    recipe.timedSteps.length > 0
  );
}

export function youTubeThumbnailUrl(videoId: string): string {
  return `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
}

export type YouTubeEmbedOptions = {
  autoplay?: boolean;
  origin?: string;
};

export function youTubeEmbedUrl(
  videoId: string,
  startSeconds = 0,
  options: YouTubeEmbedOptions = {},
): string {
  const start = Math.max(0, Math.floor(startSeconds));
  const params = new URLSearchParams({
    start: String(start),
    rel: '0',
    modestbranding: '1',
    playsinline: '1',
  });
  if (options.autoplay) {
    params.set('autoplay', '1');
  }
  if (options.origin) {
    params.set('origin', options.origin);
  }
  return `https://www.youtube.com/embed/${videoId}?${params}`;
}
