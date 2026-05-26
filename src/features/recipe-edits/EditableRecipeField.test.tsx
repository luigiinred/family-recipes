import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { EditableRecipeField } from './EditableRecipeField';

describe('EditableRecipeField', () => {
  it('renders children only when editor mode is off', () => {
    render(
      <EditableRecipeField
        label="title"
        editorMode={false}
        value="Soup"
        onSave={vi.fn()}
      >
        <h1>Soup</h1>
      </EditableRecipeField>,
    );
    expect(screen.getByRole('heading', { name: 'Soup' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Edit title' })).not.toBeInTheDocument();
  });

  it('opens an inline form when Edit is clicked', async () => {
    const user = userEvent.setup();
    const onSave = vi.fn();
    render(
      <EditableRecipeField
        label="title"
        editorMode
        value="Soup"
        aiNoteKey="title"
        onSave={onSave}
      >
        <h1>Soup</h1>
      </EditableRecipeField>,
    );

    await user.click(screen.getByRole('button', { name: 'Edit title' }));
    const input = screen.getByLabelText('title');
    await user.clear(input);
    await user.type(input, 'Better Soup');
    await user.click(screen.getByRole('button', { name: 'Save' }));

    expect(onSave).toHaveBeenCalledWith('Better Soup', '');
  });
});
