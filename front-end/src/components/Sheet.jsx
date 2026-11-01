import { useEffect, useId } from 'react'

// Bottom sheet dialog. Closes on backdrop tap or Escape.
export default function Sheet({ open, onClose, title, children }) {
  const titleId = useId()

  useEffect(() => {
    if (!open) return
    const handleKey = (event) => {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div className="absolute inset-0 bg-stone-900/40" onClick={onClose} aria-hidden="true" />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        className="relative w-full max-w-md rounded-t-3xl bg-white px-4 pt-3 pb-8 shadow-xl"
      >
        <div className="mx-auto mb-4 h-1.5 w-10 rounded-full bg-stone-300" />
        {title && (
          <h2 id={titleId} className="mb-4 text-lg font-semibold text-stone-900">
            {title}
          </h2>
        )}
        {children}
      </div>
    </div>
  )
}
