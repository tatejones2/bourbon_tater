import styles from './EmptyShelf.module.css'
import PlaceholderBottle from '../ui/PlaceholderBottle'
import Button from '../ui/Button'
import { Link } from 'react-router-dom'

export default function EmptyShelf() {
  return (
    <div className={styles.empty}>
      <PlaceholderBottle size={140} />
      <h2>Your shelf is empty</h2>
      <p>Start building your collection by adding your first bottle.</p>
      <Button as={Link} to="/add">
        + Add Your First Bottle
      </Button>
    </div>
  )
}
