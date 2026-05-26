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
            <div className={styles.stepBody}>
              <p className={styles.text}>{step.text}</p>
              <button
                type="button"
                className={styles.watchButton}
                aria-label={`Play video at ${timestamp}`}
                onClick={() => onSeek(step.startSeconds)}
              >
                Watch at {timestamp}
              </button>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
