import { Link } from 'react-router'
import BackLink from '../../components/ui/BackLink.jsx'
import { badges } from '../../services/mockData.js'

function AchievementsPage() {
  const earnedCount = badges.filter((b) => b.earned).length

  return (
    <>
      <BackLink />
      <h1 tabIndex={-1} className="text-4xl font-semibold tracking-[-0.04em]">Achievements</h1>

      <p className="mt-6 text-sm font-[650] tracking-[0.08em] text-muted uppercase">Badges earned</p>
      <p className="mt-2 text-4xl font-semibold tracking-[-0.04em]">
        {earnedCount} of {badges.length}
      </p>

      <ul className="mt-6 flex flex-col gap-3">
        {badges.map((badge) => (
          <li key={badge.id}>
            <Link
              to={`/account/achievements/${badge.id}`}
              className="block rounded-2xl border border-border p-5 text-ink no-underline hover:bg-hover"
            >
              <div className="flex items-baseline justify-between gap-4">
                <p className="font-[650]">{badge.name}</p>
                {badge.earned ? (
                  <p className="text-sm text-muted">Earned {badge.earnedDate}</p>
                ) : (
                  <p className="text-sm font-[650] text-muted">Locked</p>
                )}
              </div>
              <p className="mt-1 text-sm text-muted">{badge.description}</p>
              {!badge.earned && badge.progress && (
                <p className="mt-2 text-sm">
                  Your progress {badge.progress.done} of {badge.progress.total}
                </p>
              )}
            </Link>
          </li>
        ))}
      </ul>
    </>
  )
}

export default AchievementsPage
