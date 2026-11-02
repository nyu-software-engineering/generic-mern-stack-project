import { Link } from 'react-router'

const BASE = 'block w-full border border-line bg-surface p-4 text-left'

export default function Card({ children, to, onClick }) {
  if (to) {
    return (
      <Link to={to} className={`${BASE} transition hover:border-ink`}>
        {children}
      </Link>
    )
  }

  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={`${BASE} transition hover:border-ink`}>
        {children}
      </button>
    )
  }

  return <div className={BASE}>{children}</div>
}