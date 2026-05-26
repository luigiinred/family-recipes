import { useMemo } from 'react';
import { Text } from '@/design-system/primitives';
import { groupBentoIdeasBySection } from '@/static-api/loaders/groupBentoIdeasBySection';
import { BENTO_SECTION_ORDER, BENTO_SECTION_LABELS, type BentoIdea } from '@/static-api/types/bentoIdea';
import { BentoIdeaCard } from './BentoIdeaCard';
import styles from './BentoSectionBrowse.module.css';

type BentoSectionBrowseProps = {
  ideas: BentoIdea[];
  selectedSlugs: Set<string>;
  canAddMore: boolean;
  onAdd: (slug: string) => void;
  onRemove: (slug: string) => void;
};

export function BentoSectionBrowse({
  ideas,
  selectedSlugs,
  canAddMore,
  onAdd,
  onRemove,
}: BentoSectionBrowseProps) {
  const grouped = useMemo(() => groupBentoIdeasBySection(ideas), [ideas]);

  return (
    <div className={styles.root}>
      {BENTO_SECTION_ORDER.map((section) => {
        const sectionIdeas = grouped[section];
        if (sectionIdeas.length === 0) return null;
        return (
          <section key={section} className={styles.section} aria-label={BENTO_SECTION_LABELS[section]}>
            <Text as="h2" variant="subtitle">
              {BENTO_SECTION_LABELS[section]}
            </Text>
            <ul className={styles.grid}>
              {sectionIdeas.map((idea) => (
                <BentoIdeaCard
                  key={idea.slug}
                  idea={idea}
                  selected={selectedSlugs.has(idea.slug)}
                  disabled={!canAddMore && !selectedSlugs.has(idea.slug)}
                  onAdd={() => onAdd(idea.slug)}
                  onRemove={() => onRemove(idea.slug)}
                />
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
