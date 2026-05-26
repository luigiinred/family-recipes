import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { QUEUE_DRAG_TYPE } from './queueDrag';
import { StarredQueue } from './StarredQueue';
import { saveStarredRecipes } from '@/features/starred-recipes/starredRecipes';
import { resetStarredRecipesCache } from '@/hooks/useStarredRecipes';
import type { Recipe } from '@/static-api/types/recipe';

const soup: Recipe = {
  id: '1',
  slug: 'test-soup',
  title: 'Test Soup',
  description: '',
  imageUrl: 'https://example.com/soup.jpg',
  prepMinutes: 0,
  cookMinutes: 0,
  servings: 4,
  tags: ['soup'],
  mealTypes: ['lunch', 'dinner'],
  ingredients: [],
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
  tags: ['salad'],
  mealTypes: ['side'],
  ingredients: [],
  steps: [],
};

function renderQueue(recipes: Recipe[] = [soup, salad]) {
  return render(
    <MemoryRouter>
      <StarredQueue recipes={recipes} />
    </MemoryRouter>,
  );
}

beforeEach(() => {
  localStorage.clear();
  saveStarredRecipes(['test-soup', 'test-salad']);
  resetStarredRecipesCache();
});

describe('StarredQueue', () => {
  it('shows starred recipes in saved order', () => {
    renderQueue();
    const items = screen.getAllByRole('listitem');
    expect(items).toHaveLength(2);
    expect(items[0]).toHaveTextContent('Test Soup');
    expect(items[1]).toHaveTextContent('Test Salad');
  });

  it('shows an empty state when nothing is starred', () => {
    saveStarredRecipes([]);
    resetStarredRecipesCache();
    renderQueue();
    expect(screen.getByRole('link', { name: 'Browse recipes' })).toBeInTheDocument();
    expect(screen.queryByRole('list', { name: 'Starred cook queue' })).not.toBeInTheDocument();
  });

  it('reorders when a row is dropped on another', () => {
    renderQueue();
    const items = screen.getAllByRole('listitem');
    const payload = JSON.stringify({ slug: 'test-soup', fromIndex: 0 });
    const dataTransfer = {
      effectAllowed: 'move',
      dropEffect: 'move',
      setData: vi.fn(),
      getData: (type: string) => (type === QUEUE_DRAG_TYPE ? payload : ''),
    };
    fireEvent.dragStart(items[0]!, { dataTransfer });
    fireEvent.dragOver(items[1]!, { dataTransfer });
    fireEvent.drop(items[1]!, { dataTransfer });

    const reordered = screen.getAllByRole('listitem');
    expect(reordered[0]).toHaveTextContent('Test Salad');
    expect(reordered[1]).toHaveTextContent('Test Soup');
    expect(loadOrder()).toEqual(['test-salad', 'test-soup']);
  });

  it('removes a recipe from the queue when unstarred', async () => {
    const user = userEvent.setup();
    renderQueue();
    await user.click(screen.getByRole('button', { name: 'Remove Test Soup from starred' }));
    expect(screen.queryByText('Test Soup')).not.toBeInTheDocument();
    expect(screen.getByText('Test Salad')).toBeInTheDocument();
  });
});

function loadOrder(): string[] {
  const raw = localStorage.getItem('recipes-starred-v1');
  return raw ? (JSON.parse(raw) as string[]) : [];
}
