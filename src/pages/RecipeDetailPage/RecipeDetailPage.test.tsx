import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { resetStarredRecipesCache } from '@/hooks/useStarredRecipes';
import * as staticApi from '@/static-api';
import type { Recipe } from '@/static-api/types/recipe';
import { RecipeDetailPage } from './RecipeDetailPage';

const standardRecipe: Recipe = {
  id: '1',
  slug: 'test-soup',
  title: 'Test Soup',
  description: 'A cozy soup',
  imageUrl: '',
  prepMinutes: 10,
  cookMinutes: 20,
  servings: 4,
  tags: ['soup'],
  ingredients: [{ amount: '1', unit: 'cup', name: 'broth' }],
  steps: ['Simmer soup'],
};

const youtubeRecipe: Recipe = {
  id: 'yt-1',
  slug: 'youtube-demo-roasted-vegetables',
  title: 'Roasted vegetables (video)',
  description: 'Video walkthrough',
  imageUrl: 'https://i.ytimg.com/vi/abc12345678/hqdefault.jpg',
  prepMinutes: 15,
  cookMinutes: 45,
  servings: 4,
  tags: ['video'],
  ingredients: [{ amount: '2', unit: 'cups', name: 'zucchini' }],
  steps: ['Prep vegetables', 'Roast in oven'],
  recipeKind: 'youtube',
  youtubeVideoId: 'abc12345678',
  timedSteps: [
    { text: 'Prep vegetables', startSeconds: 45 },
    { text: 'Roast in oven', startSeconds: 312 },
  ],
  sourceUrl: 'https://www.youtube.com/watch?v=abc12345678',
};

function renderAt(slug: string) {
  return render(
    <MemoryRouter initialEntries={[`/recipes/${slug}`]}>
      <Routes>
        <Route path="/recipes/:slug" element={<RecipeDetailPage />} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('RecipeDetailPage starring', () => {
  beforeEach(() => {
    localStorage.clear();
    resetStarredRecipesCache();
    vi.spyOn(staticApi, 'getRecipeBySlug').mockResolvedValue(standardRecipe);
  });

  it('toggles starred state from the recipe header', async () => {
    const user = userEvent.setup();
    renderAt('test-soup');
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Test Soup' })).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: 'Star Test Soup' }));
    expect(
      screen.getByRole('button', { name: 'Remove Test Soup from starred' }),
    ).toHaveAttribute('aria-pressed', 'true');
  });
});

describe('RecipeDetailPage video recipes', () => {
  beforeEach(() => {
    vi.spyOn(staticApi, 'getRecipeBySlug').mockResolvedValue(youtubeRecipe);
  });

  it('shows embedded player and timestamped steps', async () => {
    renderAt('youtube-demo-roasted-vegetables');
    await waitFor(() => {
      expect(screen.getByTitle('Roasted vegetables (video)')).toBeInTheDocument();
    });
    expect(screen.getByRole('button', { name: /prep vegetables/i })).toBeInTheDocument();
  });

  it('seeks the embed when a timed step is clicked', async () => {
    const user = userEvent.setup();
    renderAt('youtube-demo-roasted-vegetables');
    await waitFor(() => {
      expect(screen.getByTitle('Roasted vegetables (video)')).toBeInTheDocument();
    });
    expect(screen.getByTitle('Roasted vegetables (video)')).toHaveAttribute(
      'src',
      expect.stringContaining('start=0'),
    );

    await user.click(screen.getByRole('button', { name: /roast in oven/i }));
    await waitFor(() => {
      const src = screen.getByTitle('Roasted vegetables (video)').getAttribute('src');
      expect(src).toContain('start=312');
      expect(src).toMatch(/autoplay=1/);
    });
  });
});
