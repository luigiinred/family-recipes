import { useMemo, useState } from 'react';
import { Text } from '@/design-system/primitives';
import { selectQueuedRecipes } from '@/features/starred-queue/queuedRecipes';
import { StarredPlanTabs, type StarredPlanTab } from '@/features/starred-queue/StarredPlanTabs';
import { StarredQueue } from '@/features/starred-queue/StarredQueue';
import { StarredShoppingList } from '@/features/starred-queue/StarredShoppingList';
import { useStarredRecipes } from '@/hooks/useStarredRecipes';
import { useRecipeCatalog } from '@/hooks/useRecipeCatalog';

export function StarredPage() {
  const { recipes, loading, error } = useRecipeCatalog();
  const { starredSlugs } = useStarredRecipes();
  const [activeTab, setActiveTab] = useState<StarredPlanTab>('queue');

  const queuedRecipes = useMemo(
    () => selectQueuedRecipes(recipes, starredSlugs),
    [recipes, starredSlugs],
  );

  if (loading) {
    return <Text variant="muted">Loading…</Text>;
  }

  if (error) {
    return <Text variant="muted">{error}</Text>;
  }

  return (
    <section>
      <Text as="h1" variant="title">
        Starred
      </Text>
      <StarredPlanTabs activeTab={activeTab} onSelectTab={setActiveTab} />
      {activeTab === 'queue' ? (
        <StarredQueue recipes={recipes} />
      ) : (
        <StarredShoppingList recipes={queuedRecipes} />
      )}
    </section>
  );
}
