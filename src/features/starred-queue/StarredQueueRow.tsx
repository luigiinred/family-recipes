import { Link } from 'react-router-dom';
import { RecipeStarButton } from '@/components/RecipeStarButton/RecipeStarButton';
import { Image, Text } from '@/design-system/primitives';
import { recipeImageUrl } from '@/lib/recipeImageUrl';
import type { Recipe } from '@/static-api/types/recipe';
import { allowQueueDrop, readQueueDrag, writeQueueDrag } from './queueDrag';
import styles from './StarredQueue.module.css';

type StarredQueueRowProps = {
  recipe: Recipe;
  index: number;
  onMove: (fromIndex: number, toIndex: number) => void;
  onUnstar: (slug: string) => void;
};

export function StarredQueueRow({ recipe, index, onMove, onUnstar }: StarredQueueRowProps) {
  function handleDragStart(event: React.DragEvent<HTMLLIElement>) {
    writeQueueDrag(event.nativeEvent, { slug: recipe.slug, fromIndex: index });
  }

  function handleDragOver(event: React.DragEvent<HTMLLIElement>) {
    allowQueueDrop(event.nativeEvent);
  }

  function handleDrop(event: React.DragEvent<HTMLLIElement>) {
    event.preventDefault();
    const payload = readQueueDrag(event.nativeEvent);
    if (!payload) return;
    onMove(payload.fromIndex, index);
  }

  return (
    <li
      className={styles.row}
      draggable
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <span className={styles.dragHandle} aria-hidden>
        ⋮⋮
      </span>
      <div className={styles.rowMedia}>
        <Image
          src={recipeImageUrl(recipe.imageUrl)}
          alt={recipe.title}
          className={styles.rowImage}
        />
      </div>
      <div className={styles.rowBody}>
        <Text variant="label" className={styles.rowTitle}>
          {recipe.title}
        </Text>
        <div className={styles.rowActions}>
          <Link to={`/recipes/${recipe.slug}`} className={styles.rowLink}>
            View recipe
          </Link>
          <RecipeStarButton
            title={recipe.title}
            starred
            onToggle={() => onUnstar(recipe.slug)}
            className={styles.rowStar}
          />
        </div>
      </div>
    </li>
  );
}
