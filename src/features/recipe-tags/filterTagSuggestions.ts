/** Catalog tags matching query, excluding tags already on the recipe. */
export function filterTagSuggestions(
  allTags: string[],
  query: string,
  exclude: string[],
): string[] {
  const excluded = new Set(exclude);
  const needle = query.trim().toLowerCase();
  return allTags
    .filter((tag) => !excluded.has(tag))
    .filter((tag) => !needle || tag.includes(needle))
    .sort((a, b) => a.localeCompare(b))
    .slice(0, 8);
}
