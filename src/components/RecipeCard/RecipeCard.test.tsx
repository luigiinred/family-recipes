import type { ReactElement } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  RecipeFilterProvider,
  useRecipeFilters,
} from '@/features/search/RecipeFilterContext';
import { saveEditorMode } from '@/features/recipe-edits/editorMode';
import { loadRecipeEdits } from '@/features/recipe-edits/recipeEdits';
import { saveStarredRecipes } from '@/features/starred-recipes/starredRecipes';
import { resetEditorModeCache } from '@/hooks/useEditorMode';
import { resetRecipeEditsCache } from '@/hooks/useRecipeEdits';
import { resetStarredRecipesCache } from '@/hooks/useStarredRecipes';
import type { Recipe } from '@/static-api/types/recipe';
import { RecipeCard } from './RecipeCard';

const sample: Recipe = {
  id: '1',
  slug: 'test-soup',
  title: 'Test Soup',
  description: 'A cozy soup',
  imageUrl: '',
  prepMinutes: 10,
  cookMinutes: 20,
  servings: 4,
  tags: ['soup'],
  ingredients: [],
  steps: [],
};

const youtubeSample: Recipe = {
  ...sample,
  slug: 'youtube-demo',
  title: 'Video Demo',
  recipeKind: 'youtube',
  youtubeVideoId: 'abc12345678',
  timedSteps: [{ text: 'Start', startSeconds: 0 }],
};

function renderCard(ui: ReactElement) {
  return render(
    <MemoryRouter>
      <RecipeFilterProvider>{ui}</RecipeFilterProvider>
    </MemoryRouter>,
  );
}

describe('RecipeCard', () => {
  beforeEach(() => {
    localStorage.clear();
    resetStarredRecipesCache();
    resetRecipeEditsCache();
    resetEditorModeCache();
  });

  it('shows a video indicator for YouTube recipes', () => {
    renderCard(<RecipeCard recipe={youtubeSample} />);
    expect(screen.getByRole('img', { name: 'Video recipe' })).toBeInTheDocument();
  });

  it('does not show a video indicator for standard recipes', () => {
    renderCard(<RecipeCard recipe={sample} />);
    expect(screen.queryByRole('img', { name: 'Video recipe' })).not.toBeInTheDocument();
  });

  it('does not show the recipe description', () => {
    renderCard(<RecipeCard recipe={sample} />);
    expect(screen.queryByText('A cozy soup')).not.toBeInTheDocument();
  });

  it('applies a tag filter without navigating to the recipe', async () => {
    const user = userEvent.setup();

    function TagProbe() {
      const { tags } = useRecipeFilters();
      return <span data-testid="tags">{tags.join(',')}</span>;
    }

    renderCard(
      <>
        <TagProbe />
        <RecipeCard recipe={sample} />
      </>,
    );

    await user.click(screen.getByRole('button', { name: 'Filter by soup' }));
    expect(screen.getByTestId('tags')).toHaveTextContent('soup');
    expect(screen.getByRole('link', { name: /test soup/i })).toHaveAttribute(
      'href',
      '/recipes/test-soup',
    );
  });

  it('links to the recipe detail page', () => {
    renderCard(<RecipeCard recipe={sample} />);
    expect(screen.getByRole('link', { name: /test soup/i })).toHaveAttribute(
      'href',
      '/recipes/test-soup',
    );
  });

  it('toggles starred state without navigating away', async () => {
    const user = userEvent.setup();
    renderCard(<RecipeCard recipe={sample} />);

    const starButton = screen.getByRole('button', { name: 'Star Test Soup' });
    await user.click(starButton);

    expect(
      screen.getByRole('button', { name: 'Remove Test Soup from starred' }),
    ).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('link', { name: /test soup/i })).toHaveAttribute(
      'href',
      '/recipes/test-soup',
    );
  });

  it('shows delete on hover when editor mode is on', async () => {
    const user = userEvent.setup();
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    saveEditorMode(true);
    resetEditorModeCache();

    renderCard(<RecipeCard recipe={sample} />);

    const deleteButton = screen.getByRole('button', { name: 'Delete Test Soup' });
    expect(deleteButton).toBeInTheDocument();

    await user.click(deleteButton);
    expect(loadRecipeEdits().edits['test-soup']?.removed).toBe(true);
  });

  it('shows starred recipes with the star visible', () => {
    saveStarredRecipes(['test-soup']);
    resetStarredRecipesCache();

    renderCard(<RecipeCard recipe={sample} />);

    expect(
      screen.getByRole('button', { name: 'Remove Test Soup from starred' }),
    ).toHaveAttribute('aria-pressed', 'true');
  });
});
