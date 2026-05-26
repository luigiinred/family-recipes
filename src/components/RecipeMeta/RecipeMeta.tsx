import { Badge, Stack, Text } from '@/design-system/primitives';
import type { Recipe } from '@/static-api/types/recipe';
import styles from './RecipeMeta.module.css';

type RecipeMetaProps = {
  recipe: Recipe;
  showTags?: boolean;
  showDescription?: boolean;
};

export function RecipeMeta({ recipe, showTags = true, showDescription = true }: RecipeMetaProps) {
  const minutes = recipe.prepMinutes + recipe.cookMinutes;
  const timeLabel =
    minutes > 0 ? `${minutes} min` : recipe.servings > 0 ? `${recipe.servings} servings` : null;

  return (
    <Stack gap="sm" className={styles.meta}>
      {showDescription && recipe.description ? (
        <Text variant="muted">{recipe.description}</Text>
      ) : null}
      {timeLabel ? <Text variant="muted">{timeLabel}</Text> : null}
      {recipe.effort === 'low' ? (
        <Badge>Low effort</Badge>
      ) : null}
      {showTags && recipe.tags.length > 0 ? (
        <Stack direction="row" gap="sm" className={styles.tags}>
          {recipe.tags.map((tag) => (
            <Badge key={tag}>{tag}</Badge>
          ))}
        </Stack>
      ) : null}
    </Stack>
  );
}
