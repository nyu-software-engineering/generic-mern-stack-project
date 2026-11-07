import { useId, useRef, useState } from 'react'
import { geoGraticule10, geoNaturalEarth1, geoPath } from 'd3-geo'
import countries from './countries-110m.json'
import { STYLES } from './editorData'

const W = 840, H = 450
const projection = geoNaturalEarth1().fitExtent([[10, 18], [830, 432]], countries)
const path = geoPath(projection)
const borders = countries.features.map((country) => ({
  id: country.id, name: country.properties.name, d: path(country),
}))
const graticule = path(geoGraticule10())
const clamp = (value, min, max) => Math.max(min, Math.min(max, value))

export default function MapPreview({ styleId, selectedCountries = [], interactive = false, onToggleCountry, onClearSelection, svgRef }) {
  const colors = STYLES.find((style) => style.id === styleId) || STYLES[0]
  const selected = new Set(selectedCountries)
  const clipId = useId()
  const [view, setView] = useState({ zoom: 1, x: 0, y: 0 })
  const [hovered, setHovered] = useState('')
  const pointer = useRef(null)
  const dragged = useRef(false)

  function zoomBy(amount) {
    setView((v) => {
      const zoom = clamp(v.zoom + amount, 1, 5)
      return { zoom, x: clamp(v.x, -(zoom - 1) * W / 2, (zoom - 1) * W / 2), y: clamp(v.y, -(zoom - 1) * H / 2, (zoom - 1) * H / 2) }
    })
  }

  function onPointerDown(event) {
    if (!interactive || event.button !== 0) return
    dragged.current = false
    if (view.zoom === 1) return
    pointer.current = { startX: event.clientX, startY: event.clientY, x: view.x, y: view.y }
  }

  function onPointerMove(event) {
    if (!pointer.current || !(event.buttons & 1)) return
    const start = pointer.current
    const { width, height } = event.currentTarget.getBoundingClientRect()
    if (!width || !height) return
    const dx = (event.clientX - start.startX) * W / width
    const dy = (event.clientY - start.startY) * H / height
    if (Math.abs(dx) + Math.abs(dy) > 5) dragged.current = true
    setView((v) => ({ ...v,
      x: clamp(start.x + dx, -(v.zoom - 1) * W / 2, (v.zoom - 1) * W / 2),
      y: clamp(start.y + dy, -(v.zoom - 1) * H / 2, (v.zoom - 1) * H / 2),
    }))
  }

  const svg = (
    <svg ref={svgRef} className="mm-world-map" viewBox={`0 0 ${W} ${H}`} xmlns="http://www.w3.org/2000/svg"
      role={interactive ? 'group' : 'img'} aria-label={interactive ? 'Interactive world map: select a country' : 'World map'}
      onPointerDown={onPointerDown} onPointerMove={onPointerMove}
      onPointerUp={() => { pointer.current = null }} onPointerCancel={() => { pointer.current = null }}>
      <rect width={W} height={H} fill={colors.water} />
      <defs><clipPath id={clipId}><rect width={W} height={H} /></clipPath></defs>
      <g clipPath={`url(#${clipId})`}>
        <g transform={`translate(${view.x} ${view.y}) translate(${W / 2} ${H / 2}) scale(${view.zoom}) translate(${-W / 2} ${-H / 2})`}>
          <path d={graticule} stroke={colors.grid} fill="none" strokeWidth="0.8" />
          {borders.map((country) => (
            <path key={country.id} d={country.d} fill={selected.has(country.id) ? colors.highlight : colors.land}
              stroke={colors.border} strokeWidth="1" strokeLinejoin="round"
              className={interactive ? 'mm-country' : undefined}
              role={interactive ? 'button' : undefined} tabIndex={interactive ? 0 : undefined}
              aria-label={interactive ? country.name + (selected.has(country.id) ? ' (selected)' : '') : undefined}
              aria-pressed={interactive ? selected.has(country.id) : undefined}
              onPointerEnter={interactive ? () => setHovered(country.name) : undefined}
              onPointerLeave={interactive ? () => setHovered('') : undefined}
              onClick={interactive ? () => { if (!dragged.current) onToggleCountry(country.id) } : undefined}
              onKeyDown={interactive ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onToggleCountry(country.id) } } : undefined}>
              <title>{country.name}</title>
            </path>
          ))}
        </g>
      </g>
    </svg>
  )

  if (!interactive) return svg
  return (
    <div className="mm-interactive-map">
      {svg}
      <div className="mm-map-zoom">
        <button aria-label="Zoom in" disabled={view.zoom >= 5} onClick={() => zoomBy(0.7)}>+</button>
        <button aria-label="Zoom out" disabled={view.zoom <= 1} onClick={() => zoomBy(-0.7)}>−</button>
        <button aria-label="Reset zoom" onClick={() => setView({ zoom: 1, x: 0, y: 0 })}>Reset</button>
      </div>
      <div className="mm-map-help" role="status">
        <span>{hovered || 'Click a country to select it'} · {selected.size} selected</span>
        {!!selected.size && <button onClick={onClearSelection}>Clear selection</button>}
      </div>
    </div>
  )
}
