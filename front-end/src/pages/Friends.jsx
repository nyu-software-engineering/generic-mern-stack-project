import { useState } from 'react'
import Avatar from '../components/Avatar'
import { currentUserId } from '../data/demoData'
import { filterFriendsByUsername, getFriendsWithSharedCities } from '../data/mockDataLayer'
import { Link } from 'react-router'

// "Paris" / "Paris, New York" / "No shared lists yet"
function sharedCitiesLabel(cities) {
  return cities.length > 0 ? cities.join(', ') : 'No shared lists yet'
}

export default function Friends() {
  // Load friends once when the screen opens, same pattern as Invites.jsx
  const [friends] = useState(() => getFriendsWithSharedCities(currentUserId))
  const [query, setQuery] = useState('')

  // Worked out on every render, so the list updates as the user types
  const visibleFriends = filterFriendsByUsername(friends, query)
  const isSearching = query.trim().replace(/^@/, '') !== ''

  return (
    <section className="flex flex-col gap-6 p-4">
      <h1 className="text-3xl">Friends</h1>

      <label className="flex flex-col gap-1.5">
        <span className="sr-only">Find by @username</span>
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Find by @username"
          autoComplete="off"
          autoCapitalize="none"
          spellCheck={false}
          className="min-h-11 input-field focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
        />
      </label>

      <section aria-labelledby="your-friends-heading" className="flex flex-col gap-2">
        <h2 id="your-friends-heading" className="text-lg">Your friends</h2>

        {friends.length === 0 ? (
          <p className="text-sm text-muted">You haven't added any friends yet.</p>
        ) : visibleFriends.length === 0 ? (
          // role="status" so screen readers hear that the search found nothing
          <p role="status" className="text-sm text-muted">
            No friends match "@{query.trim().replace(/^@/, '')}".
          </p>
        ) : (
          <ul aria-label="Your friends" className="divide-y divide-border">
            {visibleFriends.map((friend) => (
              <li key={friend.id}>
                <Link to={`/friends/${friend.id}`} className="-mx-2 flex items-center gap-3 rounded-input px-2 py-3 hover:bg-subtle focus-visible:outline-3 focus-visible:outline-brand">
                  <Avatar user={friend} size="md" />
                  <div className="flex min-w-0 flex-1 flex-col">
                    <span className="truncate font-semibold">{friend.name}</span>
                    <span className="truncate text-sm text-muted">
                      @{friend.username} · {sharedCitiesLabel(friend.sharedCities)}
                    </span>
                  </div>
                  <span aria-hidden="true" className="text-muted">›</span>
                </Link>
              </li>
            ))}
          </ul>
        )}

        {isSearching && visibleFriends.length > 0 && (
          <p role="status" className="sr-only">
            {visibleFriends.length} friend{visibleFriends.length === 1 ? '' : 's'} found
          </p>
        )}
      </section>
    </section>
  )
}