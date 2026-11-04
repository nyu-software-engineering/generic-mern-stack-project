import { useEffect, useId, useRef } from 'react'
import { DEADLINES, DEFAULT_FILTERS, JOB_TYPES } from '../jobs/browse.js'
import './JobFilters.css'

export default function JobFilters({ filters, onFiltersChange, locationOptions = [], resultCount, onClose }) {
  const dialogRef = useRef(null)
  const titleId = useId()
  const locations = filters.locations ?? []

  useEffect(() => {
    const dialog = dialogRef.current
    const previousFocus = document.activeElement
    const previousOverflow = document.body.style.overflow
    dialog.showModal()
    document.body.style.overflow = 'hidden'
    return () => {
      dialog.close()
      document.body.style.overflow = previousOverflow
      if (previousFocus?.isConnected) previousFocus.focus()
    }
  }, [])

  function toggleType(value) {
    const types = filters.jobTypes
    onFiltersChange({
      ...filters, jobTypes: types.includes(value) ? types.filter((type) => type !== value) : [...types, value],
    })
  }

  function toggleLocation(value) {
    const selected = locations.find((location) => location.trim().toLowerCase() === value.toLowerCase())
    onFiltersChange({ ...filters, locations: selected === undefined ? [...locations, value] : locations.filter((location) => location !== selected) })
  }

  function closeFromBackdrop(event) {
    if (event.target !== event.currentTarget) return
    const rect = event.currentTarget.getBoundingClientRect()
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) {
      onClose()
    }
  }

  return (
    <dialog className="job-filters" ref={dialogRef} aria-labelledby={titleId}
      onCancel={(event) => { event.preventDefault(); onClose() }} onClick={closeFromBackdrop}>
      <div className="filter-sheet">
        <header className="filter-sheet-header">
          <h2 id={titleId}>Filters</h2>
          <button type="button" className="ui-button ui-button-secondary" onClick={onClose} aria-label="Close filters">Close</button>
        </header>
        <div className="filter-sheet-body">
          <p className="filter-help">Results update as you choose. Close to keep your selections.</p>
          <fieldset>
            <legend>Job type</legend>
            <div className="filter-choices">
              {JOB_TYPES.map(({ value, label }) => (
                <label className="filter-choice" key={value}>
                  <input type="checkbox" checked={filters.jobTypes.includes(value)} onChange={() => toggleType(value)} />
                  <span>{label}</span>
                </label>
              ))}
            </div>
          </fieldset>
          <fieldset>
            <legend>Location</legend>
            <div className="filter-choices">
              {locationOptions.map((location) => (
                <label className="filter-choice" key={location}>
                  <input type="checkbox" checked={locations.some((value) => value.trim().toLowerCase() === location.toLowerCase())}
                    onChange={() => toggleLocation(location)} />
                  <span>{location}</span>
                </label>
              ))}
            </div>
          </fieldset>
          <fieldset>
            <legend>Visa sponsorship</legend>
            <label className="filter-choice">
              <input type="checkbox" checked={filters.sponsorsOnly}
                onChange={(event) => onFiltersChange({ ...filters, sponsorsOnly: event.target.checked })} />
              <span>Only show roles that sponsor visas</span>
            </label>
          </fieldset>
          <div className="filter-deadline">
            <label htmlFor={`${titleId}-deadline`}>Application deadline</label>
            <select className="ui-field" id={`${titleId}-deadline`} value={filters.deadlineDays ?? ''}
              onChange={(event) => onFiltersChange({ ...filters, deadlineDays: event.target.value ? Number(event.target.value) : null })}>
              {DEADLINES.map(({ value, label }) => <option key={value ?? 'any'} value={value ?? ''}>{label}</option>)}
            </select>
          </div>
          <button type="button" className="ui-button ui-button-secondary" onClick={() => onFiltersChange(DEFAULT_FILTERS)}>Clear all</button>
        </div>
        <footer className="filter-sheet-footer">
          <p className="visually-hidden" role="status">{resultCount} matching opportunities</p>
          <button type="button" className="ui-button" onClick={onClose}>
            Show {resultCount} {resultCount === 1 ? 'Result' : 'Results'}
          </button>
        </footer>
      </div>
    </dialog>
  )
}
