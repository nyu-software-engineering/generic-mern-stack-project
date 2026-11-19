import { useContext, useState } from 'react'
import { SavedItemsContext } from '../context/SavedItemsContext.js'
import Icon from './Icon.jsx'
import './SaveListingButton.css'

export function SavedItemsStatus() {
  const { savedListings, loadError, retry } = useContext(SavedItemsContext)

  if (loadError) {
    return (
      <div className="ds-feedback ds-feedback--error">
        <p role="alert">Could not load saved items. {loadError.message}</p>
        <button className="ds-button ds-button--secondary" type="button" onClick={retry}>Retry saved items</button>
      </div>
    )
  }
  return savedListings === null ? <p className="ds-status" role="status">Loading saved items...</p> : null
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
        className="ds-button ds-button--secondary ds-save-button"
        type="button"
        aria-label={compact ? `${action} ${listing.title}` : `${action} item: ${listing.title}`}
        aria-pressed={saved}
        aria-busy={saving}
        disabled={savedListings === null || saving}
        onClick={toggleSaved}
      >
        <Icon name="heart" size={18} />
        {compact ? action : `${action} item`}
      </button>
      {error && <p className="ds-save-error" role="alert">Could not update saved item. {error.message}</p>}
    </>
  )
}
