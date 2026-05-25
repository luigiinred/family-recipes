import { Text } from '@/design-system/primitives';
import { WeeklyPlanner } from '@/features/meal-planner/WeeklyPlanner';
import { useRecipeCatalog } from '@/hooks/useRecipeCatalog';

export function PlannerPage() {
  const { recipes, loading, error } = useRecipeCatalog();

  if (loading) {
    return <Text variant="muted">Loading…</Text>;
  }

  if (error) {
    return <Text variant="muted">{error}</Text>;
  }

  return (
    <section>
      <Text as="h1" variant="title">
        Weekly planner
      </Text>
      <WeeklyPlanner recipes={recipes} />
    </section>
  );
}
