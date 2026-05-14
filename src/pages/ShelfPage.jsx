import { useEffect, useMemo, useState } from 'react'
import { collection, deleteDoc, doc } from 'firebase/firestore'
import { deleteObject, ref } from 'firebase/storage'
import PageWrapper from '../components/layout/PageWrapper'
import ShelfToolbar from '../components/shelf/ShelfToolbar'
import FilterPanel from '../components/shelf/FilterPanel'
import BottleCard from '../components/shelf/BottleCard'
import BottleListRow from '../components/shelf/BottleListRow'
import EmptyShelf from '../components/shelf/EmptyShelf'
import Modal from '../components/ui/Modal'
import useCollection from '../hooks/useCollection'
import { db, storage } from '../firebase/firebaseConfig'
import styles from './ShelfPage.module.css'

const DEFAULT_STATUS = { sealed: true, open: true, empty: true }

export default function ShelfPage() {
  const { bottles, loading, error } = useCollection()
  const [view, setView] = useState('grid')
  const [sortBy, setSortBy] = useState('dateDesc')
  const [search, setSearch] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [statusFilters, setStatusFilters] = useState(DEFAULT_STATUS)
  const [limitedOnly, setLimitedOnly] = useState(false)
  const [selectedDistilleries, setSelectedDistilleries] = useState([])
  const [ageRange, setAgeRange] = useState({ min: 0, max: 30 })
  const [proofRange, setProofRange] = useState({ min: 60, max: 140 })
  const [deleteTarget, setDeleteTarget] = useState(null)

  const distilleryOptions = useMemo(() => {
    const set = new Set(bottles.map((bottle) => bottle.distillery).filter(Boolean))
    return Array.from(set).sort()
  }, [bottles])

  const derivedRanges = useMemo(() => {
    const ages = bottles.map((b) => b.age).filter((value) => typeof value === 'number')
    const proofs = bottles.map((b) => b.proof).filter((value) => typeof value === 'number')
    return {
      age: {
        min: ages.length ? Math.min(...ages) : 0,
        max: ages.length ? Math.max(...ages) : 30,
      },
      proof: {
        min: proofs.length ? Math.min(...proofs) : 60,
        max: proofs.length ? Math.max(...proofs) : 140,
      },
    }
  }, [bottles])

  useEffect(() => {
    setAgeRange((prev) =>
      prev.min === 0 && prev.max === 30 ? derivedRanges.age : prev
    )
    setProofRange((prev) =>
      prev.min === 60 && prev.max === 140 ? derivedRanges.proof : prev
    )
  }, [derivedRanges])

  const filteredBottles = useMemo(() => {
    let list = [...bottles]

    if (search.trim()) {
      const term = search.toLowerCase()
      list = list.filter(
        (bottle) =>
          bottle.name?.toLowerCase().includes(term) ||
          bottle.distillery?.toLowerCase().includes(term)
      )
    }

    list = list.filter((bottle) => statusFilters[bottle.status || 'sealed'])

    if (selectedDistilleries.length) {
      list = list.filter((bottle) => selectedDistilleries.includes(bottle.distillery))
    }

    if (limitedOnly) {
      list = list.filter((bottle) => bottle.limitedRelease)
    }

    list = list.filter((bottle) => {
      const age = bottle.age
      const proof = bottle.proof
      const ageOk = typeof age !== 'number' || (age >= ageRange.min && age <= ageRange.max)
      const proofOk =
        typeof proof !== 'number' || (proof >= proofRange.min && proof <= proofRange.max)
      return ageOk && proofOk
    })

    switch (sortBy) {
      case 'dateAsc':
        list.sort((a, b) => (a.dateAdded || '').localeCompare(b.dateAdded || ''))
        break
      case 'nameAsc':
        list.sort((a, b) => (a.name || '').localeCompare(b.name || ''))
        break
      case 'nameDesc':
        list.sort((a, b) => (b.name || '').localeCompare(a.name || ''))
        break
      case 'distilleryAsc':
        list.sort((a, b) => (a.distillery || '').localeCompare(b.distillery || ''))
        break
      case 'ageAsc':
        list.sort((a, b) => (a.age ?? 0) - (b.age ?? 0))
        break
      case 'ageDesc':
        list.sort((a, b) => (b.age ?? 0) - (a.age ?? 0))
        break
      case 'proofAsc':
        list.sort((a, b) => (a.proof ?? 0) - (b.proof ?? 0))
        break
      case 'proofDesc':
        list.sort((a, b) => (b.proof ?? 0) - (a.proof ?? 0))
        break
      case 'scoreDesc':
        list.sort(
          (a, b) =>
            (b.tastingNotes?.overallScore ?? 0) - (a.tastingNotes?.overallScore ?? 0)
        )
        break
      case 'priceDesc':
        list.sort((a, b) => (b.purchasePrice ?? 0) - (a.purchasePrice ?? 0))
        break
      case 'priceAsc':
        list.sort((a, b) => (a.purchasePrice ?? 0) - (b.purchasePrice ?? 0))
        break
      default:
        list.sort((a, b) => (b.dateAdded || '').localeCompare(a.dateAdded || ''))
    }

    return list
  }, [
    bottles,
    search,
    statusFilters,
    selectedDistilleries,
    limitedOnly,
    ageRange,
    proofRange,
    sortBy,
  ])

  const stats = useMemo(() => {
    const sealed = bottles.filter((b) => b.status === 'sealed').length
    const open = bottles.filter((b) => b.status === 'open').length
    const empty = bottles.filter((b) => b.status === 'empty').length
    return { total: bottles.length, sealed, open, empty }
  }, [bottles])

  const hasActiveFilters =
    search ||
    limitedOnly ||
    selectedDistilleries.length > 0 ||
    !statusFilters.sealed ||
    !statusFilters.open ||
    !statusFilters.empty ||
    ageRange.min !== derivedRanges.age.min ||
    ageRange.max !== derivedRanges.age.max ||
    proofRange.min !== derivedRanges.proof.min ||
    proofRange.max !== derivedRanges.proof.max

  const handleDelete = async () => {
    if (!deleteTarget) return
    const refDoc = doc(collection(db, 'bottles'), deleteTarget.id)
    await deleteDoc(refDoc)
    if (deleteTarget.photoURL && storage) {
      const photoRef = ref(storage, `bottles/${deleteTarget.id}/photo.jpg`)
      await deleteObject(photoRef)
    }
    setDeleteTarget(null)
  }

  if (loading) {
    return (
      <PageWrapper>
        <p>Loading your shelf…</p>
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

  if (!bottles.length) {
    return (
      <PageWrapper>
        <EmptyShelf />
      </PageWrapper>
    )
  }

  return (
    <PageWrapper>
      <div className={styles.page}>
        <section className={styles.header}>
        <h1>Bourbon Tater</h1>
        <p>Your Personal Bourbon Collection</p>
        <div className={styles.divider} />
        <div className={styles.stats}>
          {stats.total} bottles in your collection · {stats.sealed} sealed · {stats.open} open ·{' '}
          {stats.empty} empty
        </div>
        </section>

        <ShelfToolbar
          view={view}
          onViewChange={setView}
          sortBy={sortBy}
          onSortChange={setSortBy}
          search={search}
          onSearchChange={setSearch}
          onToggleFilters={() => setShowFilters((prev) => !prev)}
          showFilters={showFilters}
        />

        {showFilters && (
          <FilterPanel
            statusFilters={statusFilters}
            onStatusChange={setStatusFilters}
            ageRange={ageRange}
            onAgeChange={setAgeRange}
            proofRange={proofRange}
            onProofChange={setProofRange}
            distilleryOptions={distilleryOptions}
            selectedDistilleries={selectedDistilleries}
            onDistilleriesChange={setSelectedDistilleries}
            limitedOnly={limitedOnly}
            onLimitedChange={setLimitedOnly}
          />
        )}

        {hasActiveFilters && (
          <div className={styles.counts}>
            Showing {filteredBottles.length} of {bottles.length} bottles
          </div>
        )}

        {view === 'grid' ? (
          <div className={styles.grid}>
            {filteredBottles.map((bottle) => (
              <BottleCard key={bottle.id} bottle={bottle} />
            ))}
          </div>
        ) : (
          <div className={styles.list}>
            <div className={styles.listHeader}>
              <span />
              <span>Name</span>
              <span>Distillery</span>
              <span>Age</span>
              <span>Proof</span>
              <span>Status</span>
              <span>Score</span>
              <span>Date Added</span>
              <span />
            </div>
            {filteredBottles.map((bottle) => (
              <BottleListRow key={bottle.id} bottle={bottle} onDelete={setDeleteTarget} />
            ))}
          </div>
        )}
      </div>

      {deleteTarget && (
        <Modal
          title="Delete this bottle?"
          body={`Are you sure you want to remove ${deleteTarget.name} from your shelf? This cannot be undone.`}
          confirmLabel="Yes, Delete"
          onConfirm={handleDelete}
          onClose={() => setDeleteTarget(null)}
        />
      )}
    </PageWrapper>
  )
}
