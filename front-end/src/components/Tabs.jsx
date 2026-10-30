// A row of selectable chips. `options` is a list of { value, label }.
export default function Tabs({ options, value, onChange, label, className = '' }) {
  return (
    <div role="tablist" aria-label={label} className={`flex gap-2 overflow-x-auto pb-1 ${className}`}>
      {options.map((option) => {
        const selected = option.value === value
        return (
          <button
            key={option.value}
            type="button"
            role="tab"
            aria-selected={selected}
            onClick={() => onChange(option.value)}
            className={`h-9 shrink-0 rounded-full px-4 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-900 ${
              selected ? 'bg-stone-900 text-white' : 'bg-white text-stone-700 ring-1 ring-inset ring-stone-300 hover:bg-stone-100'
            }`}
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}
