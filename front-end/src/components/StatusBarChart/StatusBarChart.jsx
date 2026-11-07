
import { Card } from '../Card/Card'
import './StatusBarChart.css'

/**
 * Displays application statuses as individual horizontal bars.
 *
 * @example
 * <StatusBarChart
 *   entries={[
 *     { label: 'Applied', value: 20 },
 *     { label: 'OA', value: 12 },
 *     { label: 'Interview', value: 10 },
 *     { label: 'Offer', value: 3 },
 *     { label: 'Rejected', value: 15 },
 *   ]}
 * />
 */

export function StatusBarChart({ entries = [] }) {
    const maxValue = Math.max(1, ...entries.map((entry) =>
        Math.max(0, Number(entry.value) || 0)))

    return (
    <Card className="status-bar-chart">
        {entries.map((entry) => {
            const value = Math.max(0, Number(entry.value) || 0)
            const percentage = (value / maxValue) * 100

            return (
                <div
                    className="status-bar-chart__row"
                    key={entry.label}
                >
                    <span className="status-bar-chart__label">
                        {entry.label}
                    </span>

                    <div className="status-bar-chart__track">
                        <div
                            className="status-bar-chart__bar"
                            style={{
                                width: `${percentage}%`,
                            }}
                            title={`${entry.label}: ${value}`}
                        />
                    </div>

                    <span className="status-bar-chart__value">
                        {value}
                    </span>
                </div>
            )
        })}
    </Card>
    )
}
