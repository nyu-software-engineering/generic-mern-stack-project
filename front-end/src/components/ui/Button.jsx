import { Link } from 'react-router'

const VARIANTS = {
  primary: 'bg-accent text-white hover:opacity-90',
  secondary: 'border border-ink bg-surface text-ink hover:bg-canvas',
  ghost: 'text-accent hover:underline underline-offset-4',
}

export default function Button({ children, to, onClick, variant = 'primary', type = 'button', disabled = false }) {
  const className = `block w-full px-4 py-3 text-center text-sm font-semibold transition ${VARIANTS[variant]} ${
    disabled ? 'pointer-events-none opacity-40' : ''
  }`

  if (to) {
    return (
      <Link to={to} className={className}>
        {children}
      </Link>
    )
  }

  return (
    <button type={type} onClick={onClick} disabled={disabled} className={className}>
      {children}
    </button>
  )
}