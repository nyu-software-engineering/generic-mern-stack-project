import { useCallback, useEffect, useState } from 'react'
import { fetchBooking } from '../../services/bookingsApi.js'

// Loads one booking from the API (#93). `run` performs a change (confirm, extend,
// cancel...) and swaps in the booking the API returns, tracking pending and error
// state so buttons can't be pressed twice while a request is in flight.
export function useBooking(bookingId) {
  const [booking, setBooking] = useState(null)
  const [loadError, setLoadError] = useState(null)
  const [attempt, setAttempt] = useState(0)
  const [pending, setPending] = useState(false)
  const [actionError, setActionError] = useState(null)

  useEffect(() => {
    let current = true
    fetchBooking(bookingId).then(
      (loaded) => { if (current) setBooking(loaded) },
      (error) => { if (current) setLoadError(error) },
    )
    return () => { current = false }
  }, [bookingId, attempt])

  const retry = () => {
    setLoadError(null)
    setAttempt((value) => value + 1)
  }

  const run = useCallback(async (action) => {
    setPending(true)
    setActionError(null)
    try {
      setBooking(await action())
      return true
    } catch (error) {
      setActionError(error)
      return false
    } finally {
      setPending(false)
    }
  }, [])

  return { booking, loadError, retry, pending, actionError, run }
}
