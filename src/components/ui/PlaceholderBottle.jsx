export default function PlaceholderBottle({ className = '', size = 120 }) {
  return (
    <svg
      width={size}
      height={size * 1.4}
      viewBox="0 0 120 168"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <rect x="48" y="0" width="24" height="28" rx="4" fill="#C8732A" />
      <rect x="40" y="26" width="40" height="18" rx="6" fill="#E8A95C" />
      <rect x="26" y="40" width="68" height="118" rx="24" fill="#C8732A" />
      <rect x="34" y="70" width="52" height="46" rx="10" fill="#FDF6E3" opacity="0.9" />
      <circle cx="60" cy="116" r="10" fill="#B8923A" />
    </svg>
  )
}
