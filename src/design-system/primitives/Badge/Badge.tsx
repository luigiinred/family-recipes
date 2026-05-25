import type { ReactNode } from 'react';
import styles from './Badge.module.css';

type BadgeProps = {
  children: ReactNode;
  className?: string;
};

export function Badge({ children, className }: BadgeProps) {
  const classes = [styles.badge, className].filter(Boolean).join(' ');
  return <span className={classes}>{children}</span>;
}
