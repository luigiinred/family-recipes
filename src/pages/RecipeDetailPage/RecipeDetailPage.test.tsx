import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { RecipeFilterProvider } from '@/features/search/RecipeFilterContext';
import { loadRecipeEdits } from '@/features/recipe-edits/recipeEdits';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { resetEditorModeCache } from '@/hooks/useEditorMode';
import { resetRecipeEditsCache } from '@/hooks/useRecipeEdits';
import { resetStarredRecipesCache } from '@/hooks/useStarredRecipes';
import { saveEditorMode } from '@/features/recipe-edits/editorMode';
import * as staticApi from '@/static-api';
import type { Recipe } from '@/static-api/types/recipe';
import { RecipeDetailPage } from './RecipeDetailPage';

const standardRecipe: Recipe = {
  id: '1',
  slug: 'test-soup',
  title: 'Test Soup',
  description: 'A cozy soup',
  imageUrl: '',
  prepMinutes: 10,
  cookMinutes: 20,
  servings: 4,
  tags: ['soup'],
  ingredients: [{ amount: '1', unit: 'cup', name: 'broth' }],
  steps: ['Simmer soup'],
};

const youtubeRecipe: Recipe = {
  id: 'yt-1',
  slug: 'youtube-demo-roasted-vegetables',
  title: 'Roasted vegetables (video)',
  description: 'Video walkthrough',
  imageUrl: 'https://i.ytimg.com/vi/abc12345678/hqdefault.jpg',
  prepMinutes: 15,
  cookMinutes: 45,
  servings: 4,
  tags: ['video'],
  ingredients: [{ amount: '2', unit: 'cups', name: 'zucchini' }],
  steps: ['Prep vegetables', 'Roast in oven'],
  recipeKind: 'youtube',
  youtubeVideoId: 'abc12345678',
  timedSteps: [
    { text: 'Prep vegetables', startSeconds: 45 },
    { text: 'Roast in oven', startSeconds: 312 },
  ],
  sourceUrl: 'https://www.youtube.com/watch?v=abc12345678',
};

function renderAt(slug: string, route = `/recipes/${slug}`) {
  return render(
    <MemoryRouter initialEntries={[route]}>
      <RecipeFilterProvider>
        <Routes>
          <Route path="/recipes/:slug" element={<RecipeDetailPage />} />
          <Route path="/" element={<div>Home</div>} />
        </Routes>
      </RecipeFilterProvider>
    </MemoryRouter>,
  );
}

describe('RecipeDetailPage editor', () => {
  beforeEach(() => {
    localStorage.clear();
    resetRecipeEditsCache();
    resetEditorModeCache();
    resetStarredRecipesCache();
    saveEditorMode(true);
    resetEditorModeCache();
    vi.spyOn(staticApi, 'getRecipeBySlug').mockResolvedValue(standardRecipe);
  });

  it('shows edited title from inline edit when editor mode is on', async () => {
    const user = userEvent.setup();
    renderAt('test-soup');
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Test Soup' })).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: 'Edit title' }));
    const titleInput = screen.getByLabelText('title');
    await user.clear(titleInput);
    await user.type(titleInput, 'Better Soup');
    await user.click(screen.getByRole('button', { name: 'Save' }));

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Better Soup' })).toBeInTheDocument();
    });
  });

  it('hides recipe after delete and records removal for export', async () => {
    const user = userEvent.setup();
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    renderAt('test-soup');
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Delete Test Soup' })).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: 'Delete Test Soup' }));

    await waitFor(() => {
      expect(screen.getByText('Home')).toBeInTheDocument();
    });
    expect(loadRecipeEdits().edits['test-soup']?.removed).toBe(true);
  });
});

describe('RecipeDetailPage starring', () => {
  beforeEach(() => {
    localStorage.clear();
    resetRecipeEditsCache();
    resetStarredRecipesCache();
    vi.spyOn(staticApi, 'getRecipeBySlug').mockResolvedValue(standardRecipe);
  });

  it('toggles starred state from the recipe header', async () => {
    const user = userEvent.setup();
    renderAt('test-soup');
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Test Soup' })).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: 'Star Test Soup' }));
    expect(
      screen.getByRole('button', { name: 'Remove Test Soup from starred' }),
    ).toHaveAttribute('aria-pressed', 'true');
  });
});

