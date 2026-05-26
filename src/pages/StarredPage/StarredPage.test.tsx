import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { StarredPage } from './StarredPage';
import { saveStarredRecipes } from '@/features/starred-recipes/starredRecipes';
import { resetStarredRecipesCache } from '@/hooks/useStarredRecipes';

vi.mock('@/hooks/useRecipeCatalog', () => ({
  useRecipeCatalog: () => ({
    recipes: [
      {
        id: '1',
        slug: 'test-soup',
        title: 'Test Soup',
        description: '',
        imageUrl: '',
        prepMinutes: 0,
        cookMinutes: 0,
        servings: 4,
        tags: [],
        ingredients: [{ amount: '2', unit: 'cups', name: 'broth' }],
        steps: [],
      },
      {
        id: '2',
        slug: 'test-salad',
        title: 'Test Salad',
        description: '',
        imageUrl: '',
        prepMinutes: 0,
        cookMinutes: 0,
        servings: 4,
        tags: [],
        ingredients: [{ amount: '1', unit: 'Tbsp', name: 'olive oil' }],
        steps: [],
      },
    ],
    loading: false,
    error: null,
  }),
}));

beforeEach(() => {
  localStorage.clear();
  saveStarredRecipes(['test-soup', 'test-salad']);
  resetStarredRecipesCache();
});

describe('StarredPage', () => {
  it('renders the starred queue heading and items', () => {
    render(
      <MemoryRouter>
        <StarredPage />
      </MemoryRouter>,
    );
    expect(screen.getByRole('heading', { name: 'Starred' })).toBeInTheDocument();
    expect(screen.getByText('Test Soup')).toBeInTheDocument();
  });

  it('shows merged ingredients on the Ingredients tab', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <StarredPage />
      </MemoryRouter>,
    );
    await user.click(screen.getByRole('tab', { name: 'Ingredients' }));
    expect(screen.getByRole('heading', { name: 'broth' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'olive oil' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Test Soup' })).toBeInTheDocument();
  });
});
