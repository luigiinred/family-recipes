import { describe, expect, it, vi } from 'vitest';
import { scrollProgressForHero } from './useHeroScrollEffect';

describe('scrollProgressForHero', () => {
  it('returns 0 when the hero sits below the header', () => {
    vi.spyOn(window, 'getComputedStyle').mockReturnValue({
      getPropertyValue: () => '72px',
    } as unknown as CSSStyleDeclaration);

    const hero = {
      getBoundingClientRect: () => ({
        top: 200,
        height: 320,
        bottom: 520,
        left: 0,
        right: 0,
        width: 800,
        x: 0,
        y: 200,
        toJSON: () => ({}),
      }),
    } as HTMLElement;

    expect(scrollProgressForHero(hero)).toBe(0);
  });

  it('returns 1 when the hero has scrolled well past the header', () => {
    vi.spyOn(window, 'getComputedStyle').mockReturnValue({
      getPropertyValue: () => '72px',
    } as unknown as CSSStyleDeclaration);

    const hero = {
      getBoundingClientRect: () => ({
        top: -240,
        height: 320,
        bottom: 80,
        left: 0,
        right: 0,
        width: 800,
        x: 0,
        y: -240,
        toJSON: () => ({}),
      }),
    } as HTMLElement;

    expect(scrollProgressForHero(hero)).toBe(1);
  });
});
