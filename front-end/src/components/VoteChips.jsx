import './VoteChips.css'

const choices = [
  { value: 'must-go', label: 'Must-go' },
  { value: 'down', label: 'Down for it' },
  { value: 'pass', label: 'Hard pass' },
]

// The parent saves the choice and supplies the latest counts.
export default function VoteChips({
  value = null,
  onChange,
  counts = {},
  disabled = false,
  label = 'Are you in?',
}) {
  const cannotVote = disabled || typeof onChange !== 'function'

  return (
    <fieldset disabled={cannotVote} className="vote-chips">
      <legend className="vote-chips__legend">{label}</legend>

      <div className="vote-chips__options">
        {choices.map((choice) => {
          const selected = value === choice.value
          const total = counts?.[choice.value]
          // Show zero, but hide missing or invalid counts.
          const showCount = Number.isSafeInteger(total) && total >= 0

          return (
            <button
              key={choice.value}
              type="button"
              disabled={cannotVote}
              aria-pressed={selected}
              onClick={() => {
                if (!cannotVote && !selected) onChange(choice.value)
              }}
              className={[
                'vote-chips__button',
                `vote-chips__button--${choice.value}`,
                selected ? 'vote-chips__button--selected' : '',
              ].join(' ')}
            >
              {selected && (
                <span aria-hidden="true" className="vote-chips__check">
                  ✓
                </span>
              )}
              {showCount && (
                <span className="vote-chips__count">{total}</span>
              )}
              <span className="vote-chips__label">{choice.label}</span>
            </button>
          )
        })}
      </div>
    </fieldset>
  )
}
