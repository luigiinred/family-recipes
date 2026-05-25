import { NavLink, Outlet } from 'react-router-dom';
import { Stack, Text } from '@/design-system/primitives';
import styles from './AppLayout.module.css';

const navItems = [
  { to: '/', label: 'Recipes' },
  { to: '/tags', label: 'Tags' },
  { to: '/planner', label: 'Planner' },
];

export function AppLayout() {
  return (
    <div className={styles.shell}>
      <header className={styles.header}>
        <Stack direction="row" gap="md" className={styles.headerInner}>
          <Text as="p" variant="label" className={styles.brand}>
            Family Recipes
          </Text>
          <nav className={styles.nav} aria-label="Main">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) =>
                  [styles.navLink, isActive ? styles.navActive : ''].filter(Boolean).join(' ')
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </Stack>
      </header>
      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  );
}
