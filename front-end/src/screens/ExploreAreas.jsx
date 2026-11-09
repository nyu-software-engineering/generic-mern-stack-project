import { useEffect, useState } from 'react'
import Card from '../components/ui/Card.jsx'
import PercentChange from '../components/ui/PercentChange.jsx'
import ScreenTitle from '../components/ui/ScreenTitle.jsx'
import SectionTitle from '../components/ui/SectionTitle.jsx'
import { getAreas } from '../data/api.js'
import { formatRent } from '../data/format.js'

const POPULAR_AREA_IDS = ['upper-west-side', 'astoria', 'williamsburg']

// Matches a typed area name, borough or ZIP code, and also a full address that mentions
// the area or one of its ZIP codes, e.g. "31-18 30th Ave, Astoria" or "88 Wilson Ave, NY 11237".
function matchesSearch(area, search) {
  const text =
    `${area.name} ${area.borough} ${area.zipCodes.join(' ')}`.toLowerCase()
  if (text.includes(search)) {
    return true
  }
  return (
    search.includes(area.name.toLowerCase()) ||
    area.zipCodes.some(zipCode => search.includes(zipCode))
  )
}

export default function ExploreAreas() {
  const [areas, setAreas] = useState([])
  const [query, setQuery] = useState('')

  useEffect(() => {
    getAreas().then(setAreas)
  }, [])

  const search = query.trim().toLowerCase()
  const popularAreas = POPULAR_AREA_IDS.map(id =>
    areas.find(area => area.id === id),
  ).filter(Boolean)
  const shownAreas = search
    ? areas.filter(area => matchesSearch(area, search))
    : popularAreas

  return (
    <div>
      <ScreenTitle title="Explore areas" />

      <input
        type="search"
        value={query}
        onChange={event => setQuery(event.target.value)}
        placeholder="Search area or address"
        aria-label="Search areas"
        className="mb-8 w-full border border-ink bg-surface px-3 py-3 text-base placeholder:text-muted focus:outline-none"
      />

      {!search && <SectionTitle>Popular areas</SectionTitle>}

      {search && shownAreas.length === 0 && (
        <p className="text-sm text-muted">No areas match your search.</p>
      )}

      <ul className="space-y-3">
        {shownAreas.map(area => (
          <li key={area.id}>
            <Card to={`/areas/${area.id}`}>
              <p className="font-semibold">{area.name}</p>
              <p className="text-sm text-ink">
                <PercentChange value={area.changePastYear} /> this year · avg{' '}
                {formatRent(area.averageRent)}/month
              </p>
            </Card>
          </li>
        ))}
      </ul>
    </div>
  )
}
