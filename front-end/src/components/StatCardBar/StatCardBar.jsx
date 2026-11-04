import { Card } from '../Card/Card'
import './StatCardBar.css'

/**
 * A big number with a label, like "24 · Total applied" on Home and Statistics.
 * Put several in a <div className="stat-grid"> to lay them out in columns.
 *
 * @example
 * <div className="stat-grid">
 *   <StatCard value={stats.totalApplied} label="Total applied" />
 *   <StatCard value={stats.active} label="Active" />
 * </div>
 */
export function StatCardBar({ value, label, percentage}) {
    
    const progress = Math.min(
        100,
        Math.max(0, Number(percentage) || 0)
    )

    return (
    <Card className="stat-card-bar">
        <span className="stat-card__label">{label}</span>
        <span className="stat-card__value">{value}</span>
        <div className="stat-card-bar__progress">
            <div
                className="stat-card-bar__fill"
                style={{ width: `${progress}%` }}
            />
        </div>
    </Card>
    )
}
