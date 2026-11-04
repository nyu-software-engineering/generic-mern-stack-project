import { useEffect, useState } from 'react'
import Card from '../components/ui/Card.jsx'
import PercentChange from '../components/ui/PercentChange.jsx'
import ScreenTitle from '../components/ui/ScreenTitle.jsx'
import SectionTitle from '../components/ui/SectionTitle.jsx'
import { getAreas } from '../data/api.js'

function matchesSearch(area, search) {
  const text = `${area.name} ${area.borough} ${area.zipCodes.join(' ')}`.toLowerCase()
  return text.includes(search)
}

export default function ExploreAreas() {
  const [areas, setAreas] = useState([])
  const [query, setQuery] = useState('')

  useEffect(() => {
    getAreas().then(setAreas)
  }, [])

  const search = query.trim().toLowerCase()
  const shownAreas = search ? areas.filter((area) => matchesSearch(area, search)) : areas.filter((area) => area.popular)

  return (
    <div>
      <ScreenTitle title="Explore areas" subtitle="See how rents are moving before you start looking." />

      <input
        type="search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Search an area or ZIP code"
        aria-label="Search areas"
        className="mb-6 w-full border border-ink bg-surface px-3 py-3 text-base placeholder:text-muted focus:outline-none"
      />

      <SectionTitle>{search ? `Results for "${query.trim()}"` : 'Popular areas'}</SectionTitle>

      {search && shownAreas.length === 0 && <p className="text-sm text-muted">No areas match your search.</p>}

      <ul className="space-y-3">
        {shownAreas.map((area) => (
          <li key={area.id}>
            <Card to={`/areas/${area.id}`}>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-semibold">{area.name}</p>
                  <p className="text-sm text-muted">{area.borough}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">${area.averageRent.toLocaleString()}/mo</p>
                  <p className="text-xs text-muted">
                    <PercentChange value={area.changePastYear} /> past year
                  </p>
                </div>
              </div>
            </Card>
          </li>
        ))}
      </ul>
    </div>
  )
}
