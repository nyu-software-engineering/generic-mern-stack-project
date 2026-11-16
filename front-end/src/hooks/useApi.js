import { useCallback, useEffect, useState } from 'react'

// same loading/error/retry logic Home.jsx had, pulled out so every page can use it
//
// usage:
//   const { data, loading, error, retry } = useApi(getConfig)
//   const { data, loading, error, retry } = useApi((opts) => getPlace(placeId, opts), [placeId])
//
// setData is there so you can update the page after a POST/PATCH without refetching
export function useApi(load, deps = []) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    // cancels the request if the user leaves the page before it finishes
    const controller = new AbortController()
    setLoading(true)
    setError(null)

    load({ signal: controller.signal })
      .then((result) => {
        if (!controller.signal.aborted) setData(result)
      })
      .catch((err) => {
        // AbortError means we cancelled on purpose, not an actual error
        if (err.name !== 'AbortError' && !controller.signal.aborted) setError(err)
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false)
      })

    return () => controller.abort()
  }, [...deps, reloadKey]) // eslint-disable-line react-hooks/exhaustive-deps

  // bumping reloadKey reruns the effect
  const retry = useCallback(() => setReloadKey((key) => key + 1), [])

  return { data, loading, error, retry, setData }
}