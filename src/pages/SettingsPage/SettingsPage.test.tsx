import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { resetEditorModeCache } from '@/hooks/useEditorMode';
import { resetThemeCache } from '@/hooks/useTheme';
import { resetRecipeEditsCache } from '@/hooks/useRecipeEdits';
import { loadEditorMode } from '@/features/recipe-edits/editorMode';
import * as staticApi from '@/static-api';
import type { Recipe } from '@/static-api/types/recipe';
import { upsertRecipeEdit } from '@/features/recipe-edits/recipeEdits';
import * as copyToClipboardModule from '@/lib/copyToClipboard';
import { SettingsPage } from './SettingsPage';

const recipe: Recipe = {
  id: '1',
  slug: 'test-soup',
  title: 'Test Soup',
  description: 'A cozy soup',
  imageUrl: '',
  prepMinutes: 10,
  cookMinutes: 20,
  servings: 4,
  tags: ['soup'],
  ingredients: [],
  steps: [],
};

describe('SettingsPage', () => {
  beforeEach(() => {
    localStorage.clear();
    resetRecipeEditsCache();
    resetEditorModeCache();
    resetThemeCache();
    vi.spyOn(staticApi, 'getRecipes').mockResolvedValue([recipe]);
    vi.spyOn(copyToClipboardModule, 'copyToClipboard').mockResolvedValue(undefined);
  });

  it('toggles editor mode', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <SettingsPage />
      </MemoryRouter>,
    );

    const toggle = screen.getByRole('checkbox', {
      name: /enable recipe editor on detail pages/i,
    });
    expect(toggle).not.toBeChecked();
    expect(loadEditorMode()).toBe(false);

    await user.click(toggle);
    expect(toggle).toBeChecked();
    expect(loadEditorMode()).toBe(true);

    await user.click(toggle);
    expect(loadEditorMode()).toBe(false);
  });

  it('shows export JSON when edits exist', async () => {
    upsertRecipeEdit('test-soup', { overrides: { title: 'Draft Soup' } });
    resetRecipeEditsCache();

    render(
      <MemoryRouter>
        <SettingsPage />
      </MemoryRouter>,
    );

    await waitFor(() => {
      const exportArea = screen.getByLabelText('Recipe edits export JSON') as HTMLTextAreaElement;
      expect(exportArea.value).toContain('Draft Soup');
    });
  });

  it('lists hidden recipes and restores them', async () => {
    const user = userEvent.setup();
    upsertRecipeEdit('test-soup', { removed: true });
    resetRecipeEditsCache();

    render(
      <MemoryRouter>
        <SettingsPage />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByRole('link', { name: 'Test Soup' })).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: 'Restore' }));
    await waitFor(() => {
      expect(screen.getByText('None hidden.')).toBeInTheDocument();
    });
  });

  it('copies export JSON to clipboard', async () => {
    const user = userEvent.setup();
    upsertRecipeEdit('test-soup', { overrides: { title: 'Draft Soup' } });
    resetRecipeEditsCache();

    render(
      <MemoryRouter>
        <SettingsPage />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Copy JSON' })).toBeEnabled();
    });

    await user.click(screen.getByRole('button', { name: 'Copy JSON' }));
    await waitFor(() => {
      expect(copyToClipboardModule.copyToClipboard).toHaveBeenCalledWith(
        expect.stringContaining('test-soup'),
      );
    });
  });
});
