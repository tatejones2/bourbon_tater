import styles from './ShelfToolbar.module.css'
import Button from '../ui/Button'

const SORT_OPTIONS = [
  { value: 'dateDesc', label: 'Date Added (Newest First)' },
  { value: 'dateAsc', label: 'Date Added (Oldest First)' },
  { value: 'nameAsc', label: 'Name (A → Z)' },
  { value: 'nameDesc', label: 'Name (Z → A)' },
  { value: 'distilleryAsc', label: 'Distillery (A → Z)' },
  { value: 'ageAsc', label: 'Age (Youngest First)' },
  { value: 'ageDesc', label: 'Age (Oldest First)' },
  { value: 'proofAsc', label: 'Proof (Lowest First)' },
  { value: 'proofDesc', label: 'Proof (Highest First)' },
  { value: 'scoreDesc', label: 'Overall Score (Highest First)' },
  { value: 'priceDesc', label: 'Purchase Price (Highest First)' },
  { value: 'priceAsc', label: 'Purchase Price (Lowest First)' },
]

export default function ShelfToolbar({
  view,
  onViewChange,
  sortBy,
  onSortChange,
  search,
  onSearchChange,
  onToggleFilters,
  showFilters,
}) {
  return (
    <div className={styles.toolbar}>
      <div className={styles.left}>
        <label>
          Sort by:
          <select value={sortBy} onChange={(event) => onSortChange(event.target.value)}>
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <label>
          Search
          <input
            type="text"
            placeholder="Search by name or distillery"
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
          />
        </label>
      </div>
      <div className={styles.right}>
        <div className={styles.viewToggle}>
          <button
            type="button"
            className={view === 'grid' ? styles.active : ''}
            onClick={() => onViewChange('grid')}
          >
            Grid
          </button>
          <button
            type="button"
            className={view === 'list' ? styles.active : ''}
            onClick={() => onViewChange('list')}
          >
            List
          </button>
        </div>
        <Button variant="secondary" type="button" onClick={onToggleFilters}>
          {showFilters ? 'Hide Filters' : 'Filters'}
        </Button>
      </div>
    </div>
  )
}
