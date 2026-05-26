import type { CSSProperties } from 'react';
import type { SearchCategory } from '@/features/search/searchCategories';
import {
  ALL_RECIPES_TAB_COLOR_VAR,
  getCategoryTabColorVar,
} from './categoryTabColors';
import styles from './HomeCategoryTabs.module.css';

type HomeCategoryTabsProps = {
  categories: SearchCategory[];
  activeCategoryId: string | null;
  onSelectCategory: (id: string | null) => void;
};

type CategoryTabProps = {
  label: string;
  selected: boolean;
  colorVar: string;
  onClick: () => void;
};

function CategoryTab({ label, selected, colorVar, onClick }: CategoryTabProps) {
  const tabStyle = {
    '--tab-accent': `var(${colorVar})`,
  } as CSSProperties;

  return (
    <button
      type="button"
      role="tab"
      aria-selected={selected}
      className={[styles.tab, selected ? styles.tabSelected : ''].filter(Boolean).join(' ')}
      style={tabStyle}
      onClick={onClick}
    >
      {label}
    </button>
  );
}

export function HomeCategoryTabs({
  categories,
  activeCategoryId,
  onSelectCategory,
}: HomeCategoryTabsProps) {
  return (
    <div
      className={styles.root}
      role="tablist"
      aria-label="Recipe categories"
    >
      {categories.map((category) => (
        <CategoryTab
          key={category.id}
          label={category.label}
          selected={activeCategoryId === category.id}
          colorVar={getCategoryTabColorVar(category)}
          onClick={() => onSelectCategory(category.id)}
        />
      ))}
      <CategoryTab
        label="All recipes"
        selected={activeCategoryId === null}
        colorVar={ALL_RECIPES_TAB_COLOR_VAR}
        onClick={() => onSelectCategory(null)}
      />
    </div>
  );
}
