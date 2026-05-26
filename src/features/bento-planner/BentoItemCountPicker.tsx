import { Button, Stack, Text } from '@/design-system/primitives';
import {
  BENTO_ITEM_COUNT_MAX,
  BENTO_ITEM_COUNT_MIN,
} from './bentoPlannerStorage';
import styles from './BentoItemCountPicker.module.css';

type BentoItemCountPickerProps = {
  count: number;
  onChange: (count: number) => void;
};

export function BentoItemCountPicker({ count, onChange }: BentoItemCountPickerProps) {
  const options = Array.from(
    { length: BENTO_ITEM_COUNT_MAX - BENTO_ITEM_COUNT_MIN + 1 },
    (_, i) => BENTO_ITEM_COUNT_MIN + i,
  );

  return (
    <Stack gap="sm" className={styles.root}>
      <Text as="h2" variant="subtitle">
        How many items in the box?
      </Text>
      <div className={styles.options} role="group" aria-label="Number of bento items">
        {options.map((value) => (
          <Button
            key={value}
            variant={value === count ? 'primary' : 'ghost'}
            aria-pressed={value === count}
            onClick={() => onChange(value)}
          >
            {value}
          </Button>
        ))}
      </div>
    </Stack>
  );
}
