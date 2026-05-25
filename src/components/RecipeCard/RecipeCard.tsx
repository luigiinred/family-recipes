import { Link } from 'react-router-dom';
import { Card, Image, Stack, Text } from '@/design-system/primitives';
import { recipeImageUrl } from '@/lib/recipeImageUrl';
import type { Recipe } from '@/static-api/types/recipe';
import { RecipeMeta } from '../RecipeMeta/RecipeMeta';
import styles from './RecipeCard.module.css';

type RecipeCardProps = {
  recipe: Recipe;
};

export function RecipeCard({ recipe }: RecipeCardProps) {
  return (
    <Card as="li" className={styles.card}>
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
