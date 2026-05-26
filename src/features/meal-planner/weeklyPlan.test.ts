import { beforeEach, describe, expect, it } from 'vitest';
import type { Recipe } from '@/static-api/types/recipe';
import {
  autoFillWeeklyPlan,
  createEmptyPlan,
  loadWeeklyPlan,
  movePlanSlot,
  saveWeeklyPlan,
} from './weeklyPlan';
import { LEGACY_STORAGE_KEY, STORAGE_KEY } from './types';

const soup: Recipe = {
  id: '1',
  slug: 'test-soup',
  title: 'Test Soup',
  description: '',
  imageUrl: '',
  prepMinutes: 0,
  cookMinutes: 0,
  servings: 4,
  tags: ['soup'],
  mealTypes: ['lunch', 'dinner'],
  ingredients: [],
  steps: [],
};

const salad: Recipe = {
  id: '2',
  slug: 'test-salad',
  title: 'Test Salad',
  description: '',
  imageUrl: '',
  prepMinutes: 0,
  cookMinutes: 0,
  servings: 4,
  tags: ['salad'],
  mealTypes: ['side', 'lunch'],
  ingredients: [],
  steps: [],
};

beforeEach(() => {
  localStorage.clear();
});

describe('weeklyPlan', () => {
  it('creates an empty plan for all days and slots', () => {
    const plan = createEmptyPlan();
    expect(plan.mon.breakfast).toBeNull();
    expect(plan.sun.dessert).toBeNull();
  });

  it('persists plan to localStorage', () => {
    const plan = createEmptyPlan();
    plan.mon.lunch = 'briam';
    saveWeeklyPlan(plan);
    const raw = localStorage.getItem(STORAGE_KEY);
    expect(raw).toContain('briam');
    expect(loadWeeklyPlan().mon.lunch).toBe('briam');
  });

  it('migrates legacy v1 plans into v2 with new meal slots', () => {
    localStorage.setItem(
      LEGACY_STORAGE_KEY,
      JSON.stringify({
        mon: { breakfast: 'eggs', lunch: null, dinner: 'pasta' },
        tue: { breakfast: null, lunch: null, dinner: null },
        wed: { breakfast: null, lunch: null, dinner: null },
        thu: { breakfast: null, lunch: null, dinner: null },
        fri: { breakfast: null, lunch: null, dinner: null },
        sat: { breakfast: null, lunch: null, dinner: null },
        sun: { breakfast: null, lunch: null, dinner: null },
      }),
    );

    const plan = loadWeeklyPlan();
    expect(plan.mon.breakfast).toBe('eggs');
    expect(plan.mon.dinner).toBe('pasta');
    expect(plan.mon.snack).toBeNull();
    expect(localStorage.getItem(STORAGE_KEY)).toContain('eggs');
  });

  it('moves a recipe between cells', () => {
    let plan = createEmptyPlan();
    plan = movePlanSlot(
      { ...plan, mon: { ...plan.mon, lunch: 'test-soup' } },
      'mon',
      'lunch',
      'tue',
      'dinner',
    );
    expect(plan.mon.lunch).toBeNull();
    expect(plan.tue.dinner).toBe('test-soup');
  });
});

describe('autoFillWeeklyPlan', () => {
  it('fills empty slots from starred recipes that match meal type', () => {
    const plan = autoFillWeeklyPlan(createEmptyPlan(), {
      recipes: [soup, salad],
      starredSlugs: ['test-soup', 'test-salad'],
    });

    expect(plan.mon.lunch).toBe('test-soup');
    expect(plan.mon.side).toBe('test-salad');
  });

  it('does not reuse the same recipe twice in one pass', () => {
    const plan = autoFillWeeklyPlan(createEmptyPlan(), {
      recipes: [soup],
      starredSlugs: ['test-soup'],
    });

    const lunchCount = [plan.mon.lunch, plan.tue.lunch, plan.wed.lunch].filter(
      (s) => s === 'test-soup',
    ).length;
    expect(lunchCount).toBe(1);
  });
});
