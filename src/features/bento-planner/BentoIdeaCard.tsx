import { Link } from 'react-router-dom';
import { Button, Card, Stack, Text } from '@/design-system/primitives';
import type { BentoIdea } from '@/static-api/types/bentoIdea';
import styles from './BentoIdeaCard.module.css';

type BentoIdeaCardProps = {
  idea: BentoIdea;
  selected: boolean;
  disabled: boolean;
  onAdd: () => void;
  onRemove: () => void;
};

export function BentoIdeaCard({
  idea,
  selected,
  disabled,
  onAdd,
  onRemove,
}: BentoIdeaCardProps) {
  return (
    <Card as="li" className={styles.card}>
      <Stack gap="sm" className={styles.body}>
        <Text as="h3" variant="subtitle">
          {idea.title}
        </Text>
        {idea.description ? (
          <Text variant="muted" className={styles.description}>
            {idea.description}
          </Text>
        ) : null}
        {idea.tips ? (
          <Text variant="muted" className={styles.tips}>
            {idea.tips}
          </Text>
        ) : null}
        <div className={styles.actions}>
          {idea.recipeSlug ? (
            <Link to={`/recipes/${idea.recipeSlug}`} className={styles.recipeLink}>
              View recipe
            </Link>
          ) : null}
          {selected ? (
            <Button variant="ghost" onClick={onRemove}>
              Remove
            </Button>
          ) : (
            <Button variant="primary" disabled={disabled} onClick={onAdd}>
              Add to box
            </Button>
          )}
        </div>
      </Stack>
    </Card>
  );
}
