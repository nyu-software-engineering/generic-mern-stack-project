import { useEffect, useState } from 'react'
import { Outlet } from 'react-router-dom'
import { loadMockData } from '../services/mockDataService.js'

function MockData() {
  const [status, setStatus] = useState('loading')
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    let current = true
    loadMockData().then(
      () => { if (current) setStatus('ready') },
      () => { if (current) setStatus('error') },
    )
    return () => { current = false }
  }, [attempt])

  if (status === 'ready') return <Outlet />

  return (
    <main className="page">
      {status === 'loading' ? <p role="status">Loading data...</p> : <>
        <p role="alert">Could not load listings and rentals.</p>
        <button type="button" className="primary-button" onClick={() => {
          setStatus('loading')
          setAttempt((value) => value + 1)
        }}>Try again</button>
      </>}
    </main>
  )
}

export default MockData
