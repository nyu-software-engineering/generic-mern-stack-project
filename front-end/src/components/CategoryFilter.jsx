import { getPlaceCategories } from '../data/mockDataLayer'
import { categoryColors } from './mapPresentation'
import './PlaceMap.css'

export default function CategoryFilter({ value, onChange }) {
  const options = [{ id: 'all', label: 'All' }, ...getPlaceCategories()]
  return (
    <div className="place-category-filter" role="group" aria-label="Filter places by category">
      {options.map(({ id, label }) => (
        <button key={id} type="button" aria-pressed={value === id} onClick={() => onChange(id)}>
          {id !== 'all' && <span className="place-category-dot" style={{ backgroundColor: categoryColors[id] ?? categoryColors.other }} aria-hidden="true" />}
          {label}
        </button>
      ))}
    </div>
  )
}
