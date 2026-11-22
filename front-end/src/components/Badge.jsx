export default function Badge({ children, className = '' }) {
  return (
    <span className={`inline-flex items-center rounded-pill text-xs text-ink ${className}`}>
      {children}
    </span>
  )
}
