const PLACEHOLDER = '/images/recipe-placeholder.svg';

export function recipeImageUrl(imageUrl: string | undefined): string {
  return imageUrl?.trim() ? imageUrl.trim() : PLACEHOLDER;
}
