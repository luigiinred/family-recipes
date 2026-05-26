import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ComponentProps } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { RecipeFilterProvider } from '@/features/search/RecipeFilterContext';
import { RecipeTags } from './RecipeTags';

function renderTags(props: Partial<ComponentProps<typeof RecipeTags>> = {}) {
  return render(
    <MemoryRouter>
      <RecipeFilterProvider>
      <RecipeTags
        tags={['soup']}
        allTags={['soup', 'slow-cooker', 'vegetarian']}
        onTagsChange={vi.fn()}
        {...props}
      />
      </RecipeFilterProvider>
    </MemoryRouter>,
  );
}

describe('RecipeTags', () => {
  it('shows recipe tags as filter buttons', () => {
    renderTags();
    expect(screen.getByRole('button', { name: 'Filter by soup' })).toBeInTheDocument();
  });

  it('suggests existing catalog tags when adding', async () => {
    const user = userEvent.setup();
    renderTags();

    await user.click(screen.getByRole('button', { name: 'Add tag' }));
    await user.type(screen.getByRole('combobox', { name: 'Tag name' }), 'slow');

    expect(screen.getByRole('option', { name: 'slow-cooker' })).toBeInTheDocument();
  });

  it('offers to create a new tag when there is no match', async () => {
    const user = userEvent.setup();
    renderTags();

    await user.click(screen.getByRole('button', { name: 'Add tag' }));
    await user.type(screen.getByRole('combobox', { name: 'Tag name' }), 'toddler friendly');

    expect(screen.getByRole('option', { name: /create tag toddler-friendly/i })).toBeInTheDocument();
  });

  it('adds a selected existing tag', async () => {
    const user = userEvent.setup();
    const onTagsChange = vi.fn();
    renderTags({ onTagsChange });

    await user.click(screen.getByRole('button', { name: 'Add tag' }));
    await user.click(screen.getByRole('option', { name: 'vegetarian' }));

    expect(onTagsChange).toHaveBeenCalledWith(['soup', 'vegetarian']);
  });

  it('adds a new tag from the create option', async () => {
    const user = userEvent.setup();
    const onTagsChange = vi.fn();
    renderTags({ onTagsChange });

    await user.click(screen.getByRole('button', { name: 'Add tag' }));
    await user.type(screen.getByRole('combobox', { name: 'Tag name' }), 'weeknight');
    await user.click(screen.getByRole('option', { name: /create tag weeknight/i }));

    expect(onTagsChange).toHaveBeenCalledWith(['soup', 'weeknight']);
  });

  it('removes a tag from the recipe', async () => {
    const user = userEvent.setup();
    const onTagsChange = vi.fn();
    renderTags({ onTagsChange });

    await user.click(screen.getByRole('button', { name: 'Remove tag soup' }));

    expect(onTagsChange).toHaveBeenCalledWith([]);
  });
});
