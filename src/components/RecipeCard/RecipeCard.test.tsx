import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
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
});
