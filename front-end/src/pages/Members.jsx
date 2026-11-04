import { useMemo } from 'react'
import { Link, useParams } from 'react-router'
import Avatar from '../components/Avatar'
import { currentUserId } from '../data/demoData'
import { getInviteToListData, getListByCityId } from '../data/mockDataLayer'

export default function Members() {
  const { cityId } = useParams()
  // The invite screen already needs the list's members, so we reuse the same lookup
  const data = useMemo(() => getInviteToListData(cityId), [cityId])
  const ownerId = getListByCityId(cityId)?.ownerId

  // No list for this city
  if (!data) {
    return (
      <section className="px-5 py-10 text-center">
        <h1 className="text-2xl font-semibold">City list not found</h1>
        <Link to="/" className="mt-4 inline-block font-semibold text-brand hover:text-brand-dark">
          Back to your lists
        </Link>
      </section>
    )
  }

  // Only people on the list get to see who else is on it
  if (data.status === 'forbidden') {
    return (
      <section className="px-5 py-10 text-center">
        <h1 className="text-2xl font-semibold">Members are private</h1>
        <p className="mt-2 text-sm text-muted">Join this list to see who is on it.</p>
        <Link to="/invites" className="mt-4 inline-block font-semibold text-brand hover:text-brand-dark">
          Check your invitations
        </Link>
      </section>
    )
  }

  return (
    <section className="px-5 py-6">
      <Link to={`/city/${data.cityId}`} className="text-sm font-semibold text-muted hover:text-ink">
        <span aria-hidden="true">←</span> {data.cityName}
      </Link>

      <div className="mt-4 flex items-start justify-between gap-3">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Members</h1>
          <p className="mt-1 text-sm text-muted">
            {data.members.length} {data.members.length === 1 ? 'person' : 'people'} on the {data.cityName} list
          </p>
        </div>
        {/* Opens the invite sheet from the invite screen task */}
        <Link
          to={`/city/${data.cityId}/invite`}
          className="inline-flex min-h-11 shrink-0 items-center btn-primary hover:btn-primary-hover focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-brand"
        >
          Invite
        </Link>
      </div>

      <ul className="mt-6 flex flex-col">
        {data.members.map((member) => (
          <li key={member.id} className="flex items-center gap-3 border-b border-border py-3">
            <Avatar user={member} />
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold">
                {member.name}
                {member.id === currentUserId && <span className="font-normal text-muted"> (you)</span>}
              </p>
              <p className="truncate text-sm text-muted">@{member.username}</p>
            </div>
            {member.id === ownerId && (
              <span className="rounded-pill bg-sage px-3 py-1 text-xs font-semibold text-ink">Owner</span>
            )}
          </li>
        ))}
      </ul>
    </section>
  )
}
