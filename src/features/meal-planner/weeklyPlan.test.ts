import { beforeEach, describe, expect, it } from 'vitest';
import { createEmptyPlan, loadWeeklyPlan, saveWeeklyPlan } from './weeklyPlan';
import { STORAGE_KEY } from './types';

beforeEach(() => {
  localStorage.clear();
});

describe('weeklyPlan', () => {
  it('creates an empty plan for all days and slots', () => {
    const plan = createEmptyPlan();
    expect(plan.mon.breakfast).toBeNull();
    expect(plan.sun.dinner).toBeNull();
  });

  it('persists plan to localStorage', () => {
    const plan = createEmptyPlan();
    plan.mon.lunch = 'briam';
    saveWeeklyPlan(plan);
    const raw = localStorage.getItem(STORAGE_KEY);
    expect(raw).toContain('briam');
    expect(loadWeeklyPlan().mon.lunch).toBe('briam');
  });
});
