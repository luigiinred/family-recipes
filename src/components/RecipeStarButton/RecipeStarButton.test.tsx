import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { RecipeStarButton } from './RecipeStarButton';

describe('RecipeStarButton', () => {
  it('shows an unstarred state with an accessible label', () => {
    render(
      <RecipeStarButton
        title="Test Soup"
        starred={false}
        onToggle={() => {}}
      />,
    );
  expect(
      screen.getByRole('button', { name: 'Star Test Soup' }),
    ).toHaveAttribute('aria-pressed', 'false');
  });

  it('shows a starred state with an accessible label', () => {
    render(
      <RecipeStarButton
        title="Test Soup"
        starred={true}
        onToggle={() => {}}
      />,
    );
    expect(
      screen.getByRole('button', { name: 'Remove Test Soup from starred' }),
    ).toHaveAttribute('aria-pressed', 'true');
  });

  it('calls onToggle when clicked', async () => {
    const user = userEvent.setup();
    const onToggle = vi.fn();
    render(
      <RecipeStarButton
        title="Test Soup"
        starred={false}
        onToggle={onToggle}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Star Test Soup' }));
    expect(onToggle).toHaveBeenCalledOnce();
  });
});
