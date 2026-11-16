import { useContext, useState } from 'react'
import { SavedItemsContext } from '../context/SavedItemsContext.js'

export function SavedItemsStatus() {
  const { savedListings, loadError, retry } = useContext(SavedItemsContext)

  if (loadError) {
    return (
      <div>
        <p role="alert">Could not load saved items. {loadError.message}</p>
        <button type="button" onClick={retry}>Retry saved items</button>
      </div>
    )
  }
  return savedListings === null ? <p role="status">Loading saved items...</p> : null
}

export default function SaveListingButton({ listing, compact = false }) {
  const { savedListings, pendingIds, setListingSaved } = useContext(SavedItemsContext)
  const [error, setError] = useState(null)
  const saved = savedListings?.some((item) => item.id === listing.id) ?? false
  const saving = pendingIds.has(listing.id)
  const action = saved ? 'Unsave' : 'Save'

  async function toggleSaved() {
    setError(null)
    try {
      await setListingSaved(listing.id, !saved)
    } catch (requestError) {
      setError(requestError)
    }
  }

  return (
    <>
      <button
        type="button"
        aria-label={compact ? `${action} ${listing.title}` : `${action} item: ${listing.title}`}
        aria-pressed={saved}
        aria-busy={saving}
        disabled={savedListings === null || saving}
        onClick={toggleSaved}
      >
        {compact ? action : `${action} item`}
      </button>
      {error && <p role="alert">Could not update saved item. {error.message}</p>}
    </>
  )
}
