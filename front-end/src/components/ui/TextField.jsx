export default function TextField({ label, id, ...inputProps }) {
  return (
    <label htmlFor={id} className="block">
      <span className="mb-1.5 block text-sm font-medium text-ink">{label}</span>
      <input
        id={id}
        className="w-full border border-line bg-surface px-3 py-3 text-base text-ink placeholder:text-muted focus:border-ink focus:outline-none"
        {...inputProps}
      />
    </label>
  )
}