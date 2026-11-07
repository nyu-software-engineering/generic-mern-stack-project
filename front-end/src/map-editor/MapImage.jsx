import { useRef, useState } from 'react'

export default function MapImage({ asset, filter = 'none', interactive = false, imgRef }) {
  const [zoom, setZoom] = useState(1)
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const dragging = useRef(null)

  function changeZoom(amount) {
    const next = Math.max(1, Math.min(5, zoom + amount))
    setZoom(next)
    if (next === 1) setOffset({ x: 0, y: 0 })
  }

  function pointerDown(event) {
    if (!interactive || zoom === 1 || event.button !== 0) return
    dragging.current = { x: event.clientX - offset.x, y: event.clientY - offset.y }
    event.currentTarget.setPointerCapture(event.pointerId)
  }

  function pointerMove(event) {
    if (!dragging.current) return
    const limit = ((zoom - 1) * event.currentTarget.clientWidth) / 2
    const limitY = ((zoom - 1) * event.currentTarget.clientHeight) / 2
    const x = event.clientX - dragging.current.x
    const y = event.clientY - dragging.current.y
    setOffset({ x: Math.max(-limit, Math.min(limit, x)), y: Math.max(-limitY, Math.min(limitY, y)) })
  }

  return (
    <div className="mm-image-map">
      <div className="mm-image-viewport" onPointerDown={pointerDown} onPointerMove={pointerMove}
        onPointerUp={() => { dragging.current = null }} onPointerCancel={() => { dragging.current = null }}>
        <img ref={imgRef} crossOrigin="anonymous" src={asset.url || asset.thumbnail} draggable={false}
          alt={asset.title || 'Selected historical map'}
          style={{ transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom})`, filter }} />
      </div>
      {interactive && <div className="mm-map-help">
        <span>Zoom and drag to explore</span>
        <div className="mm-image-controls">
          <button type="button" aria-label="Zoom in" disabled={zoom >= 5} onClick={() => changeZoom(0.7)}>+</button>
          <button type="button" aria-label="Zoom out" disabled={zoom <= 1} onClick={() => changeZoom(-0.7)}>−</button>
          <button type="button" onClick={() => { setZoom(1); setOffset({ x: 0, y: 0 }) }}>Reset</button>
        </div>
      </div>}
    </div>
  )
}
