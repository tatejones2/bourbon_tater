import styles from './BottleForm.module.css'
import Button from '../ui/Button'
import PhotoUpload from './PhotoUpload'
import TastingNotesForm from './TastingNotesForm'
import AILookupBar from './AILookupBar'

const STATUS_OPTIONS = [
  { value: 'sealed', label: 'Sealed' },
  { value: 'open', label: 'Open' },
  { value: 'empty', label: 'Empty' },
]

export default function BottleForm({
  formData,
  setFormData,
  onSubmit,
  onCancel,
  showAILookup = false,
  aiProps = {},
  photoFile,
  onPhotoChange,
  isSaving = false,
  submitLabel = 'Save Bottle',
}) {
  const updateField = (field, value) => setFormData({ ...formData, [field]: value })
  const tastingDefaults = {
    overall: '',
    overallScore: null,
  }

  const tastingNotes = { ...tastingDefaults, ...(formData.tastingNotes || {}) }
  const updateTasting = (values) => setFormData({ ...formData, tastingNotes: values })

  return (
    <form className={styles.form} onSubmit={onSubmit}>
      {showAILookup && (
        <AILookupBar
          value={aiProps.nameValue}
          onChange={aiProps.onNameChange}
          onLookup={aiProps.onLookup}
          loading={aiProps.loading}
          error={aiProps.error}
          warning={aiProps.warning}
        />
      )}

      <section className={styles.section}>
        <h3>Bottle Details</h3>
        <div className={styles.grid}>
          <label>
            Name
            <input
              type="text"
              value={formData.name || ''}
              onChange={(event) => updateField('name', event.target.value)}
              required
            />
          </label>
          <label>
            Distillery
            <input
              type="text"
              value={formData.distillery || ''}
              onChange={(event) => updateField('distillery', event.target.value)}
            />
          </label>
          <label>
            Brand
            <input
              type="text"
              value={formData.brand || ''}
              onChange={(event) => updateField('brand', event.target.value)}
            />
          </label>
          <label>
            Type
            <input
              type="text"
              value={formData.type || ''}
              onChange={(event) => updateField('type', event.target.value)}
            />
          </label>
          <label>
            Age Statement (years)
            <input
              type="number"
              value={formData.age ?? ''}
              onChange={(event) => updateField('age', event.target.value === '' ? null : Number(event.target.value))}
            />
          </label>
          <label>
            Proof
            <input
              type="number"
              value={formData.proof ?? ''}
              onChange={(event) => updateField('proof', event.target.value === '' ? null : Number(event.target.value))}
            />
          </label>
          <label>
            ABV
            <input
              type="number"
              step="0.1"
              value={formData.abv ?? ''}
              onChange={(event) => updateField('abv', event.target.value === '' ? null : Number(event.target.value))}
            />
          </label>
          <label>
            Mashbill
            <input
              type="text"
              value={formData.mashbill || ''}
              onChange={(event) => updateField('mashbill', event.target.value)}
            />
          </label>
          <label>
            Distillation Style
            <input
              type="text"
              value={formData.distillationStyle || ''}
              onChange={(event) => updateField('distillationStyle', event.target.value)}
            />
          </label>
          <label>
            Maturation
            <input
              type="text"
              value={formData.maturation || ''}
              onChange={(event) => updateField('maturation', event.target.value)}
            />
          </label>
          <label>
            Region
            <input
              type="text"
              value={formData.region || ''}
              onChange={(event) => updateField('region', event.target.value)}
            />
          </label>
          <label>
            MSRP (USD)
            <input
              type="number"
              value={formData.msrp ?? ''}
              onChange={(event) => updateField('msrp', event.target.value === '' ? null : Number(event.target.value))}
            />
          </label>
          <label>
            Release Year
            <input
              type="number"
              value={formData.releaseYear ?? ''}
              onChange={(event) => updateField('releaseYear', event.target.value === '' ? null : Number(event.target.value))}
            />
          </label>
          <label className={styles.checkboxRow}>
            <input
              type="checkbox"
              checked={!!formData.limitedRelease}
              onChange={(event) => updateField('limitedRelease', event.target.checked)}
            />
            Limited Release
          </label>
          <label className={styles.full}>
            Description
            <textarea
              rows="4"
              value={formData.description || ''}
              onChange={(event) => updateField('description', event.target.value)}
            />
          </label>
        </div>
      </section>

      <section className={styles.section}>
        <h3>My Collection Info</h3>
        <div className={styles.grid}>
          <div className={styles.statusGroup}>
            <span>Status</span>
            <div className={styles.segmented}>
              {STATUS_OPTIONS.map((option) => (
                <button
                  type="button"
                  key={option.value}
                  className={formData.status === option.value ? styles.segmentActive : ''}
                  onClick={() => updateField('status', option.value)}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
          <label>
            Purchase Price (USD)
            <input
              type="number"
              value={formData.purchasePrice ?? ''}
              onChange={(event) => updateField('purchasePrice', event.target.value === '' ? null : Number(event.target.value))}
            />
          </label>
          <label>
            Purchase Date
            <input
              type="date"
              value={formData.purchaseDate || ''}
              onChange={(event) => updateField('purchaseDate', event.target.value)}
            />
          </label>
          <label>
            Purchase Location
            <input
              type="text"
              value={formData.purchaseLocation || ''}
              onChange={(event) => updateField('purchaseLocation', event.target.value)}
            />
          </label>
          <label>
            Bottle Count
            <input
              type="number"
              value={formData.bottleCount ?? 1}
              onChange={(event) => updateField('bottleCount', event.target.value === '' ? 1 : Number(event.target.value))}
            />
          </label>
          <label className={styles.full}>
            Personal Notes / Provenance
            <textarea
              rows="4"
              value={formData.personalNotes || ''}
              onChange={(event) => updateField('personalNotes', event.target.value)}
            />
          </label>
        </div>
      </section>

      <section className={styles.section}>
        <h3>Photo Upload</h3>
        <PhotoUpload file={photoFile} existingUrl={formData.photoURL} onFileChange={onPhotoChange} />
      </section>

      <TastingNotesForm values={tastingNotes} onChange={updateTasting} />

      <div className={styles.actions}>
        <Button variant="secondary" type="button" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSaving}>
          {isSaving ? 'Saving…' : submitLabel}
        </Button>
      </div>
    </form>
  )
}
