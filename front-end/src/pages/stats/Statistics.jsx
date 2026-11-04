import { 
  Page, 
  PagePlaceholder,
  LoadingState,
  ErrorState, 
  StatCard,
  StatCardBar,
  CompoundBar,
  StatusBarChart,
} from '../../components'
import { useApi } from '../../hooks/useApi'
import { api } from '../../api'
import './Statistics.css'


/**
 * Statistics screen.
 * Owner: Ryan · Issues: #77
 * Wireframe: ux-design/prototype/statistics.png
 *
 * Load with api.getStatistics(); use StatCard in a .stat-grid.
 */

async function loadStatistics() {
  const statistics = await api.getStatistics()

  return { statistics }
}

function formatNumber(value) {
  return Number(value ?? 0).toLocaleString()
}

function formatPercent(value) {
  return `${Number(value ?? 0).toFixed(1)}%`
}

export default function Statistics() {
  const { data, loading, error, reload } = useApi(loadStatistics, [])

  if (loading && !data) {
    return (
      <Page title="Statistics">
        <LoadingState />
      </Page>
    )
  }

  if (error) {
    return (
      <Page title="Statistics">
        <ErrorState message={error.message} onRetry={reload} />
      </Page>
    )
  }

  const stats = data ?? {}

  const totalApplications = stats.totalApplications ?? 0
  const pending = stats.pending ?? 0
  const interviews = stats.interviews ?? 0
  const offers = stats.offers ?? 0
  const rejected = stats.rejected ?? 0

  const responseRate =
    stats.responseRate ??
    (totalApplications > 0 ? 
      ((interviews + offers + rejected) / totalApplications) * 100
    : 0)

  return (
    <Page title="Statistics">    
      <div className="stat-grid--two">
            <StatCard
              label="Total Applied"
              value={formatNumber(totalApplications)}
            />
            <StatCard
              label="Pending"
              value={formatNumber(pending)}
            />
            <StatCard
              label="Interviews"
              value={formatNumber(interviews)}
            />
            <StatCard
              label="Offers"
              value={formatNumber(offers)}
            />
      </div>
      <StatCardBar
        label="Response Rate"
        value={formatPercent(responseRate)}
        percentage={responseRate} 
      />

      <h3>Application Status</h3>
      <StatusBarChart
        entries={[
          { label: 'Pending', value: pending },
          { label: 'Interviews', value: interviews },
          { label: 'Offers', value: offers },
          { label: 'Rejected', value: rejected },
        ]}
      />

      <h4>Outcomes</h4>
      <CompoundBar
        entries={[
          { label: 'Pending', value: pending, color: '#F59E0B' },
          { label: 'Interviews', value: interviews, color: '#6366F1' },
          { label: 'Offers', value: offers, color: '#10B981' },
          { label: 'Rejected', value: rejected, color: '#EF4444' },
        ]}
      />
    </Page>
  )
}
