const choices = [
  { value: 'must-go', label: 'Must-go', colors: 'bg-peach text-brand-dark' },
  { value: 'down', label: 'Down for it', colors: 'bg-powder text-ink' },
  { value: 'hard-pass', label: 'Hard pass', colors: 'bg-background text-ink' },
]

// The parent owns the vote so it can save the choice and update other screens.
export default function VoteChips({
  value = null,
  onChange,
  counts = {},
  disabled = false,
  label = 'Are you in?',
}) {
  const cannotVote = disabled || typeof onChange !== 'function'

  return (
    <fieldset disabled={cannotVote} className="m-0 min-w-0 border-0 p-0">
      <legend className="mb-2 text-sm font-semibold text-ink">{label}</legend>
      <div className="grid grid-cols-3 gap-2">
        {choices.map((choice) => {
          const selected = value === choice.value
          const total = counts?.[choice.value]
          // Missing counts stay hidden; zero is still a valid count.
          const showCount = Number.isSafeInteger(total) && total >= 0

          return (
            <button
              key={choice.value}
              type="button"
              disabled={cannotVote}
              aria-pressed={selected}
              onClick={() => {
                // Clicking the current choice keeps it selected.
                if (!cannotVote && !selected) onChange(choice.value)
              }}
              className={[
                'relative flex min-h-16 min-w-0 flex-col items-center justify-center',
                'gap-1 rounded-button border-2 px-2 py-3 text-center',
                'transition-colors focus-visible:outline-2',
                'focus-visible:outline-offset-2 focus-visible:outline-brand',
                'disabled:cursor-not-allowed disabled:opacity-50',
                choice.colors,
                selected ? 'border-brand shadow-button' : 'border-transparent hover:border-border',
              ].join(' ')}
            >
              {selected && (
                <span aria-hidden="true" className="absolute right-1 top-0 text-xs font-bold">
                  ✓
                </span>
              )}
              {showCount && <span className="text-lg font-bold leading-none">{total}</span>}
              <span className="text-xs font-semibold">{choice.label}</span>
            </button>
          )
        })}
      </div>
    </fieldset>
  )
}
