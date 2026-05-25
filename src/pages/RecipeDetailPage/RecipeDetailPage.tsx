import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { RecipeMeta } from '@/components/RecipeMeta/RecipeMeta';
import { RecipeStarButton } from '@/components/RecipeStarButton/RecipeStarButton';
import { TimedRecipeSteps } from '@/components/TimedRecipeSteps/TimedRecipeSteps';
import { YouTubeRecipePlayer } from '@/components/YouTubeRecipePlayer/YouTubeRecipePlayer';
import { Button, Image, Stack, Text } from '@/design-system/primitives';
import { useStarredRecipes } from '@/hooks/useStarredRecipes';
import { scaleIngredient } from '@/features/servings/scaleIngredient';
import { isYouTubeRecipe } from '@/lib/youtube/isYouTubeRecipe';
import { recipeImageUrl } from '@/lib/recipeImageUrl';
import { getRecipeBySlug } from '@/static-api';
import type { Recipe } from '@/static-api/types/recipe';
import styles from './RecipeDetailPage.module.css';

export function RecipeDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [recipe, setRecipe] = useState<Recipe | undefined>();
  const [loading, setLoading] = useState(true);
  const [servings, setServings] = useState(4);
  const [videoStartSeconds, setVideoStartSeconds] = useState(0);
  const [videoAutoplay, setVideoAutoplay] = useState(false);
  const { isStarred, toggleStar } = useStarredRecipes();

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    getRecipeBySlug(slug).then((r) => {
      setRecipe(r);
      if (r) setServings(r.servings > 0 ? r.servings : 4);
      setVideoStartSeconds(0);
      setVideoAutoplay(false);
      setLoading(false);
    });
  }, [slug]);

  const videoRecipe = recipe && isYouTubeRecipe(recipe) ? recipe : undefined;

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

  const handleVideoSeek = (startSeconds: number) => {
    setVideoStartSeconds(startSeconds);
    setVideoAutoplay(true);
  };

  const headerText = (
    <Stack gap="md" className={styles.headerText}>
      <div className={styles.titleRow}>
        <Text as="h1" variant="title">
          {recipe.title}
        </Text>
        <RecipeStarButton
          title={recipe.title}
          starred={isStarred(recipe.slug)}
          onToggle={() => toggleStar(recipe.slug)}
        />
      </div>
      <RecipeMeta recipe={recipe} />
      {recipe.notes ? <Text variant="muted">{recipe.notes}</Text> : null}
      {recipe.sourceUrl ? (
        <a href={recipe.sourceUrl} target="_blank" rel="noreferrer noopener">
          Original recipe
        </a>
      ) : null}
    </Stack>
  );

  const detailBody = (
    <>
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
        {videoRecipe ? (
          <TimedRecipeSteps steps={videoRecipe.timedSteps} onSeek={handleVideoSeek} />
        ) : (
          <ol className={styles.steps}>
            {recipe.steps.map((step, i) => (
              <li key={i}>{step}</li>
            ))}
          </ol>
        )}
      </section>
    </>
  );

  return (
    <article
      className={videoRecipe ? `${styles.article} ${styles.videoLayout}` : styles.article}
    >
      <div className={styles.noPrint}>
        <Link to="/" className={styles.back}>
          ← All recipes
        </Link>
      </div>

      {videoRecipe ? (
        <div className={styles.videoMain}>
          <div className={styles.stickyPlayer}>
            <YouTubeRecipePlayer
              videoId={videoRecipe.youtubeVideoId}
              title={recipe.title}
              startSeconds={videoStartSeconds}
              autoplay={videoAutoplay}
            />
          </div>
          <div className={styles.videoBody}>
            <header className={styles.header}>{headerText}</header>
            {detailBody}
          </div>
        </div>
      ) : (
        <>
          <header className={styles.header}>
            <Image src={recipeImageUrl(recipe.imageUrl)} alt={recipe.title} className={styles.hero} />
            {headerText}
          </header>
          {detailBody}
        </>
      )}
    </article>
  );
}
