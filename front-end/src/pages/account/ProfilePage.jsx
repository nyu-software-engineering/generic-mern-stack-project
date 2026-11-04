import { Link } from 'react-router'
import BackLink from '../../components/ui/BackLink.jsx'
import { user } from '../../services/mockData.js'

function ProfilePage() {
  return (
    <>
      <BackLink />
      <h1 tabIndex={-1} className="text-4xl font-semibold tracking-[-0.04em]">Profile</h1>

      <img
        src={user.photoUrl}
        alt={`${user.displayName}'s profile photo`}
        className="mt-6 h-36 w-36 rounded-2xl border border-border object-cover"
      />

      <dl className="mt-6 flex flex-col gap-3">
        <div className="rounded-xl border border-border p-4">
          <dt className="text-sm text-muted">Display name</dt>
          <dd className="mt-1 font-[650]">{user.displayName}</dd>
        </div>
        <div className="rounded-xl border border-border p-4">
          <dt className="text-sm text-muted">Email</dt>
          <dd className="mt-1 font-[650]">{user.email}</dd>
        </div>
        <div className="rounded-xl border border-border p-4">
          <dt className="text-sm text-muted">Member since</dt>
          <dd className="mt-1 font-[650]">{user.memberSince}</dd>
        </div>
      </dl>

      <Link
        to="/leaderboard"
        className="mt-8 inline-flex min-h-12 w-full items-center justify-center rounded-[2rem] border border-border px-6 py-3.5 font-[650] text-ink no-underline hover:bg-hover"
      >
        Leaderboard privacy
      </Link>
    </>
  )
}

export default ProfilePage
