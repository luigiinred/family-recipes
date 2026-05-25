import { useEffect, useState } from 'react';
import { Stack, Text } from '@/design-system/primitives';
import type { Recipe } from '@/static-api/types/recipe';
import { MealSlotSelect } from './MealSlotSelect';
import { DAYS, MEAL_SLOTS, type DayId, type MealSlot } from './types';
import { loadWeeklyPlan, saveWeeklyPlan, setPlanSlot } from './weeklyPlan';
import styles from './WeeklyPlanner.module.css';

type WeeklyPlannerProps = {
  recipes: Recipe[];
};

export function WeeklyPlanner({ recipes }: WeeklyPlannerProps) {
  const [plan, setPlan] = useState(loadWeeklyPlan);

  useEffect(() => {
    saveWeeklyPlan(plan);
  }, [plan]);

  const recipeOptions = recipes.slice().sort((a, b) => a.title.localeCompare(b.title));

  function handleChange(day: DayId, slot: MealSlot, slug: string) {
    setPlan((current) => setPlanSlot(current, day, slot, slug || null));
  }

  return (
    <Stack gap="lg">
      <Text variant="muted">
        Your week is saved in this browser only. Pick a recipe for each meal slot.
      </Text>

      <div className={styles.mobileDays}>
        {DAYS.map((day) => (
          <section key={day.id} className={styles.dayCard}>
            <Text as="h2" variant="subtitle">
              {day.label}
            </Text>
            {MEAL_SLOTS.map((meal) => (
              <MealSlotSelect
                key={meal.id}
                dayId={day.id}
                dayLabel={day.label}
                slot={meal.id}
                slotLabel={meal.label}
                slug={plan[day.id][meal.id]}
                recipes={recipeOptions}
                onChange={(slug) => handleChange(day.id, meal.id, slug)}
              />
            ))}
          </section>
        ))}
      </div>

      <div className={styles.desktopGrid}>
        <div className={styles.corner} />
        {DAYS.map((day) => (
          <div key={day.id} className={styles.dayHeader}>
            <Text variant="label">{day.label}</Text>
          </div>
        ))}
        {MEAL_SLOTS.flatMap((meal) => [
          <div key={`label-${meal.id}`} className={styles.mealLabel}>
            <Text variant="label">{meal.label}</Text>
          </div>,
          ...DAYS.map((day) => (
            <div key={`${day.id}-${meal.id}`} className={styles.cell}>
              <MealSlotSelect
                dayId={day.id}
                dayLabel={day.label}
                slot={meal.id}
                slotLabel={meal.label}
                slug={plan[day.id][meal.id]}
                recipes={recipeOptions}
                onChange={(slug) => handleChange(day.id, meal.id, slug)}
              />
            </div>
          )),
        ])}
      </div>
    </Stack>
  );
}
