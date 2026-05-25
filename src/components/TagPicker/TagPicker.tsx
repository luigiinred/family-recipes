import { Link } from 'react-router-dom';
import { Badge, Stack } from '@/design-system/primitives';
import styles from './TagPicker.module.css';

type TagPickerProps = {
  tags: string[];
  activeTag?: string;
  onSelect?: (tag: string) => void;
};

export function TagPicker({ tags, activeTag, onSelect }: TagPickerProps) {
  return (
    <Stack direction="row" gap="sm" className={styles.picker}>
      <Link
        to="/tags"
        className={[styles.chip, !activeTag ? styles.active : ''].filter(Boolean).join(' ')}
      >
        All tags
      </Link>
      {tags.slice(0, 12).map((tag) =>
        onSelect ? (
          <button
            key={tag}
            type="button"
            className={[styles.chip, activeTag === tag ? styles.active : ''].join(' ')}
            onClick={() => onSelect(tag)}
          >
            {tag}
          </button>
        ) : (
          <Link
            key={tag}
            to={`/tags/${encodeURIComponent(tag)}`}
            className={[styles.chip, activeTag === tag ? styles.active : ''].join(' ')}
          >
            <Badge>{tag}</Badge>
          </Link>
        ),
      )}
    </Stack>
  );
}
