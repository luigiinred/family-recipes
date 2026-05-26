import { Link } from 'react-router-dom';
import { Button, Stack, Text } from '@/design-system/primitives';
import type { Recipe } from '@/static-api/types/recipe';
import type { RecipeEdit } from './types';
import styles from './DeletedRecipesList.module.css';

type Props = {
  deletedEdits: RecipeEdit[];
  catalogBySlug: Map<string, Recipe>;
  onRestore: (slug: string) => void;
};

export function DeletedRecipesList({ deletedEdits, catalogBySlug, onRestore }: Props) {
  if (deletedEdits.length === 0) {
    return (
      <Text variant="muted">No hidden recipes. Delete a recipe in editor mode to hide it here.</Text>
    );
  }

  return (
    <ul className={styles.list}>
      {deletedEdits.map((edit) => {
        const title = catalogBySlug.get(edit.slug)?.title ?? edit.slug;
        return (
          <li key={edit.slug} className={styles.item}>
            <Stack gap="sm">
              <Link to={`/recipes/${edit.slug}`} className={styles.link}>
                {title}
              </Link>
              <Text variant="muted" className={styles.slug}>
                {edit.slug}
              </Text>
            </Stack>
            <Button type="button" variant="ghost" onClick={() => onRestore(edit.slug)}>
              Restore
            </Button>
          </li>
        );
      })}
    </ul>
  );
}
