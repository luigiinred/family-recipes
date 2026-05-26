import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { RecipeFilterProvider } from '@/features/search/RecipeFilterContext';
import { NavRecipeSearch } from './NavRecipeSearch';

vi.mock('@/hooks/useAllTags', () => ({
  useAllTags: () => ['soup', 'salad', 'pasta', 'rare-tag'],
}));

function renderSearch() {
  return render(
    <MemoryRouter>
      <RecipeFilterProvider>
        <NavRecipeSearch />
      </RecipeFilterProvider>
    </MemoryRouter>,
  );
}

describe('NavRecipeSearch', () => {
  it('hides tag options until the search field is focused', async () => {
    const user = userEvent.setup();
    renderSearch();
    expect(screen.queryByRole('button', { name: 'vegetarian' })).not.toBeInTheDocument();
    await user.click(screen.getByRole('searchbox', { name: /search text/i }));
    expect(screen.getByRole('button', { name: 'vegetarian' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'rare-tag' })).not.toBeInTheDocument();
  });

  it('reveals all catalog tags when more tags is expanded', async () => {
    const user = userEvent.setup();
    renderSearch();
    await user.click(screen.getByRole('searchbox', { name: /search text/i }));
    await user.click(screen.getByRole('button', { name: /more tags/i }));
    expect(screen.getByRole('button', { name: 'rare-tag' })).toBeInTheDocument();
  });

  it('toggles a tag filter from the panel', async () => {
    const user = userEvent.setup();
    renderSearch();
    await user.click(screen.getByRole('searchbox', { name: /search text/i }));
    await user.click(screen.getByRole('button', { name: 'soup' }));
    const active = screen.getByRole('button', { name: /remove soup filter/i });
    expect(active).toBeInTheDocument();
    await user.click(active);
    expect(screen.queryByRole('button', { name: /remove soup filter/i })).not.toBeInTheDocument();
  });

  it('toggles Quick ideas from the filter panel', async () => {
    const user = userEvent.setup();
    renderSearch();
    await user.click(screen.getByRole('searchbox', { name: /search text/i }));
    const quickIdeas = screen.getByRole('button', { name: 'Quick ideas' });
    expect(quickIdeas).toHaveAttribute('aria-pressed', 'false');
    await user.click(quickIdeas);
    expect(quickIdeas).toHaveAttribute('aria-pressed', 'true');
    expect(localStorage.getItem('recipes-include-ideas')).toBe('true');
  });

  it('shows active tag chips inside the search field while collapsed', async () => {
    const user = userEvent.setup();
    renderSearch();
    const search = screen.getByRole('search', { name: /search recipes/i });
    await user.click(within(search).getByRole('searchbox', { name: /search text/i }));
    await user.click(screen.getByRole('button', { name: 'soup' }));
    await user.click(document.body);
    expect(within(search).getByRole('button', { name: /remove soup filter/i })).toBeInTheDocument();
    expect(screen.queryByRole('region', { name: /recipe filters/i })).not.toBeInTheDocument();
  });
});
