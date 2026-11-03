import { useState } from 'react'
import { useNavigate } from 'react-router'
import Button from './ui/Button.jsx'
import { addShareLink } from '../data/api.js'

// Create a short ID for the new link.
function createLinkId() {
  return crypto.randomUUID().replaceAll('-', '').slice(0, 12)
}

export default function SharePopup({ onClose }) {
  const navigate = useNavigate()
  const [linkName, setLinkName] = useState('')
  const [copyStatus, setCopyStatus] = useState('idle')

  // Make a new link when the popup opens.
  const [link] = useState(() => {
    const id = createLinkId()

    return {
      id,
      url: `${window.location.origin}/r/${id}`,
      createdOn: new Date().toISOString().slice(0, 10),
      active: true,
    }
  })

  // Save the named link, then copy its URL.
  const copyLink = async () => {
    const linkToSave = { ...link, sharedWith: linkName.trim() }

    try {
      await addShareLink(linkToSave)
      await navigator.clipboard.writeText(link.url)
      setCopyStatus('copied')
    } catch {
      setCopyStatus('failed')
    }
  }

  // Open the saved links screen.
  const goToShareLinks = () => {
    navigate('/share-links')
  }

  return (
    <div
      className="fixed inset-0 z-40 mx-auto flex w-full max-w-md flex-col justify-end bg-ink/60"
      role="dialog"
      aria-label="Share your report"
    >
      <div className="absolute inset-x-0 bottom-0 z-50 mx-auto w-full max-w-md border-t border-line bg-white px-5 pt-6 pb-8 text-ink shadow-xl">
        <h2 className="text-xl font-semibold tracking-tight">Share your report</h2>
        <p className="mt-1 text-sm text-muted">
          Anyone with this private link can see the sections you chose. You can turn it off any time.
        </p>

        {/* Name the link before copying it. */}
        <label htmlFor="share-link-name" className="mt-5 block text-sm font-semibold">
          Name this link
        </label>
        <input
          id="share-link-name"
          type="text"
          value={linkName}
          onChange={(event) => setLinkName(event.target.value)}
          placeholder="For example, Astoria application"
          className="mt-1 w-full border border-line bg-surface px-3 py-3 text-sm text-ink"
        />

        {/* Show the link so it can be copied manually too. */}
        <p className="mt-4 break-all border border-line bg-canvas px-3 py-3 font-mono text-sm select-all">
          {link.url}
        </p>

        {/* Confirm when the link has been copied. */}
        {copyStatus === 'copied' && (
          <p
            className="mt-3 border border-positive px-3 py-2 text-sm font-semibold text-positive"
            role="status"
          >
            ✓ Link copied. Paste it into your message to the landlord.
          </p>
        )}

        {/* Explain what to do if copying is unavailable. */}
        {copyStatus === 'failed' && (
          <p className="mt-3 text-sm text-negative" role="status">
            Couldn&apos;t copy automatically. Select the link above and copy it.
          </p>
        )}

        {/* Show the next action after the link is copied. */}
        <div className="mt-5 space-y-3">
          {copyStatus === 'copied' ? (
            <Button onClick={goToShareLinks}>See active share links</Button>
          ) : (
            <Button onClick={copyLink} disabled={!linkName.trim()}>
              Copy link
            </Button>
          )}
          <Button onClick={onClose} variant="secondary">
            Close
          </Button>
        </div>
      </div>
    </div>
  )
}