import styles from './Modal.module.css'
import Button from './Button'

export default function Modal({ title, body, confirmLabel, onConfirm, onClose }) {
  return (
    <div className={styles.backdrop} role="dialog" aria-modal="true">
      <div className={styles.modal}>
        <h3>{title}</h3>
        <p>{body}</p>
        <div className={styles.actions}>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="danger" onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  )
}
