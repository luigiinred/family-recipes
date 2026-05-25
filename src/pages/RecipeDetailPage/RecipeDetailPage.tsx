import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { RecipeMeta } from '@/components/RecipeMeta/RecipeMeta';
import { Button, Image, Stack, Text } from '@/design-system/primitives';
import { scaleIngredient } from '@/features/servings/scaleIngredient';
import { recipeImageUrl } from '@/lib/recipeImageUrl';
import { getRecipeBySlug } from '@/static-api';
import type { Recipe } from '@/static-api/types/recipe';
import styles from './RecipeDetailPage.module.css';

export function RecipeDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [recipe, setRecipe] = useState<Recipe | undefined>();
  const [loading, setLoading] = useState(true);
  const [servings, setServings] = useState(4);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    getRecipeBySlug(slug).then((r) => {
      setRecipe(r);
      if (r) setServings(r.servings > 0 ? r.servings : 4);
      setLoading(false);
    });
  }, [slug]);

  const scale = useMemo(() => {
    if (!recipe || recipe.servings <= 0) return 1;
    return servings / recipe.servings;
  }, [recipe, servings]);

  const scaledIngredients = useMemo(() => {
    if (!recipe) return [];
    return recipe.ingredients.map((i) => scaleIngredient(i, scale));
  }, [recipe, scale]);

  if (loading) {
    return <Text variant="muted">Loading…</Text>;
  }

  if (!recipe) {
    return (
      <Stack gap="md">
        <Text variant="title">Recipe not found</Text>
        <Link to="/">Back to recipes</Link>
      </Stack>
    );
  }

  return (
    <article className={styles.article}>
      <div className={styles.noPrint}>
        <Link to="/" className={styles.back}>
          ← All recipes
        </Link>
      </div>

      <header className={styles.header}>
        <Image src={recipeImageUrl(recipe.imageUrl)} alt={recipe.title} className={styles.hero} />
        <Stack gap="md" className={styles.headerText}>
          <Text as="h1" variant="title">
            {recipe.title}
          </Text>
          <RecipeMeta recipe={recipe} />
          {recipe.notes ? <Text variant="muted">{recipe.notes}</Text> : null}
          {recipe.sourceUrl ? (
            <a href={recipe.sourceUrl} target="_blank" rel="noreferrer noopener">
              Original recipe
            </a>
          ) : null}
        </Stack>
      </header>

      <div className={`${styles.toolbar} ${styles.noPrint}`}>
        <label className={styles.servingsLabel}>
          Servings
          <input
            type="number"
            min={1}
            max={24}
            value={servings}
            onChange={(e) => setServings(Math.max(1, Number(e.target.value) || 1))}
            className={styles.servingsInput}
          />
        </label>
        <Button variant="ghost" onClick={() => window.print()}>
          Print
        </Button>
      </div>

      <section className={styles.section}>
        <Text as="h2" variant="subtitle">
          Ingredients
        </Text>
        {scaledIngredients.length > 0 ? (
          <ul className={styles.list}>
            {scaledIngredients.map((ing, i) => (
              <li key={`${ing.name}-${i}`}>
                {[ing.amount, ing.unit, ing.name].filter(Boolean).join(' ')}
              </li>
            ))}
          </ul>
        ) : (
          <Text variant="muted">Ingredients not added yet — check the source link.</Text>
        )}
      </section>

      <section className={styles.section}>
        <Text as="h2" variant="subtitle">
          Steps
        </Text>
        <ol className={styles.steps}>
          {recipe.steps.map((step, i) => (
            <li key={i}>{step}</li>
          ))}
        </ol>
      </section>
    </article>
  );
}
