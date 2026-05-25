import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { Recipe } from '@/static-api/types/recipe';
import { RecipeMeta } from './RecipeMeta';

const base: Recipe = {
  id: '1',
  slug: 'a',
  title: 'Soup',
  description: 'Warm',
  imageUrl: '',
  prepMinutes: 0,
  cookMinutes: 0,
  servings: 4,
  tags: ['soup'],
  ingredients: [],
  steps: [],
};

describe('RecipeMeta', () => {
  it('shows a low effort badge when effort is low', () => {
    render(<RecipeMeta recipe={{ ...base, effort: 'low' }} showTags={false} />);
    expect(screen.getByText('Low effort')).toBeInTheDocument();
  });

  it('does not show a low effort badge when effort is unset', () => {
    render(<RecipeMeta recipe={base} showTags={false} />);
    expect(screen.queryByText('Low effort')).not.toBeInTheDocument();
  });
});
