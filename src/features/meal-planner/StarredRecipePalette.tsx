import { Text } from '@/design-system/primitives';
import type { Recipe } from '@/static-api/types/recipe';
import { PlannerRecipeChip } from './PlannerRecipeChip';
import styles from './WeeklyPlanner.module.css';

type StarredRecipePaletteProps = {
  recipes: Recipe[];
};

export function StarredRecipePalette({ recipes }: StarredRecipePaletteProps) {
  return (
    <aside className={styles.palette} aria-label="Starred recipes">
      <Text as="h2" variant="subtitle">
        Starred recipes
      </Text>
      <Text variant="muted">Drag onto a day and meal slot, or use auto-fill.</Text>
      {recipes.length === 0 ? (
        <Text variant="muted">Star recipes from the catalog to see them here.</Text>
      ) : (
        <ul className={styles.paletteList}>
          {recipes.map((recipe) => (
            <li key={recipe.slug}>
              <PlannerRecipeChip recipe={recipe} />
            </li>
          ))}
        </ul>
      )}
    </aside>
  );
}
