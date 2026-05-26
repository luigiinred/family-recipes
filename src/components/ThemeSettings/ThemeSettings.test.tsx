import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';
import { resetThemeCache } from '@/hooks/useTheme';
import { loadTheme } from '@/design-system/theme/themeStorage';
import { ThemeSettings } from './ThemeSettings';

describe('ThemeSettings', () => {
  beforeEach(() => {
    localStorage.clear();
    resetThemeCache();
    document.documentElement.setAttribute('data-theme', 'light');
  });

  it('persists theme selection', async () => {
    const user = userEvent.setup();
    render(<ThemeSettings />);

    await user.click(screen.getByRole('radio', { name: /dark/i }));
    expect(loadTheme()).toBe('dark');
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');

    await user.click(screen.getByRole('radio', { name: /classic/i }));
    expect(loadTheme()).toBe('classic');
    expect(document.documentElement.getAttribute('data-theme')).toBe('classic');
  });
});
