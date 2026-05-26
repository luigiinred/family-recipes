import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import type { Recipe } from '@/static-api/types/recipe';
import { RelatedRecipes } from './RelatedRecipes';

const chili: Recipe = {
  id: '2',
  slug: 'byl-kfa-chili',
  title: 'KFA Chili',
  description: 'Family chili',
  imageUrl: '',
  prepMinutes: 0,
  cookMinutes: 0,
  servings: 4,
  tags: ['family'],
  ingredients: [],
  steps: ['Simmer'],
};

const cheeseBread: Recipe = {
  id: '1',
  slug: 'byl-cheese-bread',
  title: 'Cheese Bread',
  description: 'Appetizer',
  imageUrl: '',
  prepMinutes: 0,
  cookMinutes: 0,
  servings: 4,
  tags: [],
  ingredients: [],
  steps: [],
};

describe('RelatedRecipes', () => {
  it('renders links to paired recipes', () => {
    render(
      <MemoryRouter>
        <RelatedRecipes recipes={[chili]} />
      </MemoryRouter>,
    );

    expect(screen.getByRole('navigation', { name: 'Related recipes' })).toBeInTheDocument();
    const link = screen.getByRole('link', { name: 'KFA Chili' });
    expect(link).toHaveAttribute('href', '/recipes/byl-kfa-chili');
  });

  it('renders nothing when the list is empty outside editor mode', () => {
    const { container } = render(
      <MemoryRouter>
        <RelatedRecipes recipes={[]} />
      </MemoryRouter>,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('shows link controls in editor mode when the list is empty', () => {
    render(
      <MemoryRouter>
        <RelatedRecipes
          recipes={[]}
          editorMode
          currentSlug="byl-cheese-bread"
          allRecipes={[cheeseBread, chili]}
          onPairedChange={() => {}}
        />
      </MemoryRouter>,
    );

    expect(screen.getByRole('navigation', { name: 'Related recipes' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Add linked recipe' })).toBeInTheDocument();
    expect(screen.queryByText('No linked recipes yet')).not.toBeInTheDocument();
  });

  it('searches and adds a linked recipe in editor mode', async () => {
    const user = userEvent.setup();
    const onPairedChange = vi.fn();

    render(
      <MemoryRouter>
        <RelatedRecipes
          recipes={[]}
          editorMode
          currentSlug="byl-cheese-bread"
          allRecipes={[cheeseBread, chili]}
          onPairedChange={onPairedChange}
        />
      </MemoryRouter>,
    );

    await user.click(screen.getByRole('button', { name: 'Add linked recipe' }));
    await user.type(screen.getByRole('combobox', { name: 'Search recipes' }), 'chili');
    await user.click(screen.getByRole('option', { name: 'KFA Chili' }));

    expect(onPairedChange).toHaveBeenCalledWith(['byl-kfa-chili']);
  });

  it('removes a linked recipe in editor mode', async () => {
    const user = userEvent.setup();
    const onPairedChange = vi.fn();

    render(
      <MemoryRouter>
        <RelatedRecipes
          recipes={[chili]}
          editorMode
          currentSlug="byl-cheese-bread"
          allRecipes={[cheeseBread, chili]}
          onPairedChange={onPairedChange}
        />
      </MemoryRouter>,
    );

    await user.click(screen.getByRole('button', { name: 'Remove link to KFA Chili' }));
    expect(onPairedChange).toHaveBeenCalledWith([]);
  });
});
