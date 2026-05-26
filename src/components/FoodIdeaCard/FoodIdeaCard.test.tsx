import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { RecipeFilterProvider } from '@/features/search/RecipeFilterContext';
import type { FoodIdea } from '@/static-api/types/foodIdea';
import { FoodIdeaCard } from './FoodIdeaCard';

const idea: FoodIdea = {
  id: '1',
  slug: 'chips-and-dip',
  title: 'Chips and dip',
  description: 'Pantry snack',
  imageUrl: '/images/ideas/chips-and-dip.png',
  tags: ['pantry'],
  mealTypes: ['snack'],
  ideaKind: 'pantry',
};

describe('FoodIdeaCard', () => {
  it('shows title, image, and kind badge like recipe cards', () => {
    render(
      <MemoryRouter>
        <RecipeFilterProvider>
          <FoodIdeaCard idea={idea} />
        </RecipeFilterProvider>
      </MemoryRouter>,
    );
    expect(screen.getByRole('heading', { name: 'Chips and dip' })).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'Chips and dip' })).toHaveAttribute(
      'src',
      '/images/ideas/chips-and-dip.png',
    );
    expect(screen.getByText('Pantry')).toBeInTheDocument();
  });
});
