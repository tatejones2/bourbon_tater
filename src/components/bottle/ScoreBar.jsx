import styles from './ScoreBar.module.css'

export default function ScoreBar({ label, score }) {
  const value = typeof score === 'number' ? score : null
  return (
    <div className={styles.wrapper}>
      <div className={styles.labelRow}>
        <span>{label}</span>
        <span className={styles.score}>{value ?? '—'}/100</span>
      </div>
      <div className={styles.track}>
        <div className={styles.fill} style={{ width: `${value ?? 0}%` }} />
      </div>
    </div>
  )
}
