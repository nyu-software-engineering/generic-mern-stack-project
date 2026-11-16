import { useEffect, useRef, useState } from 'react'
import { Outlet } from 'react-router-dom'
import { getSavedListings, saveListing, unsaveListing } from '../services/savedItems.js'
import { SavedItemsContext } from './SavedItemsContext.js'

function SavedItemsProvider() {
  const [savedListings, setSavedListings] = useState(null)
  const [loadError, setLoadError] = useState(null)
  const [attempt, setAttempt] = useState(0)
  const pending = useRef(new Set())
  const [pendingIds, setPendingIds] = useState(() => new Set())

  useEffect(() => {
    let current = true
    getSavedListings().then(
      (listings) => { if (current) setSavedListings(listings) },
      (error) => { if (current) setLoadError(error) },
    )
    return () => { current = false }
  }, [attempt])

  function retry() {
    setLoadError(null)
    setAttempt((value) => value + 1)
  }

  async function setListingSaved(listingId, saved) {
    if (pending.current.has(listingId)) return
    pending.current.add(listingId)
    setPendingIds(new Set(pending.current))

    try {
      if (saved) {
        const listing = await saveListing(listingId)
        setSavedListings((current) =>
          current.some((item) => item.id === listingId) ? current : [...current, listing],
        )
      } else {
        await unsaveListing(listingId)
        setSavedListings((current) => current.filter((listing) => listing.id !== listingId))
      }
    } finally {
      pending.current.delete(listingId)
      setPendingIds(new Set(pending.current))
    }
  }

  return (
    <SavedItemsContext.Provider value={{ savedListings, loadError, retry, pendingIds, setListingSaved }}>
      <Outlet />
    </SavedItemsContext.Provider>
  )
}

export default SavedItemsProvider
