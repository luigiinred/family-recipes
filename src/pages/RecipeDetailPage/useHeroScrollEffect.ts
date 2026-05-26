import { useEffect, useRef, useState, type RefObject } from 'react';

function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return false;
  }
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function headerOffsetPx(): number {
  const raw = getComputedStyle(document.documentElement).getPropertyValue('--app-header-height');
  const parsed = Number.parseFloat(raw);
  return Number.isFinite(parsed) ? parsed : 72;
}

/** 0 = inline hero only; 1 = full blurred header backdrop while scrolling. */
export function scrollProgressForHero(heroEl: HTMLElement): number {
  const rect = heroEl.getBoundingClientRect();
  const heroHeight = Math.max(rect.height, 1);
  const scrolledPast = headerOffsetPx() + 16 - rect.top;
  const range = heroHeight * 0.9;
  return Math.max(0, Math.min(1, scrolledPast / range));
}

/** Scroll-linked hero → blurred header backdrop (disabled when reduced motion is on). */
export function useHeroScrollEffect(heroRef: RefObject<HTMLElement | null>) {
  const [progress, setProgress] = useState(0);
  const reducedMotionRef = useRef(prefersReducedMotion());

  useEffect(() => {
    if (reducedMotionRef.current) return;

    let raf = 0;

    const update = () => {
      const el = heroRef.current;
      if (!el) return;
      setProgress(scrollProgressForHero(el));
    };

    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(update);
    };

    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [heroRef]);

  return { progress: reducedMotionRef.current ? 0 : progress };
}
