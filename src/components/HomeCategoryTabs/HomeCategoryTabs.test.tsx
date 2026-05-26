import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import type { SearchCategory } from '@/features/search/searchCategories';
import { HomeCategoryTabs } from './HomeCategoryTabs';

const categories: SearchCategory[] = [
  { id: 'dinner', label: 'Dinner', filters: { mealType: 'dinner' } },
  { id: 'lunch', label: 'Lunch', filters: { mealType: 'lunch' } },
];

describe('HomeCategoryTabs', () => {
  it('renders custom categories and All recipes as the last tab', () => {
    render(
      <HomeCategoryTabs
        categories={categories}
        activeCategoryId={null}
        onSelectCategory={vi.fn()}
      />,
    );
    const tabs = screen.getAllByRole('tab');
    expect(tabs).toHaveLength(3);
    expect(tabs[0]).toHaveTextContent('Dinner');
    expect(tabs[1]).toHaveTextContent('Lunch');
    expect(tabs[2]).toHaveTextContent('All recipes');
  });

  it('marks the active tab with aria-selected', () => {
    const { rerender } = render(
      <HomeCategoryTabs
        categories={categories}
        activeCategoryId="dinner"
        onSelectCategory={vi.fn()}
      />,
    );
    expect(screen.getByRole('tab', { name: 'Dinner' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('tab', { name: 'Lunch' })).toHaveAttribute('aria-selected', 'false');
    expect(screen.getByRole('tab', { name: 'All recipes' })).toHaveAttribute(
      'aria-selected',
      'false',
    );

    rerender(
      <HomeCategoryTabs
        categories={categories}
        activeCategoryId={null}
        onSelectCategory={vi.fn()}
      />,
    );
    expect(screen.getByRole('tab', { name: 'All recipes' })).toHaveAttribute('aria-selected', 'true');
  });

  it('calls onSelectCategory when a tab is clicked', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(
      <HomeCategoryTabs
        categories={categories}
        activeCategoryId={null}
        onSelectCategory={onSelect}
      />,
    );
    await user.click(screen.getByRole('tab', { name: 'Dinner' }));
    expect(onSelect).toHaveBeenCalledWith('dinner');
    await user.click(screen.getByRole('tab', { name: 'All recipes' }));
    expect(onSelect).toHaveBeenCalledWith(null);
  });
});
