export default function Toggle({ checked, onChange, label }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={`relative h-6 w-11 shrink-0 border transition ${checked ? 'border-accent bg-accent' : 'border-line bg-canvas'}`}
    >
      <span className={`absolute top-1 h-4 w-4 bg-surface shadow transition-all ${checked ? 'left-6' : 'left-1'}`} />
    </button>
  )
}