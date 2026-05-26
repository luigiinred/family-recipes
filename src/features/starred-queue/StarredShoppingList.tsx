import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { IngredientLine } from '@/components/IngredientLine/IngredientLine';
import { Button, Stack, Text } from '@/design-system/primitives';
import { copyToClipboard } from '@/lib/copyToClipboard';
import type { Recipe } from '@/static-api/types/recipe';
import { buildShoppingList, formatShoppingListText } from './shoppingList';
import styles from './StarredPlan.module.css';

type StarredShoppingListProps = {
  recipes: Recipe[];
};

export function StarredShoppingList({ recipes }: StarredShoppingListProps) {
  const [copied, setCopied] = useState(false);
  const groups = useMemo(() => buildShoppingList(recipes), [recipes]);

  if (recipes.length === 0) {
    return (
      <div className={styles.empty}>
        <Text variant="muted">
          Star recipes to build a shopping list from everything in your cook queue.
        </Text>
        <Link to="/" className={styles.emptyLink}>
          Browse recipes
        </Link>
      </div>
    );
  }

  if (groups.length === 0) {
    return (
      <Text variant="muted">
        Your queued recipes do not have ingredients yet. Open a recipe to import or add them.
      </Text>
    );
  }

  async function handleCopy() {
    await copyToClipboard(formatShoppingListText(groups));
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  }

  return (
    <Stack gap="md">
      <div className={styles.shoppingToolbar}>
        <Text variant="muted">
          Merged from your starred queue — each line shows which recipe needs it.
        </Text>
        <Button type="button" variant="ghost" onClick={() => void handleCopy()}>
          {copied ? 'Copied' : 'Copy list'}
        </Button>
      </div>
      <ul className={styles.shoppingList} aria-label="Shopping list">
        {groups.map((group) => (
          <li key={group.key} className={styles.shoppingGroup}>
            <Text as="h2" variant="label" className={styles.shoppingGroupName}>
              {group.displayName}
            </Text>
            <ul className={styles.shoppingLines}>
              {group.lines.map((line) => (
                <li
                  key={`${line.recipeSlug}-${line.ingredient.amount}-${line.ingredient.unit}-${line.ingredient.name}`}
                  className={styles.shoppingLine}
                >
                  <IngredientLine ingredient={line.ingredient} />
                  <Text variant="muted" className={styles.shoppingUsedIn}>
                    Used in{' '}
                    <Link to={`/recipes/${line.recipeSlug}`} className={styles.shoppingRecipeLink}>
                      {line.recipeTitle}
                    </Link>
                  </Text>
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </Stack>
  );
}
