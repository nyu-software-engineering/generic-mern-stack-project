import { useMemo, useState } from 'react'
import { Link, Navigate, useParams } from 'react-router'
import Avatar from '../components/Avatar'
import { currentUserId, VOTE_OPTIONS } from '../data/demoData'
import { getFriendProfile, sendListInvites } from '../data/mockDataLayer'
import BackLink from '../components/BackLink'
import Button from '../components/Button'

// "2025-03-01" -> "Mar 2025". timeZone UTC so the month doesn't shift a day back in New York.
function formatMonthYear(isoDate) {
  return new Date(isoDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric', timeZone: 'UTC' })
}

function voteLabel(value) {
  return VOTE_OPTIONS.find((option) => option.value === value)?.label ?? 'Not voted'
}

function firstName(fullName) {
  return fullName.trim().split(/\s+/)[0]
}

export default function FriendProfile() {
  const { userId } = useParams()
  const data = useMemo(() => getFriendProfile(currentUserId, userId), [userId])
  const [pickerOpen, setPickerOpen] = useState(false)
  // Lists invited to on this visit (the mock doesn't save invites anywhere)
  const [invitedListIds, setInvitedListIds] = useState(() => new Set())
  const [notice, setNotice] = useState('')

  if (data.status === 'self') return <Navigate to="/profile" replace />

  if (data.status === 'not_found') {
    return (
      <section className="px-5 py-10 text-center">
        <h1 className="text-2xl font-semibold">We couldn’t find this friend</h1>
        <Link to="/friends" className="mt-4 inline-block font-semibold text-brand hover:text-brand-dark">
          Back to friends
        </Link></section>
    )
  }

  const { friend, stats, sharedCities, recentlySaved, invitableLists } = data
  const name = firstName(friend.name)
  const canInviteSomewhere = invitableLists.some(
    (list) => !list.alreadyInvited && !invitedListIds.has(list.listId),
  )

  function invite(list) {
    sendListInvites({ listId: list.listId, fromUserId: currentUserId, toUserIds: [friend.id] })
    setInvitedListIds((prev) => new Set(prev).add(list.listId))
    setNotice(`Invited ${name} to ${list.cityName}.`)
    setPickerOpen(false)
  }

  const statTiles = [
    { label: 'places saved', value: stats.placesSaved },
    { label: stats.listsShared === 1 ? 'list shared' : 'lists shared', value: stats.listsShared },
    { label: 'places visited', value: stats.placesVisited },
  ]

  return (
    <section className="px-5 py-6">
      <BackLink to="/friends" label="Back to friends" className="mb-6" />

      <div className="flex items-center gap-4">
        <Avatar user={friend} size="lg" />
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-2xl font-semibold tracking-tight">{friend.name}</h1>
          <p className="truncate text-sm text-muted">
            @{friend.username} · Friends since {formatMonthYear(data.friendsSince)}
          </p>
        </div>
      </div>

      <dl className="mt-6 grid grid-cols-3 gap-3">
        {statTiles.map((stat) => (
          <div key={stat.label} className="rounded-card bg-subtle p-3">
            <dd className="text-2xl font-semibold">{stat.value}</dd>
            <dt className="text-xs text-muted">{stat.label}</dt>
          </div>
        ))}
      </dl>

      <h2 className="mt-8 text-sm font-semibold text-muted">Lists you share</h2>
      {sharedCities.length === 0 ? (
        <p className="mt-2 text-sm text-muted">You’re not on any lists together yet.</p>
      ) : (
        <ul className="mt-2 flex flex-wrap gap-2">
          {sharedCities.map((city) => (
            <li key={city.id}>
              <Link
                to={`/city/${city.id}`}
                className="inline-block rounded-button border border-border px-4 py-2 font-semibold hover:border-brand focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-brand"
              >
                {city.name}
              </Link>
            </li>
          ))}
        </ul>
      )}

      <h2 className="mt-8 text-sm font-semibold text-muted">Recently saved</h2>
      {recentlySaved.length === 0 ? (
        <p className="mt-2 text-sm text-muted">{name} hasn’t saved anything to your shared lists yet.</p>
      ) : (
        <ul aria-label="Recently saved" className="mt-2 divide-y divide-border">
          {recentlySaved.map((item) => (
            <li key={item.savedPlaceId}>
              <Link to={`/place/${item.placeId}`} className="-mx-2 flex items-center gap-3 rounded-input px-2 py-3 hover:bg-subtle focus-visible:outline-3 focus-visible:outline-brand">
                <img src={item.thumbnailUrl} alt="" className="size-12 shrink-0 rounded-input bg-peach object-cover" />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold">{item.name}</p>
                  <p className="truncate text-sm text-muted">
                    {item.cityName} · {item.sourcePlatform}
                  </p>
                </div>
                <span className={`shrink-0 text-sm ${item.myVote ? 'font-semibold' : 'text-muted'}`}>
                  {voteLabel(item.myVote)}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}

      {notice && (
        <p role="status" className="mt-6 text-sm font-semibold">
          {notice}
        </p>
      )}

      <div className="mt-8">
        {invitableLists.length === 0 ? (
          <p className="text-center text-sm text-muted">{name} is already on all your lists.</p>
        ) : (
          <>
            <Button
              onClick={() => setPickerOpen((open) => !open)}
              disabled={!canInviteSomewhere}
              aria-expanded={pickerOpen}
              className="w-full"
            >
              Invite to list
            </Button>

            {pickerOpen && (
              <ul aria-label="Choose a list" className="mt-3 flex flex-col gap-2">
                {invitableLists.map((list) => {
                  const invited = list.alreadyInvited || invitedListIds.has(list.listId)
                  return (
                    <li key={list.listId}>
                      <button
                        type="button"
                        onClick={() => invite(list)}
                        disabled={invited}
                        className="flex w-full items-center justify-between rounded-button border border-border px-4 py-3 text-left hover:border-brand focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-brand disabled:opacity-50 disabled:hover:border-border"
                      >
                        <span className="font-semibold">{list.cityName}</span>
                        <span className="text-sm text-muted">{invited ? 'Invite sent' : 'Invite'}</span>
                      </button>
                    </li>
                  )
                })}
              </ul>
            )}
          </>
        )}
      </div>
    </section>
  )
}