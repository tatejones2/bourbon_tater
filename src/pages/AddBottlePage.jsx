import { useState } from 'react'
import { addDoc, collection, doc, updateDoc } from 'firebase/firestore'
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage'
import { useNavigate } from 'react-router-dom'
import PageWrapper from '../components/layout/PageWrapper'
import BottleForm from '../components/bottle/BottleForm'
import useOpenAI from '../hooks/useOpenAI'
import { db, storage } from '../firebase/firebaseConfig'

const defaultBottle = {
  name: '',
  distillery: '',
  brand: '',
  type: '',
  age: null,
  proof: null,
  abv: null,
  mashbill: '',
  distillationStyle: '',
  maturation: '',
  region: '',
  msrp: null,
  releaseYear: null,
  limitedRelease: false,
  description: '',
  status: 'sealed',
  purchasePrice: null,
  purchaseDate: '',
  purchaseLocation: '',
  bottleCount: 1,
  personalNotes: '',
  photoURL: null,
  tastingNotes: {
    overall: '',
    overallScore: null,
  },
  aiPopulated: false,
  aiRawResponse: '',
}

export default function AddBottlePage() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState(defaultBottle)
  const [photoFile, setPhotoFile] = useState(null)
  const [aiName, setAiName] = useState('')
  const [aiWarning, setAiWarning] = useState(false)
  const [saving, setSaving] = useState(false)
  const { lookUpBottle, loading, error, rawResponse } = useOpenAI()
  const storageEnabled = !!storage
  const aiEnabled =
    !!import.meta.env.VITE_OPENAI_API_URL ||
    (import.meta.env.DEV && !!import.meta.env.VITE_OPENAI_API_KEY)

  const handleLookup = async () => {
    if (!aiName.trim()) return
    const result = await lookUpBottle(aiName.trim())
    if (!result?.data) return
    const { data, raw } = result

    const populated = {
      ...formData,
      ...data,
      status: formData.status || 'sealed',
      name: data.name || aiName,
      aiPopulated: true,
      aiRawResponse: raw || rawResponse || '',
    }

    setFormData(populated)
    const knownFields = Object.values(data).filter((value) => value !== null && value !== '')
    setAiWarning(knownFields.length <= 5)
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setSaving(true)
    try {
      const now = new Date().toISOString()
      const docRef = await addDoc(collection(db, 'bottles'), {
        ...formData,
        status: formData.status || 'sealed',
        dateAdded: now,
        dateModified: now,
      })

      if (photoFile && storageEnabled) {
        const photoRef = ref(storage, `bottles/${docRef.id}/photo.jpg`)
        await uploadBytes(photoRef, photoFile)
        const url = await getDownloadURL(photoRef)
        await updateDoc(doc(db, 'bottles', docRef.id), { photoURL: url })
      }

      navigate(`/bottle/${docRef.id}`)
    } finally {
      setSaving(false)
    }
  }

  return (
    <PageWrapper>
      <h1>Add a Bottle</h1>
      <BottleForm
        formData={formData}
        setFormData={setFormData}
        onSubmit={handleSubmit}
        onCancel={() => navigate('/')}
        submitLabel="Add to My Shelf"
        showAILookup={aiEnabled}
        aiProps={{
          nameValue: aiName,
          onNameChange: setAiName,
          onLookup: handleLookup,
          loading,
          error,
          warning: aiWarning,
        }}
        photoFile={photoFile}
        onPhotoChange={setPhotoFile}
        onPhotoUrlChange={(url) => setFormData({ ...formData, photoURL: url })}
        isSaving={saving}
        enablePhotoUpload={storageEnabled}
      />
    </PageWrapper>
  )
}
