import { Link } from 'react-router-dom';
import { Text } from '@/design-system/primitives';
import type { Recipe } from '@/static-api/types/recipe';
import type { DayId, MealSlot } from './types';
import styles from './WeeklyPlanner.module.css';

type MealSlotSelectProps = {
  dayId: DayId;
  dayLabel: string;
  slot: MealSlot;
  slotLabel: string;
  slug: string | null;
  recipes: Recipe[];
  onChange: (slug: string) => void;
};

export function MealSlotSelect({
  dayLabel,
  slotLabel,
  slug,
  recipes,
  onChange,
}: MealSlotSelectProps) {
  return (
    <div className={styles.slot}>
      <Text variant="label">
        {slotLabel}
      </Text>
      <select
        className={styles.select}
        value={slug ?? ''}
        onChange={(e) => onChange(e.target.value)}
        aria-label={`${slotLabel} on ${dayLabel}`}
      >
        <option value="">—</option>
        {recipes.map((r) => (
          <option key={r.slug} value={r.slug}>
            {r.title}
          </option>
        ))}
      </select>
      {slug ? (
        <Link to={`/recipes/${slug}`} className={styles.viewLink}>
          View recipe
        </Link>
      ) : null}
    </div>
  );
}
