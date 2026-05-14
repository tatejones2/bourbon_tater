import styles from './StatusBadge.module.css'

const STATUS_MAP = {
  sealed: { label: 'Sealed', className: styles.sealed },
  open: { label: 'Open', className: styles.open },
  empty: { label: 'Empty', className: styles.empty },
}

export default function StatusBadge({ status = 'sealed' }) {
  const { label, className } = STATUS_MAP[status] || STATUS_MAP.sealed
  return <span className={`${styles.badge} ${className}`}>{label}</span>
}
