import { useEffect, useRef } from 'react';
import { Link, NavLink, Outlet, useMatch } from 'react-router-dom';
import { NavRecipeSearch } from '@/components/NavRecipeSearch/NavRecipeSearch';
import { RecipeFilterProvider } from '@/features/search/RecipeFilterContext';
import { Text } from '@/design-system/primitives';
import { useTheme } from '@/hooks/useTheme';
import styles from './AppLayout.module.css';

type NavItem = {
  to: string;
  label: string;
  ariaLabel?: string;
  iconOnly?: boolean;
};

const navItems: NavItem[] = [
  { to: '/', label: 'Recipes' },
  { to: '/starred', label: 'Starred' },
  { to: '/bento', label: 'Bento' },
  { to: '/settings', label: 'Settings', ariaLabel: 'Settings', iconOnly: true },
];

export function AppLayout() {
  const { theme } = useTheme();
  const headerRef = useRef<HTMLElement>(null);
  const onRecipeDetail = useMatch({ path: '/recipes/:slug', end: true });
  const brandTitle = theme === 'classic' ? 'Garrabrant Family Recipes' : 'Family Recipes';

  useEffect(() => {
    const header = headerRef.current;
    if (!header) return;

    const syncHeaderHeight = () => {
      document.documentElement.style.setProperty(
        '--app-header-height',
        `${header.offsetHeight}px`,
      );
    };

    syncHeaderHeight();
    const observer = new ResizeObserver(syncHeaderHeight);
    observer.observe(header);
    return () => observer.disconnect();
  }, []);

  return (
    <RecipeFilterProvider>
      <div className={styles.shell}>
        <header ref={headerRef} className={styles.header}>
          <div className={styles.headerInner}>
            <div className={styles.headerLead}>
              {onRecipeDetail ? (
                <Link to="/" className={styles.backNav}>
                  ← Recipes
                </Link>
              ) : (
                <Text as="p" variant="label" className={styles.brand}>
                  <span className={styles.brandFull}>{brandTitle}</span>
                  <span className={styles.brandShort}>
                    {theme === 'classic' ? 'Family' : 'Recipes'}
                  </span>
                </Text>
              )}
            </div>
            <nav className={styles.nav} aria-label="Main">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === '/'}
                  aria-label={item.ariaLabel}
                  className={({ isActive }) =>
                    [styles.navLink, isActive ? styles.navActive : ''].filter(Boolean).join(' ')
                  }
                >
                  {item.iconOnly ? (
                    <span className={styles.settingsIcon} aria-hidden>
                      ⚙
                    </span>
                  ) : (
                    item.label
                  )}
                </NavLink>
              ))}
            </nav>
            <div className={styles.search}>
              <NavRecipeSearch />
            </div>
          </div>
        </header>
        <main className={styles.main}>
          <Outlet />
        </main>
      </div>
    </RecipeFilterProvider>
  );
}
