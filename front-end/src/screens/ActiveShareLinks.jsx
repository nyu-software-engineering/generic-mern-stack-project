import { useEffect, useState } from 'react'
import { useLocation } from 'react-router'
import ScreenTitle from '../components/ui/ScreenTitle.jsx'
import Toggle from '../components/ui/Toggle.jsx'
import { getShareLinks } from '../data/api.js'
import { formatDate } from '../data/format.js'

export default function ActiveShareLinks() {
  const { state } = useLocation()
  const newLink = state?.newLink
  const [links, setLinks] = useState([])

  // Load saved links and place a new one at the top.
  useEffect(() => {
    getShareLinks().then((savedLinks) => {
      setLinks(newLink ? [newLink, ...savedLinks] : savedLinks)
    })
  }, [newLink])

  // Update a link when its switch changes.
  const setLinkActive = (linkId, active) => {
    setLinks(links.map((link) => (link.id === linkId ? { ...link, active } : link)))
  }

  // Count the links that are currently on.
  const activeCount = links.filter((link) => link.active).length

  return (
    <div>
      {/* Show the number of active links. */}
      <ScreenTitle
        title="Active share links"
        subtitle={`${activeCount} of ${links.length} links on. Turn a link off and the landlord can no longer see your report.`}
      />

      {/* List each link with its details and switch. */}
      <ul className="space-y-3">
        {links.map((link) => (
          <li
            key={link.id}
            className={`border border-line p-4 ${link.active ? 'bg-surface' : 'bg-canvas'}`}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className={`font-semibold ${link.active ? 'text-ink' : 'text-muted'}`}>
                  {link.sharedWith ?? 'New link'}
                </p>
                <p className="truncate font-mono text-xs text-muted">{link.url}</p>
                <p className="mt-1 text-xs text-muted">
                  Created {formatDate(link.createdOn)}
                </p>
              </div>

              {/* Let the renter turn this link on or off. */}
              <div className="flex flex-col items-end gap-1">
                <Toggle
                  checked={link.active}
                  onChange={(value) => setLinkActive(link.id, value)}
                  label={`Share link ${link.url}`}
                />
                <span className={`text-xs font-semibold ${link.active ? 'text-positive' : 'text-muted'}`}>
                  {link.active ? 'On' : 'Off'}
                </span>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}