import { TagFilterButton } from '@/components/TagFilterButton/TagFilterButton';
import { Badge, Stack, Text } from '@/design-system/primitives';
import { IDEA_KIND_LABELS, type FoodIdea } from '@/static-api/types/foodIdea';
import styles from './FoodIdeaMeta.module.css';

type FoodIdeaMetaProps = {
  idea: FoodIdea;
};

export function FoodIdeaMeta({ idea }: FoodIdeaMetaProps) {
  const kindLabel = idea.ideaKind ? IDEA_KIND_LABELS[idea.ideaKind] : null;

  return (
    <Stack gap="sm" className={styles.meta}>
      {idea.description ? <Text variant="muted">{idea.description}</Text> : null}
      {kindLabel ? <Badge>{kindLabel}</Badge> : null}
      {idea.tags.length > 0 ? (
        <Stack direction="row" gap="sm" className={styles.tags}>
          {idea.tags.map((tag) => (
            <TagFilterButton key={tag} tag={tag} />
          ))}
        </Stack>
      ) : null}
    </Stack>
  );
}
