import { Link, useParams } from 'react-router'
import BackLink from '../../components/ui/BackLink.jsx'
import { badges } from '../../services/mockData.js'

function BadgeDetailPage() {
  const { badgeId } = useParams()
  const badge = badges.find((b) => b.id === badgeId)

  if (!badge) {
    return (
      <>
        <BackLink />
        <h1 tabIndex={-1} className="text-3xl font-semibold tracking-[-0.04em]">Badge not found</h1>
      </>
    )
  }

  return (
    <>
      <BackLink />
      <p className="text-sm font-[650] tracking-[0.08em] text-muted uppercase">Achievements</p>
      <h1 tabIndex={-1} className="mt-2 text-4xl font-semibold tracking-[-0.04em]">{badge.name}</h1>

      <img
        src={`https://picsum.photos/seed/stocksim-badge-${badge.id}/480/300`}
        alt={`${badge.name} badge artwork`}
        className="mt-6 w-full max-w-sm rounded-2xl border border-border object-cover"
      />

      {badge.earned ? (
        <p className="mt-6 font-[650]">Earned {badge.earnedDate}</p>
      ) : (
        <p className="mt-6 font-[650] text-muted">Locked</p>
      )}
      <p className="mt-1 text-muted">{badge.description}</p>
      {!badge.earned && badge.progress && (
        <p className="mt-3 text-sm">
          Your progress <span className="float-right font-[650]">{badge.progress.done} of {badge.progress.total}</span>
        </p>
      )}

      {badge.earned ? (
        <Link
          to="/portfolio"
          className="mt-6 inline-flex min-h-12 w-full items-center justify-center rounded-[2rem] bg-accent px-6 py-3.5 font-[650] text-ink no-underline hover:bg-accent-hover"
        >
          View portfolio
        </Link>
      ) : (
        <Link
          to="/learn"
          className="mt-6 inline-flex min-h-12 w-full items-center justify-center rounded-[2rem] bg-accent px-6 py-3.5 font-[650] text-ink no-underline hover:bg-accent-hover"
        >
          Continue learning
        </Link>
      )}
    </>
  )
}

export default BadgeDetailPage
