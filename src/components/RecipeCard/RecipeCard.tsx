import { Link } from 'react-router-dom';
import { Card, Image, Stack, Text } from '@/design-system/primitives';
import { RecipeDeleteButton } from '@/components/RecipeDeleteButton/RecipeDeleteButton';
import { RecipeStarButton } from '@/components/RecipeStarButton/RecipeStarButton';
import { confirmHideRecipe } from '@/features/recipe-edits/confirmHideRecipe';
import { useEditorMode } from '@/hooks/useEditorMode';
import { useRecipeEdits } from '@/hooks/useRecipeEdits';
import { useStarredRecipes } from '@/hooks/useStarredRecipes';
import { isYouTubeRecipe } from '@/lib/youtube/isYouTubeRecipe';
import { recipeImageUrl } from '@/lib/recipeImageUrl';
import type { Recipe } from '@/static-api/types/recipe';
import { RecipeMeta } from '../RecipeMeta/RecipeMeta';
import styles from './RecipeCard.module.css';

type RecipeCardProps = {
  recipe: Recipe;
};

export function RecipeCard({ recipe }: RecipeCardProps) {
  const { isStarred, toggleStar } = useStarredRecipes();
  const { editorMode } = useEditorMode();
  const { markDeleted } = useRecipeEdits();
  const starred = isStarred(recipe.slug);

  return (
    <Card as="li" className={styles.card}>
      <RecipeStarButton
        title={recipe.title}
        starred={starred}
        onToggle={() => toggleStar(recipe.slug)}
        className={[styles.star, starred ? styles.starVisible : ''].filter(Boolean).join(' ')}
      />
      {editorMode ? (
        <RecipeDeleteButton
          title={recipe.title}
          onDelete={() => {
            if (!confirmHideRecipe(recipe.title)) return;
            markDeleted(recipe.slug, recipe);
          }}
          className={styles.delete}
        />
      ) : null}
      <Link to={`/recipes/${recipe.slug}`} className={styles.link}>
        <div className={styles.media}>
          <Image src={recipeImageUrl(recipe.imageUrl)} alt={recipe.title} />
          {isYouTubeRecipe(recipe) ? (
            <span className={styles.videoBadge} role="img" aria-label="Video recipe">
              <svg className={styles.videoIcon} viewBox="0 0 24 24" aria-hidden="true">
                <path d="M8 5v14l11-7z" fill="currentColor" />
              </svg>
            </span>
          ) : null}
        </div>
        <Stack gap="sm" className={styles.body}>
          <Text as="h2" variant="subtitle">
            {recipe.title}
          </Text>
          <RecipeMeta recipe={recipe} showDescription={false} />
        </Stack>
      </Link>
    </Card>
  );
}
