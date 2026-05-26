import { Button, Text } from '@/design-system/primitives';
import { BENTO_SECTION_LABELS, type BentoIdea } from '@/static-api/types/bentoIdea';
import styles from './BentoBoxSummary.module.css';

type BentoBoxSummaryProps = {
  itemCount: number;
  picks: BentoIdea[];
  onRemove: (slug: string) => void;
  onClear: () => void;
  onRandomizeBox: () => void;
  randomizingBox: boolean;
  onRandomizeSlot: (slotIndex: number) => void;
  randomizingSlotIndex: number | null;
};

export function BentoBoxSummary({
  itemCount,
  picks,
  onRemove,
  onClear,
  onRandomizeBox,
  randomizingBox,
  onRandomizeSlot,
  randomizingSlotIndex,
}: BentoBoxSummaryProps) {
  const slots = Array.from({ length: itemCount }, (_, index) => picks[index] ?? null);

  return (
    <section className={styles.root} aria-label="Your bento">
      <div className={styles.header}>
        <Text as="h2" variant="subtitle">
          Your bento ({picks.length}/{itemCount})
        </Text>
        {picks.length > 0 ? (
          <Button
            variant="ghost"
            onClick={onClear}
            disabled={randomizingBox || randomizingSlotIndex !== null}
          >
            Clear all
          </Button>
        ) : null}
        <Button
          variant="ghost"
          className={styles.randomizeBoxButton}
          onClick={onRandomizeBox}
          disabled={randomizingBox}
          aria-label="Randomize bento box"
        >
          {randomizingBox ? <span className={styles.spinner} aria-hidden /> : null}
          Randomize box
        </Button>
      </div>
      <ul className={styles.slots}>
        {slots.map((idea, index) => (
          <li key={idea?.slug ?? `empty-${index}`} className={styles.slot}>
            {idea ? (
              <>
                <div>
                  <Text variant="label">{BENTO_SECTION_LABELS[idea.section]}</Text>
                  <Text as="p" variant="body">
                    {idea.title}
                  </Text>
                </div>
                <div className={styles.slotActions}>
                  <Button
                    variant="ghost"
                    aria-label={`Randomize item ${index + 1}`}
                    onClick={() => onRandomizeSlot(index)}
                    disabled={
                      randomizingBox || (randomizingSlotIndex !== null && randomizingSlotIndex !== index)
                    }
                    className={styles.randomizeItemButton}
                  >
                    {randomizingSlotIndex === index ? (
                      <span className={styles.spinnerSmall} aria-hidden />
                    ) : (
                      '↻'
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    aria-label={`Remove ${idea.title}`}
                    onClick={() => onRemove(idea.slug)}
                    disabled={randomizingBox || randomizingSlotIndex !== null}
                  >
                    ×
                  </Button>
                </div>
              </>
            ) : (
              <Text variant="muted">Empty slot {index + 1}</Text>
            )}
          </li>
        ))}
      </ul>
      {picks.length >= itemCount ? (
        <Text variant="muted">Box is full — remove an item to swap something in.</Text>
      ) : (
        <Text variant="muted">Tap ideas below to fill your box. Mix sections any way you like.</Text>
      )}
    </section>
  );
}
