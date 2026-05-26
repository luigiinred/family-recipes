import { Text } from '@/design-system/primitives';
import type { Recipe } from '@/static-api/types/recipe';
import { recipeMatchesMealType } from '@/static-api/mealTypes';
import { PlannerRecipeChip } from './PlannerRecipeChip';
import { allowPlannerDrop, readPlannerDrag } from './plannerDrag';
import type { DayId, MealSlot, PlannerDragPayload } from './types';
import styles from './WeeklyPlanner.module.css';

type PlannerCalendarCellProps = {
  dayId: DayId;
  dayLabel: string;
  slot: MealSlot;
  slotLabel: string;
  slug: string | null;
  recipe?: Recipe;
  onAssign: (payload: PlannerDragPayload) => void;
  onClear: () => void;
};

export function PlannerCalendarCell({
  dayId,
  dayLabel,
  slot,
  slotLabel,
  slug,
  recipe,
  onAssign,
  onClear,
}: PlannerCalendarCellProps) {
  const mismatch = recipe && !recipeMatchesMealType(recipe, slot);

  function handleDrop(event: React.DragEvent) {
    event.preventDefault();
    const payload = readPlannerDrag(event);
    if (payload) onAssign(payload);
  }

  return (
    <div
      className={[styles.cell, mismatch ? styles.cellMismatch : ''].filter(Boolean).join(' ')}
      onDragOver={allowPlannerDrop}
      onDrop={handleDrop}
      role="listitem"
      aria-label={`${slotLabel} on ${dayLabel}${slug ? `: ${recipe?.title ?? slug}` : ', empty'}`}
    >
      {recipe ? (
        <PlannerRecipeChip
          recipe={recipe}
          fromDay={dayId}
          fromSlot={slot}
          onClear={onClear}
          compact
        />
      ) : (
        <div className={styles.dropHint}>
          <Text variant="muted">Drop recipe</Text>
        </div>
      )}
      {mismatch ? (
        <Text variant="muted" className={styles.mismatchNote}>
          Not tagged for {slotLabel.toLowerCase()}
        </Text>
      ) : null}
    </div>
  );
}
