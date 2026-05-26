import { Button, Card, Stack, Text } from '@/design-system/primitives';
import styles from './CatalogEmptyState.module.css';

type CatalogEmptyStateProps = {
  showClearAll: boolean;
  onClearAll?: () => void;
};

export function CatalogEmptyState({ showClearAll, onClearAll }: CatalogEmptyStateProps) {
  return (
    <section className={styles.root} aria-label="No matches" role="status">
      <Card className={styles.card}>
        <Stack gap="md" className={styles.content}>
          <div className={styles.icon} aria-hidden>
            <span className={styles.iconLens} />
            <span className={styles.iconHandle} />
          </div>
          <Stack gap="sm" className={styles.copy}>
            <Text as="h2" variant="title" className={styles.heading}>
              No matches
            </Text>
            <Text variant="muted" className={styles.hint}>
              Try a different search or remove some filters to see more recipes.
            </Text>
          </Stack>
          {showClearAll && onClearAll ? (
            <Button type="button" variant="primary" onClick={onClearAll}>
              Clear all filters
            </Button>
          ) : null}
        </Stack>
      </Card>
    </section>
  );
}
