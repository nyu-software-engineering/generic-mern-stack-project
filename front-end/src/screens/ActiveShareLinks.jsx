import { useEffect, useState } from 'react'
import ScreenTitle from '../components/ui/ScreenTitle.jsx'
import Toggle from '../components/ui/Toggle.jsx'
import { formatDate } from '../data/format.js'
import { getShareLinks, saveShareLinks } from '../data/api.js'

export default function ActiveShareLinks() {
  const [links, setLinks] = useState([])

  // Load the saved links when the screen opens.
  useEffect(() => {
    getShareLinks().then(setLinks)
  }, [])

  // Save changes to the links in this browser.
  const updateLinks = (updatedLinks) => {
    setLinks(updatedLinks)
    saveShareLinks(updatedLinks)
  }

  // Update a link when its switch changes.
  const setLinkActive = (linkId, active) => {
    updateLinks(links.map((link) => (link.id === linkId ? { ...link, active } : link)))
  }

  // Save the name as it is edited.
  const setLinkName = (linkId, sharedWith) => {
    updateLinks(links.map((link) => (link.id === linkId ? { ...link, sharedWith } : link)))
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
      <p className="mb-4 text-sm text-muted">Click a link name below to rename it.</p>

      {/* List each link with its details and switch. */}
      <ul className="space-y-3">
        {links.map((link) => (
          <li
            key={link.id}
            className={`border border-line p-4 ${link.active ? 'bg-surface' : 'bg-canvas'}`}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <input
                  type="text"
                  value={link.sharedWith ?? ''}
                  onChange={(event) => setLinkName(link.id, event.target.value)}
                  placeholder="Name this link"
                  aria-label={`Name for share link ${link.url}`}
                  className={`mb-1 w-full border-b border-line bg-transparent pb-1 font-semibold outline-none focus:border-accent ${
                    link.active ? 'text-ink' : 'text-muted'
                  }`}
                />
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