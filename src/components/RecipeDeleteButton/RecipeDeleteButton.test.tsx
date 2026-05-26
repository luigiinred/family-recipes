import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { RecipeDeleteButton } from './RecipeDeleteButton';

describe('RecipeDeleteButton', () => {
  it('calls onDelete without bubbling', async () => {
    const user = userEvent.setup();
    const onDelete = vi.fn();
    const onParentClick = vi.fn();

    render(
      <div onClick={onParentClick}>
        <RecipeDeleteButton title="Test Soup" onDelete={onDelete} />
      </div>,
    );

    await user.click(screen.getByRole('button', { name: 'Delete Test Soup' }));
    expect(onDelete).toHaveBeenCalledOnce();
    expect(onParentClick).not.toHaveBeenCalled();
  });
});
