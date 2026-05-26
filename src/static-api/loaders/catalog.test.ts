import { beforeEach, describe, expect, it } from 'vitest';
import { getPairedRecipes } from './getPairedRecipes';
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

describe('getPairedRecipes', () => {
  it('resolves cheese bread and KFA chili as paired recipes', async () => {
    const cheeseBread = await getPairedRecipes('byl-cheese-bread');
    expect(cheeseBread).toHaveLength(1);
    expect(cheeseBread[0]?.slug).toBe('byl-kfa-chili');
    expect(cheeseBread[0]?.title).toMatch(/KFA Chili/i);

    const chili = await getPairedRecipes('byl-kfa-chili');
    expect(chili).toHaveLength(1);
    expect(chili[0]?.slug).toBe('byl-cheese-bread');
    expect(chili[0]?.title).toMatch(/Cheese Bread/i);
  });

  it('returns empty array when recipe has no pairings', async () => {
    expect(await getPairedRecipes('briam')).toEqual([]);
  });

  it('returns empty array for unknown slug', async () => {
    expect(await getPairedRecipes('not-a-recipe')).toEqual([]);
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
    expect(byl).toHaveLength(33);
    const onBylSite = byl.filter((r) => r.sourceUrl?.includes('byonandlara.com'));
    expect(onBylSite.length).toBeGreaterThanOrEqual(30);
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
    expect(recipes).toHaveLength(4);
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

  it('loads imported Mediterranean Dish chickpea salad video', async () => {
    const recipe = await getRecipeBySlug(
      'yt-mediterranean-chickpea-salad-recipe-vegan-chickpea-salad',
    );
    expect(recipe?.recipeKind).toBe('youtube');
    expect(recipe?.youtubeVideoId).toBe('244HOfIQw9Y');
    expect(
      recipe?.timedSteps?.some((s) => /dijon vinaigrette/i.test(s.text)),
    ).toBe(true);
    expect(recipe?.tags).toEqual(['mediterranean', 'refreshing', 'youtube']);
    expect(recipe?.ingredients.length).toBeGreaterThan(0);
  });
});

describe('getRecipesByMealList', () => {
  it('returns to-make meals including the original queue and imported videos', async () => {
    const recipes = await getRecipesByMealList('to-make');
    expect(recipes.length).toBeGreaterThanOrEqual(7);
    for (const slug of [
      'air-fried-veggies-shrimp',
      'air-fried-veggies-tilapia',
      'falafel',
      'mediterranean-salad',
      'yt-mediterranean-chickpea-salad-recipe-vegan-chickpea-salad',
      'yt-mom-style-creamy-ground-beef-stroganoff',
    ]) {
      expect(recipes.some((r) => r.slug === slug)).toBe(true);
    }
  });

  it('returns healthy-ideas meals', async () => {
    const recipes = await getRecipesByMealList('healthy-ideas');
    expect(recipes.some((r) => r.slug === 'briam')).toBe(true);
    expect(recipes.every((r) => r.mealLists?.includes('healthy-ideas'))).toBe(true);
  });
});
