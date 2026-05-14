import { useEffect, useState } from 'react'
import { doc, updateDoc } from 'firebase/firestore'
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage'
import { useNavigate, useParams } from 'react-router-dom'
import PageWrapper from '../components/layout/PageWrapper'
import BottleForm from '../components/bottle/BottleForm'
import useBottle from '../hooks/useBottle'
import { db, storage } from '../firebase/firebaseConfig'

export default function EditBottlePage() {
  const navigate = useNavigate()
  const { id } = useParams()
  const { bottle, loading } = useBottle(id)
  const [formData, setFormData] = useState(null)
  const [photoFile, setPhotoFile] = useState(null)
  const [saving, setSaving] = useState(false)
  const storageEnabled = !!storage

  useEffect(() => {
    if (bottle) {
      setFormData(bottle)
    }
  }, [bottle])

  if (loading || !formData) {
    return (
      <PageWrapper>
        <p>Loading bottle…</p>
      </PageWrapper>
    )
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setSaving(true)
    try {
      const update = {
        ...formData,
        status: formData.status || 'sealed',
        dateModified: new Date().toISOString(),
      }
      await updateDoc(doc(db, 'bottles', id), update)

      if (photoFile && storageEnabled) {
        const photoRef = ref(storage, `bottles/${id}/photo.jpg`)
        await uploadBytes(photoRef, photoFile)
        const url = await getDownloadURL(photoRef)
        await updateDoc(doc(db, 'bottles', id), { photoURL: url })
      }

      navigate(`/bottle/${id}`)
    } finally {
      setSaving(false)
    }
  }

  return (
    <PageWrapper>
      <h1>Edit Bottle</h1>
      <BottleForm
        formData={formData}
        setFormData={setFormData}
        onSubmit={handleSubmit}
        onCancel={() => navigate(`/bottle/${id}`)}
        submitLabel="Save Changes"
        photoFile={photoFile}
        onPhotoChange={setPhotoFile}
        isSaving={saving}
        enablePhotoUpload={storageEnabled}
      />
    </PageWrapper>
  )
}
