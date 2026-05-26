import { getIngredientDisplayParts } from '@/static-api/units';
import type { Ingredient } from '@/static-api/types/recipe';
import styles from './IngredientLine.module.css';

type IngredientLineProps = {
  ingredient: Ingredient;
};

export function IngredientLine({ ingredient }: IngredientLineProps) {
  const { amount, unit, name } = getIngredientDisplayParts(ingredient);

  return (
    <span className={styles.line}>
      {amount ? (
        <>
          <span className={styles.amount}>{amount}</span>{' '}
        </>
      ) : null}
      {unit ? (
        <>
          <span className={styles.unit}>{unit}</span>{' '}
        </>
      ) : null}
      {name ? <span className={styles.name}>{name}</span> : null}
    </span>
  );
}
