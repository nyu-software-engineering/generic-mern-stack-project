import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import MapPreview from './MapPreview'
import { STYLES } from './editorData'
import { useEditor } from './editorContext'
import './EditorScreens.css'

export function EditorHeader() {
  const navigate = useNavigate()
  return (
    <header className="mm-header">
      <button className="mm-logo" onClick={() => navigate('/')}>Logo</button>
      <button onClick={() => navigate('/menu')}>Menu</button>
    </header>
  )
}

function EditorPanel({ title, map, children }) {
  return (
    <div className="mm-shell">
      <main className="mm-content">
        <EditorHeader />
        <h1 className="mm-map-title">{map.title || 'Untitled map'}</h1>
        <div className="mm-map-image"><MapPreview styleId={map.styleId} selectedCountries={map.selectedCountries} /></div>
        <section className="mm-panel" aria-label={title}>
          <h2>{title}</h2>
          {children}
        </section>
      </main>
    </div>
  )
}

export function StylePage() {
  const navigate = useNavigate()
  const { map, updateMap } = useEditor()
  const [styleId, setStyleId] = useState(map.styleId)
  return (
    <EditorPanel title="Style" map={{ ...map, styleId }}>
      <div className="mm-style-grid">
        {STYLES.map((style) => (
          <button key={style.id} className={styleId === style.id ? 'selected' : ''}
            aria-pressed={styleId === style.id} onClick={() => setStyleId(style.id)}>
            <MapPreview compact styleId={style.id} selectedCountries={map.selectedCountries} />
            {style.name}{styleId === style.id ? ' (Selected)' : ''}
          </button>
        ))}
      </div>
      <div className="mm-actions">
        <button onClick={() => navigate('/Map-Editor')}>Cancel</button>
        <button onClick={() => { updateMap({ styleId }); navigate('/Map-Editor') }}>Apply Style</button>
      </div>
    </EditorPanel>
  )
}

export function EditTextPage({ onRenameMap }) {
  const navigate = useNavigate()
  const { map, updateMap } = useEditor()
  const [draft, setDraft] = useState({
    title: map.title,
    subtitle: map.subtitle,
    legendLabels: [...map.legendLabels],
  })
  const [error, setError] = useState('')

  function save(event) {
    event.preventDefault()
    if (!draft.title.trim() || draft.legendLabels.some((label) => !label.trim())) {
      setError('Please complete the title and both legend labels.')
      return
    }
    updateMap({ ...draft, title: draft.title.trim(), legendLabels: draft.legendLabels.map((label) => label.trim()) })
    onRenameMap?.(Number(map.id), draft.title.trim())
    navigate('/Map-Editor')
  }

  return (
    <EditorPanel title="Edit text" map={{ ...map, ...draft }}>
      <form className="mm-edit-form" onSubmit={save}>
        <label htmlFor="mm-title">Title</label>
        <input id="mm-title" required maxLength={80} value={draft.title}
          onChange={(event) => setDraft({ ...draft, title: event.target.value })} />
        <label htmlFor="mm-subtitle">Subtitle (optional)</label>
        <input id="mm-subtitle" maxLength={160} value={draft.subtitle}
          onChange={(event) => setDraft({ ...draft, subtitle: event.target.value })} />
        {draft.legendLabels.map((label, index) => (
          <div key={index}>
            <label htmlFor={`mm-legend-${index}`}>Legend label {index + 1}</label>
            <input id={`mm-legend-${index}`} required maxLength={48} value={label}
              onChange={(event) => setDraft({ ...draft, legendLabels: draft.legendLabels.map((item, i) => i === index ? event.target.value : item) })} />
          </div>
        ))}
        {error && <p role="alert" className="mm-error">{error}</p>}
        <div className="mm-actions">
          <button type="button" onClick={() => navigate('/Map-Editor')}>Cancel</button>
          <button type="submit">Save</button>
        </div>
      </form>
    </EditorPanel>
  )
}

export function SourcesPage() {
  const navigate = useNavigate()
  const { map } = useEditor()
  return (
    <EditorPanel title="Sources" map={map}>
      <h3>Natural Earth</h3>
      <p>World country boundaries from the 1:110m Admin 0 Countries dataset (public domain). Highlighted countries are chosen by the user.</p>
      <a href="https://www.naturalearthdata.com/downloads/110m-cultural-vectors/110m-admin-0-countries/"
        target="_blank" rel="noopener noreferrer">View original map data</a>
      <div className="mm-actions"><button onClick={() => navigate('/Map-Editor')}>Close</button></div>
    </EditorPanel>
  )
}
