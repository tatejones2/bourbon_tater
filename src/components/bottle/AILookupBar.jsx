import styles from './AILookupBar.module.css'
import Button from '../ui/Button'
import LoadingSpinner from '../ui/LoadingSpinner'

export default function AILookupBar({ value, onChange, onLookup, loading, error, warning }) {
  return (
    <div className={styles.wrapper}>
      <label className={styles.label}>
        Bottle Name
        <input
          className={styles.input}
          type="text"
          placeholder="e.g. Pappy Van Winkle 15 Year Family Reserve"
          value={value}
          onChange={(event) => onChange(event.target.value)}
        />
      </label>
      <div className={styles.actions}>
        <Button onClick={onLookup} type="button">
          Look Up Bottle
        </Button>
        {loading && <LoadingSpinner label="Consulting the bourbon oracle…" />}
      </div>
      {error && <p className={styles.error}>We couldn't look up that bottle right now. You can fill in the details manually.</p>}
      {warning && <p className={styles.warning}>We found limited information for this bottle. Please review and complete the details below.</p>}
    </div>
  )
}
