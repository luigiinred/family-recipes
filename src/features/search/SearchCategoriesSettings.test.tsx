import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';
import { loadSearchCategories, saveSearchCategories } from './searchCategories';
import { SearchCategoriesSettings } from './SearchCategoriesSettings';

describe('SearchCategoriesSettings', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('updates category label and persists', async () => {
    const user = userEvent.setup();
    saveSearchCategories([{ id: 'dinner', label: 'Dinner', filters: { mealType: 'dinner' } }]);

    render(<SearchCategoriesSettings />);

    const labelInput = screen.getByLabelText('Category name for Dinner');
    await user.clear(labelInput);
    await user.type(labelInput, 'Dinner ideas');

    await waitFor(() => {
      expect(loadSearchCategories()[0]?.label).toBe('Dinner ideas');
    });
  });
});
