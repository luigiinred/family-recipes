import { THEME_IDS, THEME_LABELS, type ThemeId } from '@/design-system/theme/types';
import { useTheme } from '@/hooks/useTheme';
import { Text } from '@/design-system/primitives';
import styles from './ThemeSettings.module.css';

const THEME_DESCRIPTIONS: Record<ThemeId, string> = {
  light: 'Warm cookbook palette with serif accents.',
  dark: 'Dimmed surfaces for low-light browsing.',
  classic:
    'Easter egg: the original Garrabrant family recipe page — tiled background, maroon links, and thumbnail grid.',
};

export function ThemeSettings() {
  const { theme, setTheme } = useTheme();

  return (
    <fieldset className={styles.fieldset}>
      <legend className={styles.legend}>Appearance</legend>
      <div className={styles.options} role="radiogroup" aria-label="Color theme">
        {THEME_IDS.map((id) => (
          <label key={id} className={styles.option}>
            <input
              type="radio"
              name="theme"
              value={id}
              checked={theme === id}
              onChange={() => setTheme(id)}
            />
            <span className={styles.optionBody}>
              <Text as="span" variant="subtitle" className={styles.optionTitle}>
                {THEME_LABELS[id]}
              </Text>
              <Text as="span" variant="muted" className={styles.optionDesc}>
                {THEME_DESCRIPTIONS[id]}
              </Text>
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