describe('RecipeDetailPage tags', () => {
  beforeEach(() => {
    localStorage.clear();
    resetRecipeEditsCache();
    vi.spyOn(staticApi, 'getRecipeBySlug').mockResolvedValue(standardRecipe);
    vi.spyOn(staticApi, 'getAllTags').mockResolvedValue(['soup', 'slow-cooker', 'vegetarian']);
  });

  it('navigates home with tag filter when a tag is clicked', async () => {
    const user = userEvent.setup();
    renderAt('test-soup');
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Filter by soup' })).toBeInTheDocument();
    });
    await user.click(screen.getByRole('button', { name: 'Filter by soup' }));
    expect(screen.getByText('Home')).toBeInTheDocument();
  });

  it('shows tags and persists a new tag on the recipe', async () => {
    const user = userEvent.setup();
    renderAt('test-soup');
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Filter by soup' })).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: 'Add tag' }));
    await waitFor(() => {
      expect(screen.getByRole('option', { name: 'vegetarian' })).toBeInTheDocument();
    });
    await user.click(screen.getByRole('option', { name: 'vegetarian' }));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Filter by vegetarian' })).toBeInTheDocument();
    });
    expect(loadRecipeEdits().edits['test-soup']?.overrides?.tags).toEqual(['soup', 'vegetarian']);
  });
});

describe('RecipeDetailPage servings', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.spyOn(staticApi, 'getRecipeBySlug').mockResolvedValue(standardRecipe);
  });

  it('adjusts servings when the stat in the recipe header is clicked', async () => {
    const user = userEvent.setup();
    renderAt('test-soup');
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /4 servings, click to adjust/i })).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: /4 servings, click to adjust/i }));
    const input = screen.getByLabelText('Servings');
    fireEvent.change(input, { target: { value: '6' } });
    fireEvent.blur(input);

    expect(screen.getByRole('button', { name: /6 servings, click to adjust/i })).toBeInTheDocument();
    expect(screen.getByRole('region', { name: /ingredients/i })).toHaveTextContent(
      /1\.5\s+cup\s+broth/,
    );
  });
});

describe('RecipeDetailPage layout', () => {
  beforeEach(() => {
    localStorage.clear();
    resetRecipeEditsCache();
    resetEditorModeCache();
    resetStarredRecipesCache();
  });

  it('overlaps ingredients on the hero image for non-video recipes', async () => {
    vi.spyOn(staticApi, 'getRecipeBySlug').mockResolvedValue(standardRecipe);
    renderAt('test-soup');
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Test Soup' })).toBeInTheDocument();
    });
    expect(screen.getByLabelText('Recipe details')).toBeInTheDocument();
    const ingredients = screen.getByRole('region', { name: /ingredients/i });
    expect(ingredients).toHaveAttribute('data-ingredients-placement', 'overlap');
  });

  it('places ingredients in the right column beside directions for video recipes', async () => {
    vi.spyOn(staticApi, 'getRecipeBySlug').mockResolvedValue(youtubeRecipe);
    renderAt('youtube-demo-roasted-vegetables');
    await waitFor(() => {
      expect(screen.getByTitle('Roasted vegetables (video)')).toBeInTheDocument();
    });
    const ingredients = screen.getByRole('region', { name: /ingredients/i });
    expect(ingredients).toHaveAttribute('data-ingredients-placement', 'column');
    expect(screen.getByRole('article').querySelector('[data-layout="youtube"]')).toBeTruthy();
  });

  it('uses a sticky video column layout for YouTube recipes', async () => {
    renderAt('youtube-demo-roasted-vegetables');
    await waitFor(() => {
      expect(screen.getByTitle('Roasted vegetables (video)')).toBeInTheDocument();
    });
    const layout = screen.getByRole('article').querySelector('[data-layout="youtube"]');
    expect(layout?.querySelector('[class*="stickyPlayer"]')).toBeTruthy();
    expect(layout?.querySelector('[class*="videoContentColumn"]')).toBeTruthy();
  });

  it('shows timestamped steps when edits cleared timedSteps', async () => {
    const { saveRecipeEditsStore } = await import('@/features/recipe-edits/recipeEdits');
    saveRecipeEditsStore({
      version: 1,
      edits: {
        'youtube-demo-roasted-vegetables': {
          slug: 'youtube-demo-roasted-vegetables',
          updatedAt: new Date().toISOString(),
          overrides: { timedSteps: [], steps: ['Only plain steps'] },
        },
      },
    });
    resetRecipeEditsCache();
    renderAt('youtube-demo-roasted-vegetables');
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /play video at 0:45/i })).toBeInTheDocument();
    });
  });
});

const kfaChili: Recipe = {
  id: 'chili-1',
  slug: 'byl-kfa-chili',
  title: 'KFA Chili',
  description: 'Family chili',
  imageUrl: '',
  prepMinutes: 0,
  cookMinutes: 0,
  servings: 4,
  tags: ['family'],
  ingredients: [],
  steps: ['Simmer'],
};

