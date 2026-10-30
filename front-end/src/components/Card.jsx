export default function Card({ onClick, className = '', children, ...props }) {
  const base = 'rounded-2xl bg-white p-4 ring-1 ring-stone-200'

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={`${base} block w-full text-left transition hover:ring-stone-300 active:scale-[0.99] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-900 ${className}`}
        {...props}
      >
        {children}
      </button>
    )
  }

  return (
    <div className={`${base} ${className}`} {...props}>
      {children}
    </div>
  )
}
