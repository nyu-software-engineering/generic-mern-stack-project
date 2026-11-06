import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { categoryColors, hasValidCoordinates } from './mapPresentation'
import './PlaceMap.css'

const tileUrl = import.meta.env.VITE_MAP_TILE_URL || 'https://tile.openstreetmap.org/{z}/{x}/{y}.png'
const tileAttribution = import.meta.env.VITE_MAP_ATTRIBUTION
  || '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'

export default function PlaceMap({ places, center, label }) {
  const containerRef = useRef(null)
  const mapRef = useRef(null)
  const tilesRef = useRef(null)
  const previewRef = useRef(null)
  const [selectedId, setSelectedId] = useState(null)
  const [tileError, setTileError] = useState(false)
  const selected = places.find((place) => place.id === selectedId)
  const previewId = selected?.id
  const unlocated = places.filter((place) => !hasValidCoordinates(place.coordinates))
  const centerLat = hasValidCoordinates(center) ? center.lat : 20
  const centerLng = hasValidCoordinates(center) ? center.lng : 0

  useEffect(() => {
    if (previewId) previewRef.current?.scrollIntoView?.({ block: 'nearest' })
  }, [previewId])

  useEffect(() => {
    const map = L.map(containerRef.current, { scrollWheelZoom: false })
    mapRef.current = map
    const tiles = L.tileLayer(tileUrl, { attribution: tileAttribution, maxZoom: 19 })
    tiles.on('tileerror', () => setTileError(true))
    tiles.addTo(map)
    tilesRef.current = tiles
    map.on('click', () => setSelectedId(null))
    const observer = typeof ResizeObserver !== 'undefined'
      ? new ResizeObserver(() => map.invalidateSize({ pan: false }))
      : null
    observer?.observe(containerRef.current)
    return () => {
      observer?.disconnect()
      tiles.off()
      map.remove()
      mapRef.current = null
      tilesRef.current = null
    }
  }, [])

  useEffect(() => {
    const map = mapRef.current
    const markers = L.layerGroup().addTo(map)
    const points = []
    places.forEach((place) => {
      if (!hasValidCoordinates(place.coordinates)) return
      const point = [place.coordinates.lat, place.coordinates.lng]
      points.push(point)
      const pin = document.createElement('span')
      pin.className = 'place-map-pin'
      pin.style.backgroundColor = categoryColors[place.categoryId] ?? categoryColors.other
      pin.textContent = place.categoryLabel?.slice(0, 1) || '•'
      pin.setAttribute('aria-hidden', 'true')
      const title = `${place.name} — ${place.categoryLabel}`
      const marker = L.marker(point, {
        icon: L.divIcon({ className: 'place-map-marker', html: pin, iconSize: [36, 44], iconAnchor: [18, 42] }),
        title,
        keyboard: true,
      }).addTo(markers)
      marker.getElement()?.setAttribute('aria-label', title)
      marker.on('click', () => setSelectedId(place.id))
      marker.on('keydown', ({ originalEvent }) => {
        if (originalEvent.key === 'Enter' || originalEvent.key === ' ') {
          L.DomEvent.stop(originalEvent)
          setSelectedId(place.id)
        }
      })
    })
    if (points.length) {
      map.fitBounds(points, { padding: [36, 48], maxZoom: 15, animate: false })
    } else {
      map.setView([centerLat, centerLng], 12, { animate: false })
    }
    return () => {
      markers.eachLayer((marker) => marker.off())
      markers.remove()
    }
  }, [places, centerLat, centerLng])

  return (
    <div className="place-map">
      <p className="place-map-hint">Select a pin to preview a place. Use + / − to zoom.</p>
      <div ref={containerRef} className="place-map-canvas" role="region" aria-label={`${label} places map`} />
      {tileError && (
        <div className="place-map-warning" role="status">
          <p>The map background couldn’t load. You can still select pins or use List view.</p>
          <button type="button" onClick={() => { setTileError(false); tilesRef.current?.redraw() }}>Retry map background</button>
        </div>
      )}
      {places.length === 0 && <p className="place-map-message">No places to show on this map.</p>}
      {unlocated.length > 0 && (
        <div className="place-map-warning">
          <p>{unlocated.length} {unlocated.length === 1 ? 'place has' : 'places have'} no map location yet:</p>
          {unlocated.map((place) => <Link key={place.id} to={`/place/${place.id}`}>{place.name}</Link>)}
        </div>
      )}
      {selected && (
        <section ref={previewRef} className="place-map-preview" aria-label="Selected place" aria-live="polite">
          <div className="place-map-preview-top">
            <p className="place-map-category">{selected.categoryLabel}</p>
            <button type="button" aria-label="Close place preview" onClick={() => setSelectedId(null)}>×</button>
          </div>
          <h2>{selected.name}</h2>
          <p>{selected.neighborhood}</p>
          <p>{selected.tally['must-go']} must-go · {selected.tally.down} down · {selected.tally.pass} pass</p>
          <Link className="place-map-detail" to={`/place/${selected.id}`}>View place details →</Link>
        </section>
      )}
    </div>
  )
}
