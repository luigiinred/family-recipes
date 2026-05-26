import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { CatalogEmptyState } from './CatalogEmptyState';

describe('CatalogEmptyState', () => {
  it('announces no matches with guidance text', () => {
    render(<CatalogEmptyState showClearAll={false} />);
    expect(screen.getByRole('status', { name: /no matches/i })).toBeInTheDocument();
    expect(screen.getByText(/try a different search/i)).toBeInTheDocument();
  });

  it('shows clear all when filters are active and calls the handler', async () => {
    const user = userEvent.setup();
    const onClearAll = vi.fn();
    render(<CatalogEmptyState showClearAll onClearAll={onClearAll} />);
    await user.click(screen.getByRole('button', { name: /clear all filters/i }));
    expect(onClearAll).toHaveBeenCalledOnce();
  });

  it('hides clear all when there is nothing to reset', () => {
    render(<CatalogEmptyState showClearAll={false} onClearAll={vi.fn()} />);
    expect(screen.queryByRole('button', { name: /clear all filters/i })).not.toBeInTheDocument();
  });
});
