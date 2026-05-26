import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import {
  RecipeFilterProvider,
  useRecipeFilters,
} from './RecipeFilterContext';

function Probe() {
  const { query, tags, setQuery, addTag, toggleTag } = useRecipeFilters();
  return (
    <div>
      <span data-testid="query">{query}</span>
      <span data-testid="tags">{tags.join(',')}</span>
      <button type="button" onClick={() => setQuery('tomato')}>
        set query
      </button>
      <button type="button" onClick={() => addTag('soup')}>
        add soup
      </button>
      <button type="button" onClick={() => toggleTag('soup')}>
        toggle soup
      </button>
    </div>
  );
}

describe('RecipeFilterProvider', () => {
  it('shares query and tag state', async () => {
    const user = userEvent.setup();
    render(
      <RecipeFilterProvider>
        <Probe />
      </RecipeFilterProvider>,
    );
    await user.click(screen.getByRole('button', { name: 'set query' }));
    expect(screen.getByTestId('query')).toHaveTextContent('tomato');
    await user.click(screen.getByRole('button', { name: 'add soup' }));
    expect(screen.getByTestId('tags')).toHaveTextContent('soup');
    await user.click(screen.getByRole('button', { name: 'add soup' }));
    expect(screen.getByTestId('tags')).toHaveTextContent('soup');
    await user.click(screen.getByRole('button', { name: 'toggle soup' }));
    expect(screen.getByTestId('tags')).toHaveTextContent('');
  });
});
