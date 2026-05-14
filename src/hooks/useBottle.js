import { useEffect, useState } from 'react'
import { doc, onSnapshot } from 'firebase/firestore'
import { db, firebaseConfigError } from '../firebase/firebaseConfig'

export default function useBottle(id) {
  const [bottle, setBottle] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!db) {
      setError(firebaseConfigError || 'Firebase is not configured.')
      setLoading(false)
      return
    }
    if (!id) return
    const ref = doc(db, 'bottles', id)
    const unsubscribe = onSnapshot(
      ref,
      (snapshot) => {
        if (!snapshot.exists()) {
          setBottle(null)
        } else {
          setBottle({ id: snapshot.id, ...snapshot.data() })
        }
        setLoading(false)
      },
      (err) => {
        setError(err.message)
        setLoading(false)
      }
    )
    return () => unsubscribe()
  }, [id])

  return { bottle, loading, error }
}
