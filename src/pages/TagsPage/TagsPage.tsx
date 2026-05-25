import { useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { RecipeCard } from '@/components/RecipeCard/RecipeCard';
import { Stack, Text } from '@/design-system/primitives';
import { useAllTags } from '@/hooks/useAllTags';
import { useRecipeCatalog } from '@/hooks/useRecipeCatalog';
import styles from './TagsPage.module.css';

export function TagsPage() {
  const { tag } = useParams<{ tag?: string }>();
  const decodedTag = tag ? decodeURIComponent(tag) : undefined;
  const { recipes, loading } = useRecipeCatalog();
  const allTags = useAllTags();

  const tagCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const t of allTags) counts.set(t, 0);
    for (const r of recipes) {
      for (const t of r.tags) {
        counts.set(t, (counts.get(t) ?? 0) + 1);
      }
    }
    return [...counts.entries()].sort((a, b) => a[0].localeCompare(b[0]));
  }, [allTags, recipes]);

  const filtered = useMemo(() => {
    if (!decodedTag) return [];
    return recipes
      .filter((r) => r.tags.includes(decodedTag))
      .sort((a, b) => a.title.localeCompare(b.title));
  }, [recipes, decodedTag]);

  if (loading) {
    return <Text variant="muted">Loading…</Text>;
  }

  if (decodedTag) {
    return (
      <Stack gap="lg">
        <Stack gap="sm">
          <Link to="/tags" className={styles.back}>
            ← All tags
          </Link>
          <Text as="h1" variant="title">
            {decodedTag}
          </Text>
          <Text variant="muted">
            {filtered.length} recipe{filtered.length === 1 ? '' : 's'}
          </Text>
        </Stack>
        <ul className={styles.grid}>
          {filtered.map((recipe) => (
            <RecipeCard key={recipe.id} recipe={recipe} />
          ))}
        </ul>
      </Stack>
    );
  }

  return (
    <Stack gap="lg">
      <Text as="h1" variant="title">
        Tags
      </Text>
      <Text variant="muted">Browse recipes by tag</Text>
      <ul className={styles.tagList}>
        {tagCounts.map(([name, count]) => (
          <li key={name}>
            <Link to={`/tags/${encodeURIComponent(name)}`} className={styles.tagLink}>
              <span>{name}</span>
              <span className={styles.count}>{count}</span>
            </Link>
          </li>
        ))}
      </ul>
    </Stack>
  );
}
