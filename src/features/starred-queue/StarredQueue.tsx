import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Stack, Text } from '@/design-system/primitives';
import { useStarredRecipes } from '@/hooks/useStarredRecipes';
import type { Recipe } from '@/static-api/types/recipe';
import { selectQueuedRecipes } from './queuedRecipes';
import { StarredQueueRow } from './StarredQueueRow';
import planStyles from './StarredPlan.module.css';
import styles from './StarredQueue.module.css';

type StarredQueueProps = {
  recipes: Recipe[];
};

export function StarredQueue({ recipes }: StarredQueueProps) {
  const { starredSlugs, toggleStar, moveStar } = useStarredRecipes();

  const queuedRecipes = useMemo(
    () => selectQueuedRecipes(recipes, starredSlugs),
    [recipes, starredSlugs],
  );

  if (queuedRecipes.length === 0) {
    return (
      <div className={planStyles.empty}>
        <Text variant="muted">
          Star recipes from the catalog to build your cook queue. Drag items here to set what to
          make next.
        </Text>
        <Link to="/" className={planStyles.emptyLink}>
          Browse recipes
        </Link>
      </div>
    );
  }

  return (
    <Stack gap="md">
      <Text variant="muted">
        Drag to reorder — top of the list is up next. Only starred recipes appear here.
      </Text>
      <ol className={styles.list} aria-label="Starred cook queue">
        {queuedRecipes.map((recipe, index) => (
          <StarredQueueRow
            key={recipe.slug}
            recipe={recipe}
            index={index}
            onMove={moveStar}
            onUnstar={toggleStar}
          />
        ))}
      </ol>
    </Stack>
  );
}
