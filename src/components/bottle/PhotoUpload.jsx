import { useEffect, useMemo } from 'react'
import { Camera } from 'lucide-react'
import styles from './PhotoUpload.module.css'
import Button from '../ui/Button'

export default function PhotoUpload({ file, existingUrl, onFileChange }) {
  const previewUrl = useMemo(() => {
    if (file) return URL.createObjectURL(file)
    return existingUrl || null
  }, [file, existingUrl])

  useEffect(() => {
    return () => {
      if (file && previewUrl?.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl)
      }
    }
  }, [file, previewUrl])

  const handleFileChange = (event) => {
    const selected = event.target.files?.[0]
    onFileChange(selected || null)
  }

  const clearFile = () => {
    onFileChange(null)
  }

  return (
    <div className={styles.wrapper}>
      <label className={styles.dropzone}>
        <input type="file" accept="image/*" onChange={handleFileChange} />
        {previewUrl ? (
          <img className={styles.preview} src={previewUrl} alt="Bottle preview" />
        ) : (
          <div className={styles.placeholder}>
            <Camera size={32} />
            <p>Drop a photo here or click to upload</p>
            <span>JPG, PNG, WEBP up to 10MB</span>
          </div>
        )}
      </label>
      {previewUrl && (
        <Button variant="secondary" onClick={clearFile} type="button">
          Remove
        </Button>
      )}
    </div>
  )
}
