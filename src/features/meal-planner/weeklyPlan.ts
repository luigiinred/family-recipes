import type { Recipe } from '@/static-api/types/recipe';
import { recipeMatchesMealType } from '@/static-api/mealTypes';
import {
  DAYS,
  LEGACY_STORAGE_KEY,
  MEAL_SLOTS,
  STORAGE_KEY,
  type DayId,
  type MealSlot,
  type WeeklyPlan,
} from './types';

export function createEmptyPlan(): WeeklyPlan {
  const plan = {} as WeeklyPlan;
  for (const day of DAYS) {
    plan[day.id] = {} as Record<MealSlot, string | null>;
    for (const slot of MEAL_SLOTS) {
      plan[day.id][slot.id] = null;
    }
  }
  return plan;
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

function migrateLegacyPlan(raw: string): WeeklyPlan | null {
  try {
    const parsed = JSON.parse(raw) as WeeklyPlan;
    return mergeWithEmpty(parsed);
  } catch {
    return null;
  }
}

export function loadWeeklyPlan(): WeeklyPlan {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as WeeklyPlan;
      return mergeWithEmpty(parsed);
    }

    const legacy = localStorage.getItem(LEGACY_STORAGE_KEY);
    if (legacy) {
      const migrated = migrateLegacyPlan(legacy);
      if (migrated) {
        saveWeeklyPlan(migrated);
        return migrated;
      }
    }

    return createEmptyPlan();
  } catch {
    return createEmptyPlan();
  }
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

export function movePlanSlot(
  plan: WeeklyPlan,
  fromDay: DayId,
  fromSlot: MealSlot,
  toDay: DayId,
  toSlot: MealSlot,
): WeeklyPlan {
  const slug = plan[fromDay][fromSlot];
  if (!slug) return plan;

  let next = setPlanSlot(plan, fromDay, fromSlot, null);
  next = setPlanSlot(next, toDay, toSlot, slug);
  return next;
}

export function collectUsedSlugs(plan: WeeklyPlan): Set<string> {
  const used = new Set<string>();
  for (const day of DAYS) {
    for (const slot of MEAL_SLOTS) {
      const slug = plan[day.id][slot.id];
      if (slug) used.add(slug);
    }
  }
  return used;
}

type AutoFillOptions = {
  recipes: Recipe[];
  starredSlugs: Iterable<string>;
  preferStarred?: boolean;
};

/**
 * Fills empty calendar cells with recipes whose `mealTypes` match the slot.
 * Starred recipes are tried first; each slug is used at most once per fill pass.
 */
export function autoFillWeeklyPlan(
  plan: WeeklyPlan,
  { recipes, starredSlugs, preferStarred = true }: AutoFillOptions,
): WeeklyPlan {
  let next = plan;
  const used = collectUsedSlugs(plan);
  const starred = new Set(starredSlugs);
  const recipeBySlug = new Map(recipes.map((r) => [r.slug, r]));

  function candidatesFor(slot: MealSlot, starredOnly: boolean): Recipe[] {
    return recipes.filter((r) => {
      if (used.has(r.slug)) return false;
      if (starredOnly && !starred.has(r.slug)) return false;
      return recipeMatchesMealType(r, slot);
    });
  }

  function pick(slot: MealSlot): string | null {
    const pools = preferStarred
      ? [candidatesFor(slot, true), candidatesFor(slot, false)]
      : [candidatesFor(slot, false)];

    for (const pool of pools) {
      if (pool.length > 0) {
        const recipe = pool[0];
        used.add(recipe.slug);
        return recipe.slug;
      }
    }
    return null;
  }

  for (const day of DAYS) {
    for (const slot of MEAL_SLOTS) {
      if (next[day.id][slot.id]) continue;
      const slug = pick(slot.id);
      if (slug) {
        next = setPlanSlot(next, day.id, slot.id, slug);
      }
    }
  }

  return next;
}

export function clearWeeklyPlan(): WeeklyPlan {
  return createEmptyPlan();
}
