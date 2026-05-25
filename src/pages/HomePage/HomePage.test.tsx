import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { HomePage } from './HomePage';

vi.mock('@/hooks/useRecipeCatalog', () => ({
  useRecipeCatalog: () => ({
    recipes: [
      {
        id: '1',
        slug: 'tomato-soup',
        title: 'Tomato Soup',
        description: '',
        imageUrl: '',
        prepMinutes: 0,
        cookMinutes: 0,
        servings: 4,
        tags: ['soup'],
        ingredients: [],
        steps: [],
      },
      {
        id: '2',
        slug: 'salad',
        title: 'Green Salad',
        description: '',
        imageUrl: '',
        prepMinutes: 0,
        cookMinutes: 0,
        servings: 2,
        tags: ['salad'],
        ingredients: [],
        steps: [],
      },
    ],
    loading: false,
    error: null,
  }),
}));

vi.mock('@/hooks/useAllTags', () => ({
  useAllTags: () => ['soup', 'salad'],
}));

describe('HomePage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('filters recipes by search query', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>,
    );
    expect(screen.getByRole('link', { name: /tomato soup/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /green salad/i })).toBeInTheDocument();
    await user.type(screen.getByLabelText(/search recipes/i), 'tomato');
    expect(screen.getByRole('link', { name: /tomato soup/i })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /green salad/i })).not.toBeInTheDocument();
  });
});
