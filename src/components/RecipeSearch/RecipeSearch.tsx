import styles from './RecipeSearch.module.css';

type RecipeSearchProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
};

export function RecipeSearch({
  value,
  onChange,
  placeholder = 'Search recipes…',
}: RecipeSearchProps) {
  return (
    <input
      type="search"
      className={styles.input}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      aria-label="Search recipes"
    />
  );
}
