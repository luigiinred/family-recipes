import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import {
  RecipeFilterProvider,
  useRecipeFilters,
} from '@/features/search/RecipeFilterContext';
import { TagFilterButton } from './TagFilterButton';

function TagsProbe() {
  const { tags } = useRecipeFilters();
  return <span data-testid="active-tags">{tags.join(',')}</span>;
}

function renderTagButton(route: string) {
  return render(
    <MemoryRouter initialEntries={[route]}>
      <RecipeFilterProvider>
        <Routes>
          <Route
            path="/"
            element={
              <>
                <TagFilterButton tag="soup" />
                <TagsProbe />
              </>
            }
          />
          <Route
            path="/recipes/:slug"
            element={
              <>
                <TagFilterButton tag="soup" />
                <TagsProbe />
              </>
            }
          />
        </Routes>
      </RecipeFilterProvider>
    </MemoryRouter>,
  );
}

describe('TagFilterButton', () => {
  it('adds the tag to shared filter state on home', async () => {
    const user = userEvent.setup();
    renderTagButton('/');
    await user.click(screen.getByRole('button', { name: 'Filter by soup' }));
    expect(screen.getByTestId('active-tags')).toHaveTextContent('soup');
  });

  it('navigates home and adds the tag from recipe detail', async () => {
    const user = userEvent.setup();
    renderTagButton('/recipes/test-soup');
    await user.click(screen.getByRole('button', { name: 'Filter by soup' }));
    expect(screen.getByTestId('active-tags')).toHaveTextContent('soup');
  });
});
