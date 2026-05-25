import { Link } from 'react-router-dom';
import { Card, Image, Stack, Text } from '@/design-system/primitives';
import { RecipeStarButton } from '@/components/RecipeStarButton/RecipeStarButton';
import { useStarredRecipes } from '@/hooks/useStarredRecipes';
import { recipeImageUrl } from '@/lib/recipeImageUrl';
import type { Recipe } from '@/static-api/types/recipe';
import { RecipeMeta } from '../RecipeMeta/RecipeMeta';
import styles from './RecipeCard.module.css';

type RecipeCardProps = {
  recipe: Recipe;
};

export function RecipeCard({ recipe }: RecipeCardProps) {
  const { isStarred, toggleStar } = useStarredRecipes();
  const starred = isStarred(recipe.slug);

  return (
    <Card as="li" className={styles.card}>
      <RecipeStarButton
        title={recipe.title}
        starred={starred}
        onToggle={() => toggleStar(recipe.slug)}
        className={[styles.star, starred ? styles.starVisible : ''].filter(Boolean).join(' ')}
      />
      <Link to={`/recipes/${recipe.slug}`} className={styles.link}>
        <Image src={recipeImageUrl(recipe.imageUrl)} alt={recipe.title} />
        <Stack gap="sm" className={styles.body}>
          <Text as="h2" variant="subtitle">
            {recipe.title}
          </Text>
          <RecipeMeta recipe={recipe} />
        </Stack>
      </Link>
    </Card>
  );
}
