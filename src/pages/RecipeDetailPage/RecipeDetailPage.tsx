import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { RelatedRecipes } from '@/components/RelatedRecipes/RelatedRecipes';
import { RecipeDeleteButton } from '@/components/RecipeDeleteButton/RecipeDeleteButton';
import { RecipeStarButton } from '@/components/RecipeStarButton/RecipeStarButton';
import { RecipeTags } from '@/components/RecipeTags';
import { confirmHideRecipe } from '@/features/recipe-edits/confirmHideRecipe';
import { TimedRecipeSteps } from '@/components/TimedRecipeSteps/TimedRecipeSteps';
import { YouTubeRecipePlayer } from '@/components/YouTubeRecipePlayer/YouTubeRecipePlayer';
import { Button, Image, Stack, Text } from '@/design-system/primitives';
import { applyRecipeEdit, isRecipeRemoved } from '@/features/recipe-edits/applyRecipeEdits';
import { EditableRecipeField } from '@/features/recipe-edits/EditableRecipeField';
import { getFieldDisplayValue } from '@/features/recipe-edits/patchRecipeField';
import { useAllTags } from '@/hooks/useAllTags';
import { useEditorMode } from '@/hooks/useEditorMode';
import { useStarredRecipes } from '@/hooks/useStarredRecipes';
import { useRecipeEdits } from '@/hooks/useRecipeEdits';
import { RecipeStepContent } from '@/components/RecipeStepContent/RecipeStepContent';
import { IngredientLine } from '@/components/IngredientLine/IngredientLine';
import { groupIngredients } from '@/features/recipe-display/groupIngredients';
import { scaleIngredient } from '@/features/servings/scaleIngredient';
import { resolveYouTubeRecipe } from '@/lib/youtube/isYouTubeRecipe';
import { recipeImageUrl } from '@/lib/recipeImageUrl';
import { resolvePairedRecipes } from '@/features/recipe-edits/resolvePairedRecipes';
import { getRecipeBySlug } from '@/static-api';
import { useRecipeCatalog } from '@/hooks/useRecipeCatalog';
import type { Recipe } from '@/static-api/types/recipe';
import { ServingsStat } from './ServingsStat';
import { useHeroScrollEffect } from './useHeroScrollEffect';
import styles from './RecipeDetailPage.module.css';

