
import { Card } from '../Card/Card'
import './CompoundBar.css'

/**
 * Displays entries in one stacked percentage bar.
 *
 * @example
 * <CompoundBar
 *   name="Outcomes"
 *   entries={[
 *     { label: 'Pending', value: 20, color: '#F59E0B' },
 *     { label: 'Interviews', value: 12, color: '#6366F1' },
 *     { label: 'Offers', value: 4, color: '#10B981' },
 *     { label: 'Rejected', value: 8, color: '#EF4444' },
 *   ]}
 * />
 */

export function CompoundBar({ name, entries = [] }) {
    const total = entries.reduce((sum, outcome) =>
        sum + Math.max(0, Number(outcome.value) || 0), 0)


    return (
    <Card className="compound-bar">
        {name != null && (
        <h3 className="compound-bar__title">
            {name}
        </h3>
        )}

        <div className="compound-bar__bar">
            {entries.map((outcome) => {
                const value = Math.max(0, Number(outcome.value) || 0)
                const percentage = total > 0 ? (value / total) * 100 : 0
                return (
                    <div
                        key={outcome.label}
                        className="compound-bar__segment"
                        style={{
                            width: `${percentage}%`,
                            backgroundColor: outcome.color,
                        }}
                        title={`${outcome.label}: ${value} (${percentage.toFixed(1)}%)`}
                    />
                )
            })}
        </div>

        <div className="compound-bar__legend">
        {entries.map((outcome) => (
            <div
                className="compound-bar__legend__item"
                key={outcome.label}
            >
            <span
                className="compound-bar__legend__dot"
                style={{
                    backgroundColor: outcome.color,
                }}
            />

            <span className="compound-bar__legend__label">
                {outcome.label}
            </span>

            <span className="compound-bar__legend__value">
                {outcome.value}
            </span>
          </div>
        ))}
      </div>
    </Card>
  )
}
