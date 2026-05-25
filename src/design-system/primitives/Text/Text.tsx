import type { ElementType, ReactNode } from 'react';
import styles from './Text.module.css';

type TextProps = {
  as?: ElementType;
  variant?: 'body' | 'muted' | 'title' | 'subtitle' | 'label';
  children: ReactNode;
  className?: string;
};

const variantClass: Record<NonNullable<TextProps['variant']>, string> = {
  body: styles.body,
  muted: styles.muted,
  title: styles.title,
  subtitle: styles.subtitle,
  label: styles.label,
};

export function Text({
  as: Component = 'p',
  variant = 'body',
  children,
  className,
}: TextProps) {
  const classes = [variantClass[variant], className].filter(Boolean).join(' ');
  return <Component className={classes}>{children}</Component>;
}
