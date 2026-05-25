import type { CSSProperties, ReactNode } from 'react';
import styles from './Stack.module.css';

type StackProps = {
  as?: 'div' | 'section' | 'ul' | 'ol' | 'nav' | 'header' | 'main';
  direction?: 'row' | 'column';
  gap?: 'sm' | 'md' | 'lg';
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
};

export function Stack({
  as: Component = 'div',
  direction = 'column',
  gap = 'md',
  children,
  className,
  style,
}: StackProps) {
  const classes = [styles.stack, styles[direction], styles[`gap-${gap}`], className]
    .filter(Boolean)
    .join(' ');
  return (
    <Component className={classes} style={style}>
      {children}
    </Component>
  );
}
