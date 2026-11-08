import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import MapPreview from './map-editor/MapPreview'
import MapImage from './map-editor/MapImage'
import { EditorHeader } from './map-editor/EditorScreens'
import { STYLES, IMAGE_STYLES } from './map-editor/editorData'
import { useEditor } from './map-editor/editorContext'
import './Map-Editor.css'

async function exportPng(svg, map, colors, rasterImage) {
  let url

  try {
    let image = rasterImage
    if (!map.asset) {
      const copy = svg.cloneNode(true)
      copy.setAttribute('width', '840')
      copy.setAttribute('height', '450')
      url = URL.createObjectURL(new Blob([new XMLSerializer().serializeToString(copy)], { type: 'image/svg+xml' }))
      image = new Image()
      image.src = url
      await image.decode()
    }
    if (!image?.naturalWidth) throw new Error('Image has not loaded yet')
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
    if (map.asset) {
      const ratio = Math.min(1320 / image.naturalWidth, 710 / image.naturalHeight)
      const width = image.naturalWidth * ratio
      const height = image.naturalHeight * ratio
      ctx.filter = IMAGE_STYLES.find((s) => s.id === map.imageStyle)?.filter || 'none'
      ctx.drawImage(image, 40 + (1320 - width) / 2, 90 + (710 - height) / 2, width, height)
      ctx.filter = 'none'
      ctx.font = '16px Arial'
      ctx.fillStyle = '#444'
      ctx.fillText(`${map.asset.provider} · ${map.asset.license} · ${map.asset.author}`, 40, 850, 1320)
      ctx.font = '13px Arial'
      ctx.fillText(map.asset.pageUrl, 40, 877, 1320)
    } else {
      ctx.drawImage(image, 40, 90, 1320, 707)
      ctx.font = '21px Arial'
      map.legendLabels.forEach((label, i) => {
        const x = 40 + i * 670
        ctx.fillStyle = i ? colors.land : colors.highlight
        ctx.fillRect(x, 830, 22, 22)
        ctx.fillStyle = '#222'
        ctx.fillText(label, x + 34, 849, 600)
      })
    }
    const link = document.createElement('a')
    link.href = canvas.toDataURL('image/png')
    link.download = (map.title.toLowerCase().replace(/[^a-z0-9]+/g, '-') || 'map') + '.png'
    link.click()
  } finally {
    if (url) URL.revokeObjectURL(url)
  }
}

export default function MapEditor({ onRenameMap }) {
  const navigate = useNavigate()
  const location = useLocation()
  const { map, openMap, updateMap } = useEditor()
  const [instruction, setInstruction] = useState('')
  const [message, setMessage] = useState('')
  const [exportOpen, setExportOpen] = useState(false)
  const mapRef = useRef(null)
  const imageRef = useRef(null)
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
    else if (/^(normal|revert|reset|original)(\s+(style|colou?rs|appearance))?$/i.test(command)) {
      updateMap(map.asset ? { imageStyle: 'original' } : { styleId: 'atlas' })
    }
    else if (map.asset) {
      if (/black.and.white|grayscale/i.test(command)) updateMap({ imageStyle: 'black-white' })
      else if (/warm|sepia/i.test(command)) updateMap({ imageStyle: 'warm' })
      else setMessage('Try "title: My map", "black and white", or "warm".')
    }
    else if (color) updateMap({ styleId: color })
    else setMessage('Try "title: My map" or "make it green".')
    setInstruction('')
  }

  async function download() {
    try {
      await exportPng(mapRef.current, map, colors, imageRef.current)
      setExportOpen(false)
      setMessage('Map downloaded as PNG.')
    } catch {
      setMessage('Export failed. Please try again.')
    }
  }


  return (
    <div className="mm-shell">
      <main className="mm-content">
        <EditorHeader />

        <div className="mm-editor-title-row">
          <h1 className="mm-map-title">{map.title}</h1>
          <button type="button" onClick={() => navigate('/edit-text')}>
            Edit
          </button>
        </div>

        <div className="mm-editor-map-art">
          {map.asset ? (
            <MapImage
              asset={map.asset}
              imgRef={imageRef}
              interactive
              filter={IMAGE_STYLES.find(
                (style) => style.id === map.imageStyle
              )?.filter}
            />
          ) : (
            <MapPreview
              svgRef={mapRef}
              interactive
              styleId={map.styleId}
              selectedCountries={map.selectedCountries}
              onToggleCountry={toggleCountry}
              onClearSelection={() => updateMap({ selectedCountries: [] })}
            />
          )}
        </div>

        {!map.asset && (
          <div className="mm-editor-legend">
            {map.legendLabels.map((label, i) => (
              <div key={i}>
                <span
                  className="mm-editor-swatch"
                  style={{ background: i ? colors.land : colors.highlight }}
                />
                {label}
              </div>
            ))}
          </div>
        )}

        <div className="mm-editor-tools">
          <button onClick={() => navigate('/style')}>Style</button>
          <button onClick={() => navigate('/source')}>Source</button>
          <button onClick={() => navigate('/edit-text')}>Edit Text</button>
          <button
            className="mm-editor-export"
            onClick={() => setExportOpen(true)}
          >
            Export
          </button>
        </div>

        <form className="mm-editor-prompt" onSubmit={submitInstruction}>
          <label className="mm-visually-hidden" htmlFor="mm-instruction">
            Map change instruction
          </label>
          <input
            id="mm-instruction"
            placeholder="Tell MapMaker what to change..."
            value={instruction}
            onChange={(event) => setInstruction(event.target.value)}
            maxLength={180}
          />
          <button disabled={!instruction.trim()}>Send</button>
        </form>

        {message && (
          <p className="mm-editor-notice" role="status">
            {message}
            <button onClick={() => setMessage('')}>×</button>
          </p>
        )}
      </main>

      {exportOpen && (
        <div className="mm-export-backdrop">
          <div
            className="mm-export-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="export-title"
          >
            <div className="mm-export-heading">
              <h2 id="export-title">Export Map</h2>
              <button
                type="button"
                onClick={() => setExportOpen(false)}
                aria-label="Close export"
              >
                X
              </button>
            </div>

            <label htmlFor="file-type">File Type:</label>

            <select id="file-type" defaultValue="png">
              <option value="png">PNG</option>
            </select>

            <div className="mm-export-actions">
              <button onClick={() => setExportOpen(false)}>
                Cancel
              </button>
              <button onClick={download}>
                Download
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )

}
