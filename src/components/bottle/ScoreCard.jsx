import styles from './ScoreCard.module.css'

const slots = [
  { key: 'noseScore', label: 'Nose' },
  { key: 'palateScore', label: 'Palate' },
  { key: 'finishScore', label: 'Finish' },
  { key: 'overallScore', label: 'Overall' },
]

export default function ScoreCard({ tastingNotes }) {
  return (
    <div className={styles.card}>
      {slots.map(({ key, label }) => {
        const score = tastingNotes?.[key]
        return (
          <div key={key} className={styles.slot}>
            <div className={styles.badge}>{typeof score === 'number' ? score : '—'}</div>
            <span>{label}</span>
          </div>
        )
      })}
    </div>
  )
}
