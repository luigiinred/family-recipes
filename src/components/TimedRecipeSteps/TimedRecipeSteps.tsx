import { RecipeStepContent } from '@/components/RecipeStepContent/RecipeStepContent';
import { formatVideoTimestamp } from '@/lib/youtube/formatVideoTimestamp';
import type { TimedStep } from '@/static-api/types/recipe';
import styles from './TimedRecipeSteps.module.css';

type TimedRecipeStepsProps = {
  steps: TimedStep[];
  onSeek: (startSeconds: number) => void;
};

export function TimedRecipeSteps({ steps, onSeek }: TimedRecipeStepsProps) {
  return (
    <ol className={styles.list}>
      {steps.map((step, index) => {
        const timestamp = formatVideoTimestamp(step.startSeconds);
        return (
          <li key={`${step.startSeconds}-${index}`} className={styles.item}>
            <span className={styles.stepNumber} aria-hidden="true">
              {index + 1}
            </span>
            <button
              type="button"
              className={styles.stepSeek}
              aria-label={`Play video at ${timestamp}: ${step.text}`}
              onClick={() => onSeek(step.startSeconds)}
            >
              <RecipeStepContent text={step.text} />
              <span className={styles.watchAt}>Watch at {timestamp}</span>
            </button>
          </li>
        );
      })}
    </ol>
  );
}
