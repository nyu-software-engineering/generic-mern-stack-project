import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import MapPreview from './map-editor/MapPreview'
import { EditorHeader } from './map-editor/EditorScreens'
import { STYLES } from './map-editor/editorData'
import { useEditor } from './map-editor/editorContext'
import './Map-Editor.css'

async function exportPng(svg, map, colors) {
  const copy = svg.cloneNode(true)
  copy.setAttribute('width', '840')
  copy.setAttribute('height', '450')
  const url = URL.createObjectURL(new Blob([new XMLSerializer().serializeToString(copy)], { type: 'image/svg+xml' }))

  try {
    const image = new Image()
    image.src = url
    await image.decode()
    const canvas = document.createElement('canvas')
    canvas.width = 1400
    canvas.height = 900
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('Canvas unavailable')
    ctx.fillStyle = 'white'
    ctx.fillRect(0, 0, 1400, 900)
    ctx.fillStyle = '#222'
    ctx.font = 'bold 34px Arial'
    ctx.fillText(map.title, 40, 54, 1320)
    ctx.drawImage(image, 40, 90, 1320, 707)
    ctx.font = '21px Arial'
    map.legendLabels.forEach((label, i) => {
      const x = 40 + i * 670
      ctx.fillStyle = i ? colors.land : colors.highlight
      ctx.fillRect(x, 830, 22, 22)
      ctx.fillStyle = '#222'
      ctx.fillText(label, x + 34, 849, 600)
    })
    const link = document.createElement('a')
    link.href = canvas.toDataURL('image/png')
    link.download = (map.title.toLowerCase().replace(/[^a-z0-9]+/g, '-') || 'map') + '.png'
    link.click()
  } finally {
    URL.revokeObjectURL(url)
  }
}

export default function MapEditor({ onRenameMap }) {
  const navigate = useNavigate()
  const location = useLocation()
  const { map, openMap, updateMap } = useEditor()
  const [instruction, setInstruction] = useState('')
  const [message, setMessage] = useState('')
  const mapRef = useRef(null)
  const colors = STYLES.find(({ id }) => id === map.styleId) || STYLES[0]

  useEffect(() => { if (location.state?.map) openMap(location.state.map) }, [location.state?.map, openMap])

  function toggleCountry(id) {
    const selected = map.selectedCountries
    updateMap({ selectedCountries: selected.includes(id) ? selected.filter((item) => item !== id) : [...selected, id] })
  }

  function submitInstruction(event) {
    event.preventDefault()
    const command = instruction.trim()
    const title = command.match(/^title\s*:\s*(.+)$/i)
    const color = /green|forest/i.test(command) ? 'forest'
      : /pink|pastel|rose/i.test(command) ? 'blush'
        : /gray|grey|slate/i.test(command) ? 'slate'
          : /blue|atlas/i.test(command) ? 'atlas' : null

    if (title) {
      const newTitle = title[1].trim().slice(0, 80)
      updateMap({ title: newTitle })
      onRenameMap?.(Number(map.id), newTitle)
    }
    else if (color) updateMap({ styleId: color })
    else setMessage('Try "title: My map" or "make it green".')
    setInstruction('')
  }

  async function download() {
    try {
      await exportPng(mapRef.current, map, colors)
      setMessage('Map downloaded as PNG.')
    } catch {
      setMessage('Export failed. Please try again.')
    }
  }

  return (
    <div className="mm-shell">
      <main className="mm-content">
        <EditorHeader />
        <h1 className="mm-map-title">{map.title}</h1>
        <div className="mm-editor-map-art">
          <MapPreview svgRef={mapRef} interactive styleId={map.styleId} selectedCountries={map.selectedCountries}
            onToggleCountry={toggleCountry} onClearSelection={() => updateMap({ selectedCountries: [] })} />
        </div>
        <div className="mm-editor-legend">
          {map.legendLabels.map((label, i) => (
            <div key={i}><span className="mm-editor-swatch" style={{ background: i ? colors.land : colors.highlight }} />{label}</div>
          ))}
        </div>
        <div className="mm-editor-tools">
          <button onClick={() => navigate('/style')}>Style</button>
          <button onClick={() => navigate('/source')}>Source</button>
          <button onClick={() => navigate('/edit-text')}>Edit text</button>
          <button className="mm-editor-export" onClick={download}>Export</button>
        </div>
        <form className="mm-editor-prompt" onSubmit={submitInstruction}>
          <label className="mm-visually-hidden" htmlFor="mm-instruction">Map change instruction</label>
          <input id="mm-instruction" placeholder="Tell MapMaker what to change..." value={instruction}
            onChange={(event) => setInstruction(event.target.value)} maxLength={180} />
          <button disabled={!instruction.trim()}>Send</button>
        </form>
        {message && <p className="mm-editor-notice" role="status">{message} <button aria-label="Dismiss message" onClick={() => setMessage('')}>×</button></p>}
      </main>
    </div>
  )
}
