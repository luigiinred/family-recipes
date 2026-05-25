import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it } from 'vitest';
import { saveStarredRecipes } from '@/features/starred-recipes/starredRecipes';
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

describe('RecipeCard', () => {
  beforeEach(() => {
    localStorage.clear();
    resetStarredRecipesCache();
  });

  it('links to the recipe detail page', () => {
    render(
      <MemoryRouter>
        <RecipeCard recipe={sample} />
      </MemoryRouter>,
    );
    expect(screen.getByRole('link', { name: /test soup/i })).toHaveAttribute(
      'href',
      '/recipes/test-soup',
    );
  });

  it('toggles starred state without navigating away', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <RecipeCard recipe={sample} />
      </MemoryRouter>,
    );

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

  it('shows starred recipes with the star visible', () => {
    saveStarredRecipes(new Set(['test-soup']));
    resetStarredRecipesCache();

    render(
      <MemoryRouter>
        <RecipeCard recipe={sample} />
      </MemoryRouter>,
    );

    expect(
      screen.getByRole('button', { name: 'Remove Test Soup from starred' }),
    ).toHaveAttribute('aria-pressed', 'true');
  });
});
