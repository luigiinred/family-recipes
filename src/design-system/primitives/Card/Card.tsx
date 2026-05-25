import type { ReactNode } from 'react';
import styles from './Card.module.css';

type CardProps = {
  children: ReactNode;
  className?: string;
  as?: 'div' | 'article' | 'li';
};

export function Card({ children, className, as: Component = 'div' }: CardProps) {
  const classes = [styles.card, className].filter(Boolean).join(' ');
  return <Component className={classes}>{children}</Component>;
}
