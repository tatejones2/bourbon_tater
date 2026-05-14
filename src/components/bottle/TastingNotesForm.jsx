import ScoreSlider from '../ui/ScoreSlider'
import styles from './TastingNotesForm.module.css'

export default function TastingNotesForm({ values, onChange }) {
  const update = (field, value) => onChange({ ...values, [field]: value })

  return (
    <section className={styles.section}>
      <h3>Tasting Notes</h3>
      <div className={styles.block}>
        <label>
          Overall
          <span>Your overall impressions and verdict</span>
        </label>
        <textarea
          rows="5"
          value={values.overall || ''}
          onChange={(event) => update('overall', event.target.value)}
        />
        <ScoreSlider
          label="Total Score (0–100)"
          value={values.overallScore ?? ''}
          onChange={(value) => update('overallScore', value === '' ? null : value)}
        />
      </div>
    </section>
  )
}
