import styles from './LoadingSpinner.module.css'

export default function LoadingSpinner({ label = 'Loading…' }) {
  return (
    <div className={styles.wrapper}>
      <span className={styles.spinner} />
      <span className={styles.label}>{label}</span>
    </div>
  )
}
