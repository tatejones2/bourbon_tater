import { useState } from 'react'
import { deleteDoc, doc } from 'firebase/firestore'
import { deleteObject, ref } from 'firebase/storage'
import { useNavigate, useParams } from 'react-router-dom'
import PageWrapper from '../components/layout/PageWrapper'
import StatusBadge from '../components/bottle/StatusBadge'
import ScoreBar from '../components/bottle/ScoreBar'
import PlaceholderBottle from '../components/ui/PlaceholderBottle'
import Button from '../components/ui/Button'
import Modal from '../components/ui/Modal'
import useBottle from '../hooks/useBottle'
import { db, storage } from '../firebase/firebaseConfig'
import styles from './BottleDetailPage.module.css'

export default function BottleDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { bottle, loading, error } = useBottle(id)
  const [confirmDelete, setConfirmDelete] = useState(false)

  if (loading) {
    return (
      <PageWrapper>
        <p>Loading bottle…</p>
      </PageWrapper>
    )
  }

  if (error || !bottle) {
    return (
      <PageWrapper>
        <p>We couldn't find that bottle.</p>
      </PageWrapper>
    )
  }

  const handleDelete = async () => {
    await deleteDoc(doc(db, 'bottles', id))
    if (bottle.photoURL && storage) {
      const photoRef = ref(storage, `bottles/${id}/photo.jpg`)
      await deleteObject(photoRef)
    }
    navigate('/')
  }

  return (
    <PageWrapper>
      <div className={styles.layout}>
        <div className={styles.left}>
          <div className={styles.photo}>
            {bottle.photoURL ? (
              <img src={bottle.photoURL} alt={bottle.name} />
            ) : (
              <PlaceholderBottle size={180} />
            )}
          </div>
          <div className={styles.badges}>
            <StatusBadge status={bottle.status} />
            {typeof bottle?.tastingNotes?.overallScore === 'number' && (
              <div className={styles.scoreBadge}>{bottle.tastingNotes.overallScore}</div>
            )}
          </div>
          <div className={styles.actions}>
            <Button variant="secondary" onClick={() => navigate(`/bottle/${id}/edit`)}>
              Edit Bottle
            </Button>
            <Button variant="danger" onClick={() => setConfirmDelete(true)}>
              Delete Bottle
            </Button>
          </div>
        </div>
        <div className={styles.right}>
          <section className={styles.section}>
            <h1>{bottle.name}</h1>
            <p className={styles.subtitle}>
              {bottle.distillery} · {bottle.brand}
            </p>
            <div className={styles.metaRow}>
              <span>{bottle.type}</span>
              <span>{bottle.region}</span>
            </div>
            <div className={styles.metaRow}>
              <span>{bottle.age ? `${bottle.age} Year` : 'NAS'}</span>
              <span>{bottle.proof ? `${bottle.proof} Proof` : 'Proof N/A'}</span>
              <span>{bottle.abv ? `${bottle.abv}% ABV` : ''}</span>
            </div>
          </section>

          <section className={styles.section}>
            <h3>Production Details</h3>
            <div className={styles.detailGrid}>
              <div>
                <strong>Mashbill</strong>
                <p>{bottle.mashbill || '—'}</p>
              </div>
              <div>
                <strong>Distillation Style</strong>
                <p>{bottle.distillationStyle || '—'}</p>
              </div>
              <div>
                <strong>Maturation</strong>
                <p>{bottle.maturation || '—'}</p>
              </div>
              <div>
                <strong>Release Year</strong>
                <p>{bottle.releaseYear || '—'}</p>
              </div>
              <div>
                <strong>Limited Release</strong>
                <p>{bottle.limitedRelease ? 'Yes' : 'No'}</p>
              </div>
              <div>
                <strong>MSRP</strong>
                <p>{bottle.msrp ? `$${bottle.msrp}` : '—'}</p>
              </div>
            </div>
            {bottle.description && (
              <blockquote className={styles.description}>{bottle.description}</blockquote>
            )}
          </section>

          <section className={styles.section}>
            <h3>My Collection Info</h3>
            <div className={styles.detailGrid}>
              <div>
                <strong>Purchase Price</strong>
                <p>{bottle.purchasePrice ? `$${bottle.purchasePrice}` : '—'}</p>
              </div>
              <div>
                <strong>Purchase Date</strong>
                <p>{bottle.purchaseDate || '—'}</p>
              </div>
              <div>
                <strong>Purchase Location</strong>
                <p>{bottle.purchaseLocation || '—'}</p>
              </div>
              <div>
                <strong>Bottle Count</strong>
                <p>{bottle.bottleCount || 1}</p>
              </div>
              <div className={styles.full}>
                <strong>Personal Notes</strong>
                <p>{bottle.personalNotes || '—'}</p>
              </div>
            </div>
          </section>

          <section className={styles.section}>
            <h3>Tasting Notes & Score</h3>
            <div className={styles.tastingGrid}>
              <div>
                <h4>Overall</h4>
                <p>{bottle.tastingNotes?.overall || 'Add score'}</p>
                <ScoreBar label="Total Score" score={bottle.tastingNotes?.overallScore} />
              </div>
            </div>
          </section>
        </div>
      </div>

      {confirmDelete && (
        <Modal
          title="Delete this bottle?"
          body={`Are you sure you want to remove ${bottle.name} from your shelf? This cannot be undone.`}
          confirmLabel="Yes, Delete"
          onConfirm={handleDelete}
          onClose={() => setConfirmDelete(false)}
        />
      )}
    </PageWrapper>
  )
}
