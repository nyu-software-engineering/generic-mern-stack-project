// A reusable form field: label, input box, and a message underneath.
export default function TextField({
  label,
  type = 'text',
  value,
  onChange,
  onBlur,
  error,
  hint,
  autoComplete,
  
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-sm font-medium text-ink">{label}</span>
      <input
        type={type}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        autoComplete={autoComplete}
        // Tells user the field has a problem
        aria-invalid={Boolean(error)}
        className={`min-h-11 input-field focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand ${
          error ? 'border-red-600' : ''
        }`}
      />
      {/* An error replaces the hint, so only one message shows at a time */}
      {error ? (
        <span className="text-xs text-brand-dark">{error}</span>
      ) : (
        hint && <span className="text-xs text-muted">{hint}</span>
      )}
    </label>
  )
}