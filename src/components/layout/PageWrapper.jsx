import styles from './PageWrapper.module.css'

export default function PageWrapper({ children }) {
  return <main className={styles.wrapper}>{children}</main>
}
