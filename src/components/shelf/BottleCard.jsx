import { Link } from 'react-router-dom'
import styles from './BottleCard.module.css'
import StatusBadge from '../bottle/StatusBadge'
import PlaceholderBottle from '../ui/PlaceholderBottle'

export default function BottleCard({ bottle }) {
  const overallScore = bottle?.tastingNotes?.overallScore
  return (
    <Link to={`/bottle/${bottle.id}`} className={styles.card}>
      <div className={styles.photo}>
        {bottle.photoURL ? (
          <img src={bottle.photoURL} alt={bottle.name} />
        ) : (
          <PlaceholderBottle className={styles.placeholder} size={80} />
        )}
        {typeof overallScore === 'number' && (
          <div className={styles.score}>{overallScore}</div>
        )}
      </div>
      <div className={styles.body}>
        <h3>{bottle.name}</h3>
        <p className={styles.distillery}>{bottle.distillery || 'Unknown distillery'}</p>
        <div className={styles.meta}>
          <span>{bottle.age ? `${bottle.age} Year` : 'NAS'}</span>
          <span>{bottle.proof ? `${bottle.proof} Proof` : 'Proof N/A'}</span>
        </div>
        <StatusBadge status={bottle.status} />
      </div>
    </Link>
  )
}
