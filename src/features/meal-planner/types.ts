export type MealSlot = 'breakfast' | 'lunch' | 'dinner';

export type DayId = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun';

export const DAYS: readonly { id: DayId; label: string }[] = [
  { id: 'mon', label: 'Monday' },
  { id: 'tue', label: 'Tuesday' },
  { id: 'wed', label: 'Wednesday' },
  { id: 'thu', label: 'Thursday' },
  { id: 'fri', label: 'Friday' },
  { id: 'sat', label: 'Saturday' },
  { id: 'sun', label: 'Sunday' },
] as const;

export const MEAL_SLOTS: readonly { id: MealSlot; label: string }[] = [
  { id: 'breakfast', label: 'Breakfast' },
  { id: 'lunch', label: 'Lunch' },
  { id: 'dinner', label: 'Dinner' },
] as const;

export type WeeklyPlan = Record<DayId, Record<MealSlot, string | null>>;

export const STORAGE_KEY = 'recipes-weekly-plan-v1';
