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
        const label = `Step ${index + 1}: ${step.text} at ${timestamp}`;
        return (
          <li key={`${step.startSeconds}-${index}`} className={styles.item}>
            <button
              type="button"
              className={styles.stepButton}
              aria-label={label}
              onClick={() => onSeek(step.startSeconds)}
            >
              <span className={styles.timestamp} aria-hidden="true">
                {timestamp}
              </span>
              <span className={styles.text}>{step.text}</span>
            </button>
          </li>
        );
      })}
    </ol>
  );
}
