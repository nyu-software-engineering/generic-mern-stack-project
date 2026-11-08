import { useEffect, useState } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { cleanMapQuery, getDisplayImage, searchMaps } from './map-editor/mapCatalog'
import './MapSearch.css'

const EXAMPLES = ['Roman Empire 117', 'Europe 1914', 'Japan Edo period', 'New York 1860', 'World 1650', 'Africa 1890']

export default function MapSearch({ onChooseMap, onCreateMap }) {
  const navigate = useNavigate()
  const location = useLocation()
  const [params, setParams] = useSearchParams()
  const query = params.get('q') || ''
  const [input, setInput] = useState(query)
  const [results, setResults] = useState([])
  const [next, setNext] = useState(null)
  const [loading, setLoading] = useState(Boolean(query))
  const [refresh, setRefresh] = useState(0)
  const [error, setError] = useState('')
  const [selecting, setSelecting] = useState(null)

  useEffect(() => {
    if (!query.trim()) return
    const controller = new AbortController()
    Promise.resolve().then(() => {
      if (controller.signal.aborted) return null
      setInput(query)
      setLoading(true)
      return searchMaps(query, null, controller.signal)
    }).then((data) => {
      if (!data) return
      setResults(data.results)
      setNext(data.next)
      setError('')
    }).catch((err) => {
      if (!controller.signal.aborted) setError(err.message)
    }).finally(() => {
      if (!controller.signal.aborted) setLoading(false)
    })
    return () => controller.abort()
  }, [query, refresh])

  function submit(event) {
    event.preventDefault()
    const value = cleanMapQuery(input)
    if (!value) return
    if (value === query) { setRefresh((n) => n + 1); return }
    setResults([])
    setNext(null)
    setError('')
    setLoading(true)
    setParams({ q: value })
  }

  async function more() {
    if (!next || loading) return
    setLoading(true)
    try {
      const data = await searchMaps(query, next)
      setResults((old) => [...old, ...data.results.filter((item) => !old.some((o) => o.pageId === item.pageId))])
      setNext(data.next)
      setError('')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function choose(result) {
    setSelecting(result.pageId)
    const url = await getDisplayImage(result)
    const map = onChooseMap({ ...result, url })
    navigate('/Map-Editor', { state: { map } })
  }

  return (
    <main className="map-search">
      <button onClick={() => navigate('/menu', {
        state: { backgroundLocation: location }
      })}>
        Menu
      </button>
      <h1>Find a map</h1>
      <form className="map-search-form" onSubmit={submit}>
        <input aria-label="Search maps" value={input} placeholder="e.g. Europe in 1914" onChange={(event) => setInput(event.target.value)} required />
        <button type="submit">Search</button>
      </form>
      <div className="map-search-examples">
        {EXAMPLES.map((example) => (
          <button key={example} onClick={() => {
            setInput(example)
            if (example === query) return
            setResults([]); setNext(null); setError(''); setLoading(true); setParams({ q: example })
          }}>{example}</button>
        ))}
      </div>
      <p className="map-search-hint">Choose an existing map, or start with an editable world map.</p>
      <button onClick={() => navigate('/Map-Editor', { state: { map: onCreateMap('World map') } })}>Start with editable world map</button>

      {loading && <p role="status">Searching maps...</p>}
      {error && <p role="alert">{error}</p>}
      {!loading && query && !error && !results.length && <p>No maps found. Try a broader place, time period, or topic.</p>}

      <div className="map-search-results">
        {results.map((result) => (
          <article className="map-search-card" key={result.pageId}>
            <img src={result.thumbnail} alt={result.title} loading="lazy" />
            <h2>{result.title}</h2>
            <div className="map-search-actions">
              <a href={result.pageUrl} target="_blank" rel="noopener noreferrer">Source</a>
              <button disabled={selecting !== null} onClick={() => choose(result)}>
                {selecting === result.pageId ? 'Opening...' : 'Use this map'}
              </button>
            </div>
          </article>
        ))}
      </div>
      {next && <button className="map-search-more" disabled={loading} onClick={more}>Load more maps</button>}
    </main>
  )
}
