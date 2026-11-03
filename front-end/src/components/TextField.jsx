// A reusable form field: label, input box, and a message underneath.
export default function TextField({
  label,
  type = 'text',
  value,
  onChange,
  onBlur,
  error,
  hint,
  
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-sm font-medium text-gray-900">{label}</span>
      <input
        type={type}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        // Tells user the field has a problem
        aria-invalid={Boolean(error)}
        className={`min-h-11 rounded-xl border bg-white px-3.5 py-2.5 text-base text-gray-900 focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-blue-600 ${
          error ? 'border-red-600' : 'border-gray-300'
        }`}
      />
      {/* An error replaces the hint, so only one message shows at a time */}
      {error ? (
        <span className="text-xs text-red-600">{error}</span>
      ) : (
        hint && <span className="text-xs text-gray-500">{hint}</span>
      )}
    </label>
  )
}