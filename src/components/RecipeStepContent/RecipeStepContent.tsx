import { IngredientMention } from '@/components/IngredientMention/IngredientMention';
import { parseRecipeStep } from '@/features/recipe-display/parseRecipeStep';
import { segmentInstructionWithIngredients } from '@/features/recipe-display/stepIngredientLinks';
import type { Ingredient } from '@/static-api/types/recipe';
import styles from './RecipeStepContent.module.css';

type RecipeStepContentProps = {
  text: string;
  ingredients?: Ingredient[];
};

export function RecipeStepContent({ text, ingredients = [] }: RecipeStepContentProps) {
  const { uses, instruction } = parseRecipeStep(text);
  const instructionSegments = segmentInstructionWithIngredients(instruction, ingredients);

  return (
    <div className={styles.root}>
      {uses.length > 0 ? (
        <div className={styles.usesBlock} aria-label="Ingredients for this step">
          <span className={styles.usesLabel}>Uses</span>
          <ul className={styles.usesList}>
            {uses.map((item) => (
              <li key={item} className={styles.useChip}>
                {item}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
      {instruction ? (
        <p className={styles.instruction}>
          {instructionSegments.map((segment, i) =>
            segment.type === 'text' ? (
              <span key={i}>{segment.value}</span>
            ) : (
              <IngredientMention
                key={`${segment.value}-${i}`}
                label={segment.value}
                ingredient={segment.ingredient}
              />
            ),
          )}
        </p>
      ) : null}
    </div>
  );
}
