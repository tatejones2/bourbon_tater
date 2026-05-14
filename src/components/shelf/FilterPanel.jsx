import styles from './FilterPanel.module.css'

export default function FilterPanel({
  statusFilters,
  onStatusChange,
  ageRange,
  onAgeChange,
  proofRange,
  onProofChange,
  distilleryOptions,
  selectedDistilleries,
  onDistilleriesChange,
  limitedOnly,
  onLimitedChange,
}) {
  const toggleStatus = (status) => {
    onStatusChange({ ...statusFilters, [status]: !statusFilters[status] })
  }

  const handleDistilleryChange = (event) => {
    const values = Array.from(event.target.selectedOptions).map((opt) => opt.value)
    onDistilleriesChange(values)
  }

  return (
    <div className={styles.panel}>
      <div className={styles.group}>
        <span>Status</span>
        <label>
          <input type="checkbox" checked={statusFilters.sealed} onChange={() => toggleStatus('sealed')} />
          Sealed
        </label>
        <label>
          <input type="checkbox" checked={statusFilters.open} onChange={() => toggleStatus('open')} />
          Open
        </label>
        <label>
          <input type="checkbox" checked={statusFilters.empty} onChange={() => toggleStatus('empty')} />
          Empty
        </label>
      </div>

      <div className={styles.group}>
        <span>Age Range</span>
        <div className={styles.rangeRow}>
          <input
            type="number"
            value={ageRange.min}
            onChange={(event) => onAgeChange({ ...ageRange, min: Number(event.target.value) })}
          />
          <span>to</span>
          <input
            type="number"
            value={ageRange.max}
            onChange={(event) => onAgeChange({ ...ageRange, max: Number(event.target.value) })}
          />
        </div>
      </div>

      <div className={styles.group}>
        <span>Proof Range</span>
        <div className={styles.rangeRow}>
          <input
            type="number"
            value={proofRange.min}
            onChange={(event) => onProofChange({ ...proofRange, min: Number(event.target.value) })}
          />
          <span>to</span>
          <input
            type="number"
            value={proofRange.max}
            onChange={(event) => onProofChange({ ...proofRange, max: Number(event.target.value) })}
          />
        </div>
      </div>

      <div className={styles.group}>
        <span>Distilleries</span>
        <select multiple value={selectedDistilleries} onChange={handleDistilleryChange}>
          {distilleryOptions.map((distillery) => (
            <option key={distillery} value={distillery}>
              {distillery}
            </option>
          ))}
        </select>
      </div>

      <div className={styles.group}>
        <label className={styles.toggle}>
          <input type="checkbox" checked={limitedOnly} onChange={(event) => onLimitedChange(event.target.checked)} />
          Show limited releases only
        </label>
      </div>
    </div>
  )
}