export function RecipeDetailPage() {
  const navigate = useNavigate();
  const { slug } = useParams<{ slug: string }>();
  const [catalogRecipe, setCatalogRecipe] = useState<Recipe | undefined>();
  const [loading, setLoading] = useState(true);
  const [servings, setServings] = useState(4);
  const [videoStartSeconds, setVideoStartSeconds] = useState(0);
  const [videoAutoplay, setVideoAutoplay] = useState(false);
  const { editorMode } = useEditorMode();
  const { isStarred, toggleStar } = useStarredRecipes();
  const { getEdit, applyFieldPatch, applyTagsPatch, applyPairedPatch, markDeleted, restoreDeleted } =
    useRecipeEdits();
  const { recipes: catalogRecipes } = useRecipeCatalog();
  const allTags = useAllTags();
  const heroRef = useRef<HTMLDivElement>(null);
  const { progress: heroScrollProgress } = useHeroScrollEffect(heroRef);

  const edit = slug ? getEdit(slug) : undefined;
  const recipe = useMemo(
    () => (catalogRecipe ? applyRecipeEdit(catalogRecipe, edit) : undefined),
    [catalogRecipe, edit],
  );
  const markedRemoved = isRecipeRemoved(edit);

  const relatedRecipes = useMemo(() => {
    if (!recipe) return [];
    return resolvePairedRecipes(recipe, catalogRecipes);
  }, [recipe, catalogRecipes]);

  const heroStyle = {
    '--hero-progress': heroScrollProgress,
  } as CSSProperties;

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    void getRecipeBySlug(slug).then((r) => {
      setCatalogRecipe(r);
      if (r) setServings(r.servings > 0 ? r.servings : 4);
      setVideoStartSeconds(0);
      setVideoAutoplay(false);
      setLoading(false);
    });
  }, [slug]);

  const videoRecipe =
    catalogRecipe && recipe ? resolveYouTubeRecipe(catalogRecipe, recipe) : undefined;

  const scale = useMemo(() => {
    if (!recipe || recipe.servings <= 0) return 1;
    return servings / recipe.servings;
  }, [recipe, servings]);

  const scaledIngredients = useMemo(() => {
    if (!recipe) return [];
    return recipe.ingredients.map((i) => scaleIngredient(i, scale));
  }, [recipe, scale]);

  const ingredientGroups = useMemo(
    () => groupIngredients(scaledIngredients),
    [scaledIngredients],
  );

  const saveField = (
    field: Parameters<typeof applyFieldPatch>[2],
    value: string,
    aiNote: string,
  ) => {
    if (!slug || !catalogRecipe) return;
    applyFieldPatch(slug, catalogRecipe, field, value, aiNote);
  };

  if (loading) {
    return <Text variant="muted">Loading…</Text>;
  }

  if (!recipe || !catalogRecipe) {
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

  const handleDelete = () => {
    if (!confirmHideRecipe(recipe.title)) return;
    markDeleted(recipe.slug, catalogRecipe);
    navigate('/');
  };

  const deleteOnMedia =
    editorMode && !markedRemoved ? (
      <RecipeDeleteButton title={recipe.title} onDelete={handleDelete} className={styles.mediaDelete} />
    ) : null;

  const totalMinutes = recipe.prepMinutes + recipe.cookMinutes;
  const ingredientsPlacement = videoRecipe ? 'column' : 'overlap';

  const ingredientsPanel = (
    <section
      className={`${styles.ingredientsPanel} ${
        videoRecipe ? '' : styles.ingredientsOverlap
      }`}
      aria-labelledby="recipe-ingredients-heading"
      aria-label="Ingredients"
      data-ingredients-placement={ingredientsPlacement}
    >
      <h2 id="recipe-ingredients-heading" className={styles.panelHeading}>
        Ingredients
      </h2>
      <EditableRecipeField
        label="ingredients"
        editorMode={editorMode}
        multiline
        value={getFieldDisplayValue(recipe, 'ingredients')}
        aiNoteKey="ingredients"
        initialAiNote={edit?.aiNotes?.ingredients ?? ''}
        onSave={(value, aiNote) => saveField('ingredients', value, aiNote)}
      >
        {scaledIngredients.length > 0 ? (
          <div className={styles.ingredientGroups}>
            {ingredientGroups.map((group) => (
              <div key={group.label || 'main'} className={styles.ingredientGroup}>
                {group.label ? (
                  <h3 className={styles.ingredientGroupHeading}>{group.label}</h3>
                ) : null}
                <ul className={styles.list}>
                  {group.items.map((ing, i) => (
                    <li key={`${group.label}-${ing.name}-${i}`}>
                      <IngredientLine ingredient={ing} />
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        ) : (
          <Text variant="muted">Ingredients not added yet — check the source link.</Text>
        )}
      </EditableRecipeField>
    </section>
  );

  const stepsSection = (
    <section className={styles.stepsSection} aria-labelledby="recipe-steps-heading">
      <h2 id="recipe-steps-heading" className={styles.sectionHeading}>
        Directions
      </h2>
      <EditableRecipeField
        label="steps"
        editorMode={editorMode}
        multiline
        value={getFieldDisplayValue(recipe, 'steps')}
        aiNoteKey="steps"
        initialAiNote={edit?.aiNotes?.steps ?? ''}
        onSave={(value, aiNote) => saveField('steps', value, aiNote)}
      >
        {videoRecipe && !editorMode ? (
          <TimedRecipeSteps steps={videoRecipe.timedSteps} onSeek={handleVideoSeek} />
        ) : (
          <ol className={styles.steps}>
            {recipe.steps.map((step, i) => (
              <li key={i}>
                <RecipeStepContent text={step} ingredients={scaledIngredients} />
              </li>
            ))}
          </ol>
        )}
      </EditableRecipeField>
    </section>
  );

  const showNotesPanel =
    Boolean(recipe.notes) || editorMode || Boolean(recipe.sourceUrl) || relatedRecipes.length > 0;

  const notesAside = showNotesPanel ? (
    <aside className={styles.notesPanel}>
      <h2 className={styles.panelHeading}>Notes</h2>
      <EditableRecipeField
        label="notes"
        editorMode={editorMode}
        multiline
        value={getFieldDisplayValue(recipe, 'notes')}
        aiNoteKey="notes"
        initialAiNote={edit?.aiNotes?.notes ?? ''}
        onSave={(value, aiNote) => saveField('notes', value, aiNote)}
      >
        {recipe.notes ? <p>{recipe.notes}</p> : editorMode ? <Text variant="muted">No notes</Text> : null}
      </EditableRecipeField>
      <RelatedRecipes
        recipes={relatedRecipes}
        editorMode={editorMode}
        currentSlug={recipe.slug}
        allRecipes={editorMode ? catalogRecipes : []}
        onPairedChange={
          editorMode
            ? (pairedSlugs) => applyPairedPatch(recipe.slug, catalogRecipe, pairedSlugs)
            : undefined
        }
      />
      {recipe.sourceUrl ? (
        <a className={styles.sourceLink} href={recipe.sourceUrl} target="_blank" rel="noreferrer noopener">
          Original recipe
        </a>
      ) : null}
    </aside>
  ) : null;

  const masthead = (
    <header className={styles.masthead}>
      <div className={styles.titleBlock}>
        <div className={styles.titleRow}>
          <EditableRecipeField
            label="title"
            editorMode={editorMode}
            value={recipe.title}
            aiNoteKey="title"
            initialAiNote={edit?.aiNotes?.title ?? ''}
            onSave={(value, aiNote) => saveField('title', value, aiNote)}
          >
            <h1 className={styles.displayTitle}>{recipe.title}</h1>
          </EditableRecipeField>
          <RecipeStarButton
            title={recipe.title}
            starred={isStarred(recipe.slug)}
            onToggle={() => toggleStar(recipe.slug)}
          />
        </div>
        {editorMode ? (
          <EditableRecipeField
            label="description"
            editorMode
            multiline
            value={getFieldDisplayValue(recipe, 'description')}
            aiNoteKey="description"
            initialAiNote={edit?.aiNotes?.description ?? ''}
            onSave={(value, aiNote) => saveField('description', value, aiNote)}
          >
            {recipe.description ? (
              <p className={styles.tagline}>{recipe.description}</p>
            ) : (
              <Text variant="muted">No description</Text>
            )}
          </EditableRecipeField>
        ) : recipe.description ? (
          <p className={styles.tagline}>{recipe.description}</p>
        ) : null}
        <RecipeTags
          tags={recipe.tags}
          allTags={allTags}
          onTagsChange={(nextTags) => applyTagsPatch(recipe.slug, catalogRecipe, nextTags)}
        />
      </div>
      <div className={styles.stats} aria-label="Recipe details">
        <ServingsStat servings={servings} onChange={setServings} />
        {totalMinutes > 0 ? (
          <div className={styles.statRow}>
            <span className={styles.statIcon} aria-hidden>
              ⏱
            </span>
            <span>{totalMinutes} minutes</span>
          </div>
        ) : null}
      </div>
    </header>
  );

  const showHeroBackdrop = !videoRecipe && Boolean(recipe.imageUrl);
  const heroImageSrc = recipeImageUrl(recipe.imageUrl);

  return (
    <article
      className={[
        videoRecipe ? `${styles.article} ${styles.videoArticle}` : styles.article,
        showHeroBackdrop && heroScrollProgress > 0.05 ? styles.heroScrolled : '',
      ]
        .filter(Boolean)
        .join(' ')}
      style={showHeroBackdrop ? heroStyle : undefined}
    >
      {showHeroBackdrop ? (
        <div className={styles.heroBackdrop} aria-hidden>
          <img src={heroImageSrc} alt="" className={styles.heroBackdropImage} />
          <div className={styles.heroBackdropScrim} />
        </div>
      ) : null}
      {markedRemoved ? (
        <div className={styles.deletedBanner} role="status">
          <Text variant="muted">
            This recipe is hidden from your lists. Export from{' '}
            <Link to="/settings">Settings</Link> so Cursor can remove it from the catalog.
          </Text>
          {editorMode ? (
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                if (!slug) return;
                restoreDeleted(slug, catalogRecipe);
              }}
            >
              Restore recipe
            </Button>
          ) : null}
        </div>
      ) : null}

      <div className={styles.pageContent}>
        {masthead}

        {videoRecipe ? (
          <div className={styles.videoRecipeLayout} data-layout="youtube">
            <div ref={heroRef} className={styles.videoColumn}>
              <div className={styles.stickyPlayer}>
                {deleteOnMedia}
                <YouTubeRecipePlayer
                  videoId={videoRecipe.youtubeVideoId}
                  title={recipe.title}
                  startSeconds={videoStartSeconds}
                  autoplay={videoAutoplay}
                />
              </div>
            </div>
            <div className={styles.videoContentColumn}>
              {ingredientsPanel}
              {stepsSection}
              {notesAside}
            </div>
          </div>
        ) : (
          <div className={styles.recipeLayout}>
            <div ref={heroRef} className={styles.heroCell} data-hero-layout="image">
              {deleteOnMedia}
              <div className={styles.heroCard}>
                <Image src={heroImageSrc} alt={recipe.title} className={styles.heroImage} />
              </div>
            </div>
            {ingredientsPanel}
            {stepsSection}
            {notesAside}
          </div>
        )}
      </div>
    </article>
  );
}
