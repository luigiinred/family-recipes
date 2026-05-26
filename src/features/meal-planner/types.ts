import type { MealType } from '@/static-api/mealTypes';
import { MEAL_TYPES, MEAL_TYPE_LABELS } from '@/static-api/mealTypes';

export type { MealType };

/** Meal slot on the weekly calendar (same values as recipe `mealTypes`). */
export type MealSlot = MealType;

export type DayId = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun';

export const DAYS: readonly { id: DayId; label: string; shortLabel: string }[] = [
  { id: 'mon', label: 'Monday', shortLabel: 'Mon' },
  { id: 'tue', label: 'Tuesday', shortLabel: 'Tue' },
  { id: 'wed', label: 'Wednesday', shortLabel: 'Wed' },
  { id: 'thu', label: 'Thursday', shortLabel: 'Thu' },
  { id: 'fri', label: 'Friday', shortLabel: 'Fri' },
  { id: 'sat', label: 'Saturday', shortLabel: 'Sat' },
  { id: 'sun', label: 'Sunday', shortLabel: 'Sun' },
] as const;

export const MEAL_SLOTS: readonly { id: MealSlot; label: string }[] = MEAL_TYPES.map(
  (id) => ({
    id,
    label: MEAL_TYPE_LABELS[id],
  }),
);

export type WeeklyPlan = Record<DayId, Record<MealSlot, string | null>>;

export const STORAGE_KEY = 'recipes-weekly-plan-v2';
export const LEGACY_STORAGE_KEY = 'recipes-weekly-plan-v1';

export const PLANNER_DRAG_TYPE = 'application/x-recipes-planner';

export type PlannerDragPayload = {
  slug: string;
  fromDay?: DayId;
  fromSlot?: MealSlot;
};
