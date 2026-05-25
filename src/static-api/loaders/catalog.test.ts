import { beforeEach, describe, expect, it } from 'vitest';
import { getRecipeBySlug } from './getRecipeBySlug';
import { getRecipes } from './getRecipes';
import { getRecipesByEffort } from './getRecipesByEffort';
import { getRecipesByMealList } from './getRecipesByMealList';
import { getRecipesByTag } from './getRecipesByTag';
import { loadRecipeCatalog, resetRecipeCatalogCache } from './loadRecipeCatalog';

beforeEach(() => {
  resetRecipeCatalogCache();
});

describe('loadRecipeCatalog', () => {
  it('loads the full catalog without baby-food recipes', async () => {
    const recipes = await loadRecipeCatalog();
    expect(recipes).toHaveLength(74);
    expect(recipes.every((r) => r.id && r.slug && r.title)).toBe(true);
    expect(recipes.some((r) => r.slug.startsWith('baby-food'))).toBe(false);
  });
});

describe('getRecipes', () => {
  it('returns the full catalog', async () => {
    const recipes = await getRecipes();
    expect(recipes.length).toBeGreaterThanOrEqual(70);
  });
});

describe('getRecipeBySlug', () => {
  it('returns briam with source URL', async () => {
    const recipe = await getRecipeBySlug('briam');
    expect(recipe?.title).toMatch(/Briam/i);
    expect(recipe?.sourceUrl).toContain('themediterraneandish.com');
    expect(recipe?.mealLists).toContain('healthy-ideas');
  });

  it('returns undefined for unknown slug', async () => {
    expect(await getRecipeBySlug('not-a-recipe')).toBeUndefined();
  });
});

describe('getRecipesByTag', () => {
  it('finds slow-cooker recipes', async () => {
    const recipes = await getRecipesByTag('slow-cooker');
    expect(recipes.length).toBeGreaterThanOrEqual(2);
    expect(recipes.every((r) => r.tags.includes('slow-cooker'))).toBe(true);
  });
});

describe('sourceUrl enrichments', () => {
  it('enriched recipes with sourceUrl have real ingredients and steps', async () => {
    const recipes = await getRecipes();
    const withUrl = recipes.filter(
      (r) =>
        r.sourceUrl &&
        !r.steps.join(' ').match(/see source/i) &&
        r.ingredients.length > 0,
    );
    expect(withUrl.length).toBeGreaterThanOrEqual(11);
    for (const r of withUrl) {
      expect(r.steps.length, r.slug).toBeGreaterThan(0);
      expect(r.steps.join(' '), r.slug).not.toMatch(/see source/i);
    }
  });
});

describe('byonandlara imports', () => {
  it('includes 40 family recipes from byonandlara.com', async () => {
    const recipes = await getRecipesByTag('family');
    const byl = recipes.filter((r) => r.slug.startsWith('byl-'));
    expect(byl).toHaveLength(40);
    const onBylSite = byl.filter((r) => r.sourceUrl?.includes('byonandlara.com'));
    expect(onBylSite.length).toBeGreaterThanOrEqual(37);
  });

  it('loads artichoke dip by slug', async () => {
    const recipe = await getRecipeBySlug('byl-artichoke-and-parmesan-dip');
    expect(recipe?.title).toMatch(/Artichoke/i);
    expect(recipe?.ingredients.length).toBeGreaterThan(0);
  });
});

describe('getRecipesByEffort', () => {
  it('returns seven low-effort to-make recipes', async () => {
    const recipes = await getRecipesByEffort('low');
    expect(recipes).toHaveLength(7);
    expect(recipes.every((r) => r.effort === 'low')).toBe(true);
    expect(recipes.every((r) => r.mealLists?.includes('to-make'))).toBe(true);
  });
});

describe('youtube video recipes', () => {
  it('loads bean chili with timed steps from YouTube', async () => {
    const recipe = await getRecipeBySlug('bean-chili');
    expect(recipe?.recipeKind).toBe('youtube');
    expect(recipe?.youtubeVideoId).toBe('mb3k0wApWas');
    expect(recipe?.sourceUrl).toContain('youtube.com/watch?v=mb3k0wApWas');
    expect(recipe?.timedSteps?.length).toBeGreaterThanOrEqual(1);
    expect(recipe?.timedSteps?.[0]).toMatchObject({
      text: expect.any(String),
      startSeconds: expect.any(Number),
    });
    expect(recipe?.steps).toEqual(recipe?.timedSteps?.map((s) => s.text));
  });
});

describe('getRecipesByMealList', () => {
  it('returns to-make meals from upcoming list', async () => {
    const recipes = await getRecipesByMealList('to-make');
    expect(recipes).toHaveLength(7);
    expect(recipes.map((r) => r.slug).sort()).toEqual(
      [
        'air-fried-veggies-shrimp',
        'air-fried-veggies-tilapia',
        'caesar-salad',
        'crema-salad',
        'falafel',
        'mediterranean-salad',
        'zero-calorie-pasta-veggies-shrimp',
      ].sort(),
    );
  });

  it('returns freezer soup under to-eat', async () => {
    const recipes = await getRecipesByMealList('to-eat');
    expect(recipes.some((r) => r.slug === 'freezer-soup')).toBe(true);
  });
});
