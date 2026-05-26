import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { BentoPlannerPage } from './BentoPlannerPage';
import { loadBentoPicks } from '@/features/bento-planner/bentoPlannerStorage';

function renderPage() {
  return render(
    <MemoryRouter>
      <BentoPlannerPage />
    </MemoryRouter>,
  );
}

beforeEach(() => {
  localStorage.clear();
});

describe('BentoPlannerPage', () => {
  it('shows the page title and section browse headings', async () => {
    renderPage();
    expect(await screen.findByRole('heading', { name: 'Bento planner' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Snack & crunch' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Fruit' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Treat' })).toBeInTheDocument();
  });

  it('shows cheese zips in the snack section', async () => {
    renderPage();
    expect(await screen.findByRole('heading', { name: 'Cheese Zips' })).toBeInTheDocument();
  });

  it('adds an idea to the box up to the chosen count', async () => {
    const user = userEvent.setup();
    renderPage();
    await screen.findByRole('heading', { name: 'Cheese Zips' });

    await user.click(screen.getByRole('button', { name: '4' }));
    const cheeseCard = screen.getByRole('heading', { name: 'Cheese Zips' }).closest('li');
    const addButton = cheeseCard?.querySelector('button');
    expect(addButton).toBeTruthy();
    await user.click(addButton!);

    expect(screen.getByText('Your bento (1/4)')).toBeInTheDocument();
    expect(screen.getByText('Cheese Zips', { selector: 'p' })).toBeInTheDocument();
  });

  it('links to a recipe when recipeSlug is set', async () => {
    renderPage();
    expect(await screen.findByRole('link', { name: 'View recipe' })).toHaveAttribute(
      'href',
      '/recipes/orzo-salad',
    );
  });

  it('randomizes the whole bento box', async () => {
    const user = userEvent.setup();
    renderPage();
    await screen.findByRole('heading', { name: 'Cheese Zips' });

    await user.click(screen.getByRole('button', { name: '4' }));
    await user.click(screen.getByRole('button', { name: /randomize bento box/i }));

    expect(screen.getByText('Your bento (4/4)')).toBeInTheDocument();
    const picks = loadBentoPicks();
    expect(picks).toHaveLength(4);
    expect(new Set(picks).size).toBe(4);
  });

  it('randomizes an individual filled slot', async () => {
    const user = userEvent.setup();
    renderPage();
    await screen.findByRole('heading', { name: 'Cheese Zips' });

    await user.click(screen.getByRole('button', { name: '4' }));

    const cheeseCard = screen.getByRole('heading', { name: 'Cheese Zips' }).closest('li');
    const addButton = cheeseCard?.querySelector('button');
    expect(addButton).toBeTruthy();
    await user.click(addButton!);

    expect(loadBentoPicks()).toEqual(['cheese-zips']);
    await user.click(screen.getByRole('button', { name: /randomize item 1/i }));

    const nextPicks = loadBentoPicks();
    expect(nextPicks).toHaveLength(1);
    expect(nextPicks[0]).not.toBe('cheese-zips');
  });
});
