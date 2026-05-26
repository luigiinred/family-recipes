import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Text } from '@/design-system/primitives';
import { BentoBoxSummary } from '@/features/bento-planner/BentoBoxSummary';
import { randomizeBentoBox, randomizeBentoSlot } from '@/features/bento-planner/randomizeBentoPicks';
import { BentoItemCountPicker } from '@/features/bento-planner/BentoItemCountPicker';
import { BentoSectionBrowse } from '@/features/bento-planner/BentoSectionBrowse';
import {
  addBentoPick,
  loadBentoItemCount,
  loadBentoPicks,
  removeBentoPick,
  saveBentoItemCount,
  saveBentoPicks,
  trimBentoPicksToCount,
} from '@/features/bento-planner/bentoPlannerStorage';
import { useBentoIdeas } from '@/hooks/useBentoIdeas';
import styles from './BentoPlannerPage.module.css';

export function BentoPlannerPage() {
  const { ideas, loading, error } = useBentoIdeas();
  const [itemCount, setItemCount] = useState(loadBentoItemCount);
  const [pickSlugs, setPickSlugs] = useState(() => trimBentoPicksToCount(loadBentoPicks(), loadBentoItemCount()));
  const [randomizingBox, setRandomizingBox] = useState(false);
  const [randomizingSlotIndex, setRandomizingSlotIndex] = useState<number | null>(null);

  const boxTimerRef = useRef<number | null>(null);
  const slotTimerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (boxTimerRef.current) window.clearTimeout(boxTimerRef.current);
      if (slotTimerRef.current) window.clearTimeout(slotTimerRef.current);
    };
  }, []);

  const ideasBySlug = useMemo(
    () => new Map(ideas.map((idea) => [idea.slug, idea])),
    [ideas],
  );

  const picks = useMemo(
    () =>
      pickSlugs
        .map((slug) => ideasBySlug.get(slug))
        .filter((idea): idea is NonNullable<typeof idea> => Boolean(idea)),
    [pickSlugs, ideasBySlug],
  );

  const selectedSlugs = useMemo(() => new Set(pickSlugs), [pickSlugs]);
  const canAddMore = pickSlugs.length < itemCount;

  const handleItemCountChange = useCallback((count: number) => {
    setItemCount(count);
    saveBentoItemCount(count);
    setPickSlugs((current) => {
      const trimmed = trimBentoPicksToCount(current, count);
      saveBentoPicks(trimmed);
      return trimmed;
    });
  }, []);

  const handleRandomizeBox = useCallback(() => {
    if (loading || error || randomizingBox) return;
    if (ideas.length === 0) return;

    setRandomizingBox(true);
    setPickSlugs((current) => {
      const next = randomizeBentoBox({
        ideas,
        itemCount,
        currentPicks: current,
      });
      saveBentoPicks(next);
      return next;
    });

    if (boxTimerRef.current) window.clearTimeout(boxTimerRef.current);
    boxTimerRef.current = window.setTimeout(() => setRandomizingBox(false), 350);
  }, [ideas, itemCount, loading, error, randomizingBox]);

  const handleRandomizeSlot = useCallback(
    (slotIndex: number) => {
      if (loading || error) return;
      if (randomizingBox) return;
      if (randomizingSlotIndex !== null) return;
      if (slotIndex < 0 || slotIndex >= pickSlugs.length) return;
      if (ideas.length === 0) return;

      setRandomizingSlotIndex(slotIndex);
      setPickSlugs((current) => {
        const next = randomizeBentoSlot({
          ideas,
          currentPicks: current,
          slotIndex,
        });
        saveBentoPicks(next);
        return next;
      });

      if (slotTimerRef.current) window.clearTimeout(slotTimerRef.current);
      slotTimerRef.current = window.setTimeout(() => setRandomizingSlotIndex(null), 350);
    },
    [error, ideas, loading, pickSlugs.length, randomizingBox, randomizingSlotIndex],
  );

  const handleAdd = useCallback(
    (slug: string) => {
      setPickSlugs((current) => {
        const next = addBentoPick(current, slug, itemCount);
        saveBentoPicks(next);
        return next;
      });
    },
    [itemCount],
  );

  const handleRemove = useCallback((slug: string) => {
    setPickSlugs((current) => {
      const next = removeBentoPick(current, slug);
      saveBentoPicks(next);
      return next;
    });
  }, []);

  const handleClear = useCallback(() => {
    setPickSlugs([]);
    saveBentoPicks([]);
  }, []);

  if (loading) {
    return <Text variant="muted">Loading bento ideas…</Text>;
  }

  if (error) {
    return <Text variant="muted">{error}</Text>;
  }

  return (
    <section className={styles.page}>
      <Text as="h1" variant="title">
        Bento planner
      </Text>
      <Text variant="muted" className={styles.intro}>
        Cold, finger-friendly ideas for a toddler bento — no reheating required. Pick how many
        compartments you are filling, then mix snacks, fruit, veggies, a main, and a treat.
      </Text>
      <BentoItemCountPicker count={itemCount} onChange={handleItemCountChange} />
      <BentoBoxSummary
        itemCount={itemCount}
        picks={picks}
        onRemove={handleRemove}
        onClear={handleClear}
        onRandomizeBox={handleRandomizeBox}
        randomizingBox={randomizingBox}
        onRandomizeSlot={handleRandomizeSlot}
        randomizingSlotIndex={randomizingSlotIndex}
      />
      <BentoSectionBrowse
        ideas={ideas}
        selectedSlugs={selectedSlugs}
        canAddMore={canAddMore}
        onAdd={handleAdd}
        onRemove={handleRemove}
      />
    </section>
  );
}