describe('RecipeDetailPage related recipes', () => {
  beforeEach(() => {
    localStorage.clear();
    resetRecipeEditsCache();
    resetEditorModeCache();
    vi.spyOn(staticApi, 'getRecipeBySlug').mockResolvedValue({
      ...standardRecipe,
      slug: 'byl-cheese-bread',
      title: 'Cheese Bread',
      pairedWith: ['byl-kfa-chili'],
    });
    vi.spyOn(staticApi, 'getRecipes').mockResolvedValue([
      {
        ...standardRecipe,
        slug: 'byl-cheese-bread',
        title: 'Cheese Bread',
        pairedWith: ['byl-kfa-chili'],
      },
      kfaChili,
    ]);
  });

  it('hides related recipes when there are no links outside editor mode', async () => {
    vi.spyOn(staticApi, 'getRecipeBySlug').mockResolvedValue({
      ...standardRecipe,
      slug: 'plain-recipe',
      title: 'Plain Recipe',
      notes: 'Some note',
    });
    vi.spyOn(staticApi, 'getRecipes').mockResolvedValue([
      { ...standardRecipe, slug: 'plain-recipe', title: 'Plain Recipe', notes: 'Some note' },
    ]);

    renderAt('plain-recipe');
    await waitFor(() => {
      expect(screen.getByText('Some note')).toBeInTheDocument();
    });
    expect(screen.queryByRole('navigation', { name: 'Related recipes' })).not.toBeInTheDocument();
  });

  it('shows related recipe links in the notes panel', async () => {
    renderAt('byl-cheese-bread');
    await waitFor(() => {
      expect(screen.getByRole('navigation', { name: 'Related recipes' })).toBeInTheDocument();
    });
    expect(screen.getByRole('link', { name: 'KFA Chili' })).toHaveAttribute(
      'href',
      '/recipes/byl-kfa-chili',
    );
  });

  it('adds a linked recipe from editor mode search', async () => {
    const user = userEvent.setup();
    saveEditorMode(true);
    resetEditorModeCache();
    vi.spyOn(staticApi, 'getRecipeBySlug').mockResolvedValue({
      ...standardRecipe,
      slug: 'byl-cheese-bread',
      title: 'Cheese Bread',
    });
    vi.spyOn(staticApi, 'getRecipes').mockResolvedValue([
      {
        ...standardRecipe,
        slug: 'byl-cheese-bread',
        title: 'Cheese Bread',
      },
      kfaChili,
    ]);

    renderAt('byl-cheese-bread');
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Add linked recipe' })).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: 'Add linked recipe' }));
    await user.type(screen.getByRole('combobox', { name: 'Search recipes' }), 'chili');
    await user.click(screen.getByRole('option', { name: 'KFA Chili' }));

    await waitFor(() => {
      expect(loadRecipeEdits().edits['byl-cheese-bread']?.overrides?.pairedWith).toEqual([
        'byl-kfa-chili',
      ]);
    });
    expect(screen.getByRole('link', { name: 'KFA Chili' })).toBeInTheDocument();
  });
});

describe('RecipeDetailPage video recipes', () => {
  beforeEach(() => {
    localStorage.clear();
    resetRecipeEditsCache();
    resetEditorModeCache();
    resetStarredRecipesCache();
    vi.spyOn(staticApi, 'getRecipeBySlug').mockResolvedValue(youtubeRecipe);
  });

  it('shows embedded player and timestamped steps', async () => {
    renderAt('youtube-demo-roasted-vegetables');
    await waitFor(() => {
      expect(screen.getByTitle('Roasted vegetables (video)')).toBeInTheDocument();
    });
    expect(
      screen.getByRole('button', { name: /play video at 0:45/i }),
    ).toBeInTheDocument();
  });

  it('seeks the embed when a timed step is clicked', async () => {
    const user = userEvent.setup();
    renderAt('youtube-demo-roasted-vegetables');
    await waitFor(() => {
      expect(screen.getByTitle('Roasted vegetables (video)')).toBeInTheDocument();
    });
    expect(screen.getByTitle('Roasted vegetables (video)')).toHaveAttribute(
      'src',
      expect.stringContaining('start=0'),
    );

    await user.click(screen.getByRole('button', { name: /play video at 5:12/i }));
    await waitFor(() => {
      const src = screen.getByTitle('Roasted vegetables (video)').getAttribute('src');
      expect(src).toContain('start=312');
      expect(src).toMatch(/autoplay=1/);
    });
  });
});
