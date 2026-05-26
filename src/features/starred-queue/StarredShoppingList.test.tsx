import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { copyToClipboard } from '@/lib/copyToClipboard';
import { StarredShoppingList } from './StarredShoppingList';
import type { Recipe } from '@/static-api/types/recipe';

vi.mock('@/lib/copyToClipboard', () => ({
  copyToClipboard: vi.fn().mockResolvedValue(undefined),
}));

const soup: Recipe = {
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
};

const salad: Recipe = {
  id: '2',
  slug: 'test-salad',
  title: 'Test Salad',
  description: '',
  imageUrl: '',
  prepMinutes: 0,
  cookMinutes: 0,
  servings: 4,
  tags: [],
  ingredients: [{ amount: '1', unit: 'cup', name: 'broth' }],
  steps: [],
};

function renderList(recipes: Recipe[]) {
  return render(
    <MemoryRouter>
      <StarredShoppingList recipes={recipes} />
    </MemoryRouter>,
  );
}

describe('StarredShoppingList', () => {
  beforeEach(() => {
    vi.mocked(copyToClipboard).mockClear();
  });

  it('groups ingredients and shows which recipes use them', () => {
    renderList([soup, salad]);
    expect(screen.getByRole('heading', { name: 'broth' })).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getAllByText('cup').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByRole('link', { name: 'Test Soup' })).toHaveAttribute(
      'href',
      '/recipes/test-soup',
    );
    expect(screen.getByRole('link', { name: 'Test Salad' })).toHaveAttribute(
      'href',
      '/recipes/test-salad',
    );
  });

  it('copies the merged list to the clipboard', async () => {
    const user = userEvent.setup();
    renderList([soup]);
    await user.click(screen.getByRole('button', { name: 'Copy list' }));
    await waitFor(() => {
      expect(copyToClipboard).toHaveBeenCalledWith(expect.stringContaining('broth'));
    });
    expect(screen.getByRole('button', { name: 'Copied' })).toBeInTheDocument();
  });
});
