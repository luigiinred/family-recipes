import { Link } from 'react-router-dom';
import { Text } from '@/design-system/primitives';
import type { Recipe } from '@/static-api/types/recipe';
import { MEAL_TYPE_LABELS } from '@/static-api/mealTypes';
import { resolveMealTypes } from '@/static-api/mealTypes';
import { allowPlannerDrop, readPlannerDrag, writePlannerDrag } from './plannerDrag';
import type { DayId, MealSlot, PlannerDragPayload } from './types';
import styles from './WeeklyPlanner.module.css';

type PlannerRecipeChipProps = {
  recipe: Recipe;
  fromDay?: DayId;
  fromSlot?: MealSlot;
  onDrop?: (payload: PlannerDragPayload, day: DayId, slot: MealSlot) => void;
  onClear?: () => void;
  compact?: boolean;
};

export function PlannerRecipeChip({
  recipe,
  fromDay,
  fromSlot,
  onDrop,
  onClear,
  compact = false,
}: PlannerRecipeChipProps) {
  const mealTypes = resolveMealTypes(recipe);

  function handleDragStart(event: React.DragEvent) {
    writePlannerDrag(event, { slug: recipe.slug, fromDay, fromSlot });
  }

  return (
    <article
      className={[styles.chip, compact ? styles.chipCompact : ''].filter(Boolean).join(' ')}
      draggable
      onDragStart={handleDragStart}
      onDragOver={allowPlannerDrop}
      onDrop={
        onDrop && fromDay && fromSlot
          ? (event) => {
              event.preventDefault();
              event.stopPropagation();
              const payload = readPlannerDrag(event);
              if (payload) onDrop(payload, fromDay, fromSlot);
            }
          : undefined
      }
    >
      <Text variant="label" className={styles.chipTitle}>
        {recipe.title}
      </Text>
      {!compact ? (
        <ul className={styles.chipTags} aria-label="Meal types">
          {mealTypes.map((type) => (
            <li key={type}>{MEAL_TYPE_LABELS[type]}</li>
          ))}
        </ul>
      ) : null}
      <div className={styles.chipActions}>
        <Link to={`/recipes/${recipe.slug}`} className={styles.chipLink}>
          View
        </Link>
        {onClear ? (
          <button type="button" className={styles.chipClear} onClick={onClear}>
            Remove
          </button>
        ) : null}
      </div>
    </article>
  );
}
