import {
  BENTO_SECTION_ORDER,
  type BentoIdea,
  type BentoSection,
} from '../types/bentoIdea';

export function groupBentoIdeasBySection(
  ideas: BentoIdea[],
): Record<BentoSection, BentoIdea[]> {
  const grouped = Object.fromEntries(
    BENTO_SECTION_ORDER.map((section) => [section, [] as BentoIdea[]]),
  ) as Record<BentoSection, BentoIdea[]>;

  for (const idea of ideas) {
    grouped[idea.section]?.push(idea);
  }

  return grouped;
}
