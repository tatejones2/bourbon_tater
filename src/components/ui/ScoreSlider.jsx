import styles from './ScoreSlider.module.css'

export default function ScoreSlider({ label, value, onChange, hint }) {
  return (
    <div className={styles.wrapper}>
      <label className={styles.label}>
        {label}
        {hint && <span className={styles.hint}>{hint}</span>}
      </label>
      <div className={styles.controls}>
        <input
          className={styles.number}
          type="number"
          min="0"
          max="100"
          step="1"
          value={value ?? ''}
          onChange={(event) => onChange(event.target.value === '' ? '' : Number(event.target.value))}
        />
        <input
          className={styles.range}
          type="range"
          min="0"
          max="100"
          step="1"
          value={value ?? 0}
          onChange={(event) => onChange(Number(event.target.value))}
        />
        <span className={styles.scoreText}>{value ?? '—'}/100</span>
      </div>
    </div>
  )
}
