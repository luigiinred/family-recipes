import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AppLayout } from './AppLayout';

beforeEach(() => {
  vi.stubGlobal(
    'ResizeObserver',
    vi.fn().mockImplementation(() => ({
      observe: vi.fn(),
      unobserve: vi.fn(),
      disconnect: vi.fn(),
    })),
  );
});

function renderLayout(initialPath: string) {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        <Route element={<AppLayout />}>
          <Route index element={<div>Home page</div>} />
          <Route path="recipes/:slug" element={<div>Recipe page</div>} />
        </Route>
      </Routes>
    </MemoryRouter>,
  );
}

describe('AppLayout navigation', () => {
  it('shows back link on recipe detail routes', () => {
    renderLayout('/recipes/test-soup');
    expect(screen.getByRole('link', { name: /all recipes/i })).toHaveAttribute('href', '/');
  });

  it('hides back link on the home route', () => {
    renderLayout('/');
    expect(screen.queryByRole('link', { name: /← all recipes/i })).not.toBeInTheDocument();
  });
});
