import { useEffect, useState } from 'react'
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore'
import { db, firebaseConfigError } from '../firebase/firebaseConfig'

export default function useWishlist() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!db) {
      setError(firebaseConfigError || 'Firebase is not configured.')
      setLoading(false)
      return
    }

    const q = query(collection(db, 'wishlist'), orderBy('dateAdded', 'desc'))
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const wishlist = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
        setItems(wishlist)
        setLoading(false)
      },
      (err) => {
        setError(err.message)
        setLoading(false)
      }
    )

    return () => unsubscribe()
  }, [])

  return { items, loading, error }
}
