import { useState } from 'react'
import PageIntro from '../../components/layout/PageIntro.jsx'
import Modal from '../../components/ui/Modal.jsx'
import { formatSignedPercent } from '../../components/ui/format.js'
import { leaderboardAllTime, leaderboardThisMonth, user } from '../../services/mockData.js'

const periods = [
  { id: 'month', label: 'This month', rows: leaderboardThisMonth },
  { id: 'all', label: 'All time', rows: leaderboardAllTime },
]

function LeaderboardPage() {
  // sharing: 'private' | 'sharing' | 'left' - stands in for the back-end setting.
  const [sharing, setSharing] = useState('private')
  const [period, setPeriod] = useState('month')
  const [dialog, setDialog] = useState(null) // 'join' | 'leave' | 'join-error' | 'leave-error' | null

  // Join/leave simulate the network request that the Sprint 2 back end will handle.
  // If the browser is offline the request cannot succeed, so the error screens appear.
  function attemptJoin() {
    if (navigator.onLine) {
      setSharing('sharing')
      setDialog(null)
    } else {
      setDialog('join-error')
    }
  }

  function attemptLeave() {
    if (navigator.onLine) {
      setSharing('left')
      setDialog(null)
    } else {
      setDialog('leave-error')
    }
  }

  const rows = periods.find((p) => p.id === period).rows
  const you = rows.find((row) => row.isYou)

  return (
    <>
      <PageIntro eyebrow="Practice account" title="Leaderboard" description="Compare your practice returns with other learners." />

      <section aria-label="Sharing status" className="rounded-2xl border border-border p-6">
        {sharing === 'sharing' ? (
          <>
            <p className="font-[650]">You are sharing performance</p>
            <p className="mt-1 text-muted">
              {user.displayName} | Rank {you?.rank} | Return {you ? formatSignedPercent(you.returnPercent) : ''}
            </p>
            <button
              type="button"
              onClick={() => setDialog('leave')}
              className="mt-5 min-h-12 w-full cursor-pointer rounded-[2rem] border border-border px-6 py-3.5 font-[650] text-ink hover:bg-hover"
            >
              Leave leaderboard
            </button>
          </>
        ) : sharing === 'left' ? (
          <>
            <p className="font-[650]">You left the leaderboard</p>
            <p className="mt-1 text-muted">Your investing performance is now private.</p>
            <button
              type="button"
              onClick={() => setDialog('join')}
              className="mt-5 min-h-12 w-full cursor-pointer rounded-[2rem] border border-border px-6 py-3.5 font-[650] text-ink hover:bg-hover"
            >
              Join again
            </button>
          </>
        ) : (
          <>
            <p className="font-[650]">Your performance is private</p>
            <p className="mt-1 text-muted">Join only if you want to share your display name and percentage return.</p>
            <button
              type="button"
              onClick={() => setDialog('join')}
              className="mt-5 min-h-12 w-full cursor-pointer rounded-[2rem] bg-accent px-6 py-3.5 font-[650] text-ink hover:bg-accent-hover"
            >
              Join leaderboard
            </button>
          </>
        )}
      </section>

      <div className="mt-6 grid grid-cols-2 gap-1 rounded-xl border border-border p-1" role="tablist" aria-label="Leaderboard period">
        {periods.map((p) => (
          <button
            key={p.id}
            type="button"
            role="tab"
            aria-selected={period === p.id}
            onClick={() => setPeriod(p.id)}
            className={`min-h-11 cursor-pointer rounded-lg font-[650] ${
              period === p.id ? 'bg-selected text-selected-ink' : 'text-muted hover:bg-hover hover:text-ink'
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {rows.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-border p-6">
          <p className="font-[650]">No rankings yet</p>
          <p className="mt-1 text-muted">No participants have a return for this period.</p>
        </div>
      ) : (
        <ol className="mt-6 flex flex-col gap-3">
          {rows.map((row) => (
            <li
              key={row.rank}
              className={`flex items-baseline justify-between gap-4 rounded-2xl border p-5 ${
                row.isYou ? 'border-ink bg-selected' : 'border-border'
              }`}
            >
              <p className="font-[650]">
                {row.rank} | {row.name} {row.isYou && <span className="text-selected-ink">· You</span>}
              </p>
              <p className="text-sm font-[650]">Return {formatSignedPercent(row.returnPercent)}</p>
            </li>
          ))}
        </ol>
      )}
      {sharing !== 'sharing' && <p className="mt-4 text-sm text-muted">You are not listed.</p>}

      {dialog === 'join' && (
        <Modal title="Join leaderboard?" onClose={() => setDialog(null)}>
          <p>Your display name and percentage return will be visible to other users. You can leave at any time.</p>
          <div className="mt-5 flex flex-col gap-3">
            <button
              type="button"
              onClick={attemptJoin}
              className="min-h-12 w-full cursor-pointer rounded-[2rem] bg-accent px-6 py-3.5 font-[650] text-ink hover:bg-accent-hover"
            >
              Join and share
            </button>
            <button
              type="button"
              onClick={() => setDialog(null)}
              className="min-h-12 w-full cursor-pointer rounded-[2rem] border border-border px-6 py-3.5 font-[650] text-ink hover:bg-hover"
            >
              Stay private
            </button>
          </div>
        </Modal>
      )}

      {dialog === 'join-error' && (
        <Modal title="Could not join" onClose={() => setDialog(null)}>
          <p>Your performance is still private. Try joining again when your connection returns.</p>
          <div className="mt-5 flex flex-col gap-3">
            <button
              type="button"
              onClick={attemptJoin}
              className="min-h-12 w-full cursor-pointer rounded-[2rem] bg-accent px-6 py-3.5 font-[650] text-ink hover:bg-accent-hover"
            >
              Try again
            </button>
            <button
              type="button"
              onClick={() => setDialog(null)}
              className="min-h-12 w-full cursor-pointer rounded-[2rem] border border-border px-6 py-3.5 font-[650] text-ink hover:bg-hover"
            >
              Stay private
            </button>
          </div>
        </Modal>
      )}

      {dialog === 'leave' && (
        <Modal title="Leave leaderboard?" onClose={() => setDialog(null)}>
          <p>Your name and return will be removed from rankings. Your portfolio and lessons will stay saved.</p>
          <div className="mt-5 flex flex-col gap-3">
            <button
              type="button"
              onClick={attemptLeave}
              className="min-h-12 w-full cursor-pointer rounded-[2rem] bg-accent px-6 py-3.5 font-[650] text-ink hover:bg-accent-hover"
            >
              Leave leaderboard
            </button>
            <button
              type="button"
              onClick={() => setDialog(null)}
              className="min-h-12 w-full cursor-pointer rounded-[2rem] border border-border px-6 py-3.5 font-[650] text-ink hover:bg-hover"
            >
              Keep sharing
            </button>
          </div>
        </Modal>
      )}
      {dialog === 'leave-error' && (
        <Modal title="Could not leave yet" onClose={() => setDialog(null)}>
          <p>Your performance is still shared. Please retry to remove yourself from the leaderboard.</p>
          <div className="mt-5 flex flex-col gap-3">
            <button
              type="button"
              onClick={attemptLeave}
              className="min-h-12 w-full cursor-pointer rounded-[2rem] bg-accent px-6 py-3.5 font-[650] text-ink hover:bg-accent-hover"
            >
              Retry leaving
            </button>
            <button
              type="button"
              onClick={() => setDialog(null)}
              className="min-h-12 w-full cursor-pointer rounded-[2rem] border border-border px-6 py-3.5 font-[650] text-ink hover:bg-hover"
            >
              Back to leaderboard
            </button>
          </div>
        </Modal>
      )}
    </>
  )
}

export default LeaderboardPage
