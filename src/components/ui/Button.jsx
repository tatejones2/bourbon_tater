import styles from './Button.module.css'

export default function Button({
  as: Component = 'button',
  variant = 'primary',
  className = '',
  ...props
}) {
  const variantClass = styles[variant] || styles.primary
  return <Component className={`${styles.button} ${variantClass} ${className}`} {...props} />
}
