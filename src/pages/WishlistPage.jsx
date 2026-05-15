import { useMemo, useState } from 'react'
import { addDoc, collection, deleteDoc, doc } from 'firebase/firestore'
import PageWrapper from '../components/layout/PageWrapper'
import Button from '../components/ui/Button'
import useWishlist from '../hooks/useWishlist'
import useOpenAI from '../hooks/useOpenAI'
import { db } from '../firebase/firebaseConfig'
import styles from './WishlistPage.module.css'

export default function WishlistPage() {
  const { items, loading, error } = useWishlist()
  const { suggestWishlist, loading: aiLoading, error: aiError } = useOpenAI()
  const [form, setForm] = useState({
    name: '',
    distillery: '',
    type: '',
    targetPrice: '',
    priority: '3',
    notes: '',
  })
  const [profile, setProfile] = useState('')
  const [suggestions, setSuggestions] = useState([])

  const aiEnabled = !!import.meta.env.VITE_OPENAI_SUGGEST_API_URL

  const sortedItems = useMemo(() => {
    return [...items].sort((a, b) => (b.priority || 0) - (a.priority || 0))
  }, [items])

  const handleAdd = async (event) => {
    event.preventDefault()
    if (!db) return
    if (!form.name.trim()) return

    await addDoc(collection(db, 'wishlist'), {
      name: form.name.trim(),
      distillery: form.distillery.trim(),
      type: form.type.trim(),
      targetPrice: form.targetPrice ? Number(form.targetPrice) : null,
      priority: Number(form.priority || 3),
      notes: form.notes.trim(),
      dateAdded: new Date().toISOString(),
    })

    setForm({
      name: '',
      distillery: '',
      type: '',
      targetPrice: '',
      priority: '3',
      notes: '',
    })
  }

  const handleDelete = async (id) => {
    if (!db) return
    await deleteDoc(doc(db, 'wishlist', id))
  }

  const handleSuggest = async () => {
    const result = await suggestWishlist(profile)
    const list = result?.suggestions || []
    setSuggestions(list)
  }

  const addSuggestion = async (suggestion) => {
    if (!db) return
    await addDoc(collection(db, 'wishlist'), {
      name: suggestion.name,
      distillery: suggestion.distillery || '',
      type: suggestion.type || '',
      targetPrice: suggestion.msrp ?? null,
      priority: 3,
      notes: suggestion.reason || '',
      dateAdded: new Date().toISOString(),
    })
  }

  if (loading) {
    return (
      <PageWrapper>
        <p>Loading wishlist…</p>
      </PageWrapper>
    )
  }

  if (error) {
    return (
      <PageWrapper>
        <p>{error}</p>
      </PageWrapper>
    )
  }

  return (
    <PageWrapper>
      <div className={styles.header}>
        <h1>Wishlist</h1>
        <p>Track bottles you want to hunt down next.</p>
      </div>

      <section className={styles.section}>
        <h3>Add to Wishlist</h3>
        <form className={styles.form} onSubmit={handleAdd}>
          <label>
            Name
            <input
              type="text"
              value={form.name}
              onChange={(event) => setForm({ ...form, name: event.target.value })}
              required
            />
          </label>
          <label>
            Distillery
            <input
              type="text"
              value={form.distillery}
              onChange={(event) => setForm({ ...form, distillery: event.target.value })}
            />
          </label>
          <label>
            Type
            <input
              type="text"
              value={form.type}
              onChange={(event) => setForm({ ...form, type: event.target.value })}
            />
          </label>
          <label>
            Target Price
            <input
              type="number"
              value={form.targetPrice}
              onChange={(event) => setForm({ ...form, targetPrice: event.target.value })}
            />
          </label>
          <label>
            Priority (1-5)
            <select
              value={form.priority}
              onChange={(event) => setForm({ ...form, priority: event.target.value })}
            >
              <option value="1">1 - Low</option>
              <option value="2">2</option>
              <option value="3">3 - Medium</option>
              <option value="4">4</option>
              <option value="5">5 - High</option>
            </select>
          </label>
          <label className={styles.full}>
            Notes
            <textarea
              rows="3"
              value={form.notes}
              onChange={(event) => setForm({ ...form, notes: event.target.value })}
            />
          </label>
          <Button type="submit">Add Wishlist Item</Button>
        </form>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h3>Your Wishlist</h3>
          <span>{items.length} bottles</span>
        </div>
        {sortedItems.length ? (
          <div className={styles.grid}>
            {sortedItems.map((item) => (
              <div key={item.id} className={styles.card}>
                <div className={styles.cardHeader}>
                  <h4>{item.name}</h4>
                  <span className={styles.priority}>Priority {item.priority || 3}</span>
                </div>
                <p className={styles.meta}>
                  {item.distillery || 'Unknown distillery'} · {item.type || 'Type N/A'}
                </p>
                <p className={styles.notes}>{item.notes || 'No notes yet.'}</p>
                <div className={styles.cardFooter}>
                  <span>{item.targetPrice ? `$${item.targetPrice}` : 'No target price'}</span>
                  <Button variant="secondary" type="button" onClick={() => handleDelete(item.id)}>
                    Remove
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className={styles.empty}>No wishlist items yet.</p>
        )}
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h3>AI Suggestions</h3>
          {aiEnabled && (
            <Button type="button" onClick={handleSuggest} disabled={aiLoading}>
              {aiLoading ? 'Generating…' : 'Suggest Bottles'}
            </Button>
          )}
        </div>
        {!aiEnabled && <p className={styles.notice}>Add the suggestion API URL to enable AI.</p>}
        {aiError && <p className={styles.error}>We couldn’t fetch suggestions right now.</p>}
        {suggestions.length > 0 && (
          <div className={styles.suggestions}>
            {suggestions.map((suggestion) => (
              <div key={suggestion.name} className={styles.suggestionCard}>
                <div>
                  <h4>{suggestion.name}</h4>
                  <p className={styles.meta}>
                    {suggestion.distillery || 'Unknown distillery'} · {suggestion.type || 'Type N/A'}
                  </p>
                  <p className={styles.notes}>{suggestion.reason || 'Suggested pick.'}</p>
                </div>
                <div className={styles.cardFooter}>
                  <span>{suggestion.msrp ? `$${suggestion.msrp}` : 'MSRP unknown'}</span>
                  <Button type="button" onClick={() => addSuggestion(suggestion)}>
                    Add
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </PageWrapper>
  )
}
