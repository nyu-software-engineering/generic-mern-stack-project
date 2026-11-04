// Lightweight centered dialog used for confirmations (join/leave leaderboard, log out).
function Modal({ title, children, onClose }) {
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-ink/40 px-6" role="presentation" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="w-full max-w-sm rounded-2xl border border-border bg-surface p-6"
        onClick={(event) => event.stopPropagation()}
      >
        <h2 className="text-2xl font-semibold tracking-[-0.03em]">{title}</h2>
        <div className="mt-3 text-muted">{children}</div>
      </div>
    </div>
  )
}

export default Modal
