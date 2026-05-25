import {
  DAYS,
  MEAL_SLOTS,
  STORAGE_KEY,
  type DayId,
  type MealSlot,
  type WeeklyPlan,
} from './types';

export function createEmptyPlan(): WeeklyPlan {
  const plan = {} as WeeklyPlan;
  for (const day of DAYS) {
    plan[day.id] = { breakfast: null, lunch: null, dinner: null };
  }
  return plan;
}

export function loadWeeklyPlan(): WeeklyPlan {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return createEmptyPlan();
    const parsed = JSON.parse(raw) as WeeklyPlan;
    return mergeWithEmpty(parsed);
  } catch {
    return createEmptyPlan();
  }
}

function mergeWithEmpty(partial: WeeklyPlan): WeeklyPlan {
  const empty = createEmptyPlan();
  for (const day of DAYS) {
    for (const slot of MEAL_SLOTS) {
      const value = partial[day.id]?.[slot.id];
      empty[day.id][slot.id] = typeof value === 'string' ? value : null;
    }
  }
  return empty;
}

export function saveWeeklyPlan(plan: WeeklyPlan): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(plan));
}

export function setPlanSlot(
  plan: WeeklyPlan,
  day: DayId,
  slot: MealSlot,
  slug: string | null,
): WeeklyPlan {
  return {
    ...plan,
    [day]: {
      ...plan[day],
      [slot]: slug,
    },
  };
}
