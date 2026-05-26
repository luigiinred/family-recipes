export function confirmHideRecipe(title: string): boolean {
  return window.confirm(
    `Hide "${title}" from your recipe lists?\n\nYou can restore it from Settings until you export JSON for Cursor to delete it from the catalog.`,
  );
}
