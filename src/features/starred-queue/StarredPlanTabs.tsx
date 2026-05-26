import styles from './StarredPlan.module.css';

export type StarredPlanTab = 'queue' | 'ingredients';

type StarredPlanTabsProps = {
  activeTab: StarredPlanTab;
  onSelectTab: (tab: StarredPlanTab) => void;
};

const TABS: { id: StarredPlanTab; label: string }[] = [
  { id: 'queue', label: 'Queue' },
  { id: 'ingredients', label: 'Ingredients' },
];

export function StarredPlanTabs({ activeTab, onSelectTab }: StarredPlanTabsProps) {
  return (
    <div className={styles.tabs} role="tablist" aria-label="Starred plan">
      {TABS.map((tab) => (
        <button
          key={tab.id}
          type="button"
          role="tab"
          aria-selected={activeTab === tab.id}
          className={[styles.tab, activeTab === tab.id ? styles.tabSelected : '']
            .filter(Boolean)
            .join(' ')}
          onClick={() => onSelectTab(tab.id)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
