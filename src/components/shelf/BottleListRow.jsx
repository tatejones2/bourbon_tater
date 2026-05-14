import { Link } from 'react-router-dom'
import { Pencil, Trash2 } from 'lucide-react'
import styles from './BottleListRow.module.css'
import StatusBadge from '../bottle/StatusBadge'
import PlaceholderBottle from '../ui/PlaceholderBottle'

export default function BottleListRow({ bottle, onDelete }) {
  const overallScore = bottle?.tastingNotes?.overallScore
  return (
    <div className={styles.row}>
      <div className={styles.cell}>
        <Link to={`/bottle/${bottle.id}`} className={styles.photo}>
          {bottle.photoURL ? (
            <img src={bottle.photoURL} alt={bottle.name} />
          ) : (
            <PlaceholderBottle size={40} />
          )}
        </Link>
      </div>
      <div className={styles.cell}>
        <Link to={`/bottle/${bottle.id}`} className={styles.name}>
          {bottle.name}
        </Link>
      </div>
      <div className={styles.cell}>{bottle.distillery || '—'}</div>
      <div className={styles.cell}>{bottle.age ? `${bottle.age} Year` : 'NAS'}</div>
      <div className={styles.cell}>{bottle.proof ? `${bottle.proof}` : '—'}</div>
      <div className={styles.cell}>
        <StatusBadge status={bottle.status} />
      </div>
      <div className={styles.cell}>{typeof overallScore === 'number' ? overallScore : '—'}</div>
      <div className={styles.cell}>{bottle.dateAdded?.slice(0, 10) || '—'}</div>
      <div className={styles.actions}>
        <Link to={`/bottle/${bottle.id}/edit`} className={styles.iconButton}>
          <Pencil size={16} />
        </Link>
        <button className={styles.iconButton} type="button" onClick={() => onDelete(bottle)}>
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  )
}
