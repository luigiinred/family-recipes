import { useId, useState } from 'react';
import { IngredientLine } from '@/components/IngredientLine/IngredientLine';
import type { Ingredient } from '@/static-api/types/recipe';
import styles from './IngredientMention.module.css';

type IngredientMentionProps = {
  label: string;
  ingredient: Ingredient;
};

export function IngredientMention({ label, ingredient }: IngredientMentionProps) {
  const [open, setOpen] = useState(false);
  const popoverId = useId();

  return (
    <span
      className={styles.wrap}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={() => setOpen(false)}
    >
      <strong className={styles.mention}>{label}</strong>
      {open ? (
        <span
          id={popoverId}
          role="tooltip"
          className={styles.popover}
          onMouseEnter={() => setOpen(true)}
          onMouseLeave={() => setOpen(false)}
        >
          <IngredientLine ingredient={ingredient} />
        </span>
      ) : null}
    </span>
  );
}
