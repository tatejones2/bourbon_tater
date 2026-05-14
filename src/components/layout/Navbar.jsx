import { NavLink } from 'react-router-dom'
import styles from './Navbar.module.css'

export default function Navbar() {
  return (
    <header className={styles.navbar}>
      <div className={styles.brand}>
        <span className={styles.wordmark}>Bourbon Tater</span>
        <span className={styles.tagline}>Your Personal Bourbon Collection</span>
      </div>
      <nav className={styles.links}>
        <NavLink to="/" end className={({ isActive }) => (isActive ? styles.active : '')}>
          Shelf
        </NavLink>
        <NavLink to="/add" className={({ isActive }) => (isActive ? styles.active : '')}>
          Add Bottle
        </NavLink>
      </nav>
    </header>
  )
}
