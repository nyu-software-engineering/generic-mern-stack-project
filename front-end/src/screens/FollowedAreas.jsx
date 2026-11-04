import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import Button from '../components/ui/Button.jsx'
import PercentChange from '../components/ui/PercentChange.jsx'
import ScreenTitle from '../components/ui/ScreenTitle.jsx'
import { getMyFollowedAreas, setFollowingArea } from '../data/followedAreas.js'
import { formatRent } from '../data/format.js'

export default function FollowedAreas() {
  const [areas, setAreas] = useState(null)

  useEffect(() => {
    getMyFollowedAreas().then(setAreas)
  }, [])

  const unfollow = async (areaId) => {
    await setFollowingArea(areaId, false)
    setAreas(areas.filter((area) => area.id !== areaId))
  }

  if (!areas) {
    return <p className="text-sm text-muted">Loading your areas…</p>
  }

  return (
    <div>
      <ScreenTitle
        title="Followed areas"
        subtitle={areas.length > 0 ? 'Rent changes in the areas you follow.' : "You're not following any areas yet."}
      />

      {areas.length === 0 ? (
        <Button to="/explore">Explore areas</Button>
      ) : (
        <ul className="space-y-3">
          {areas.map((area) => (
            <li key={area.id} className="flex items-stretch border border-line bg-surface">
              <Link to={`/areas/${area.id}`} className="flex flex-1 items-center justify-between gap-3 p-4 transition hover:bg-canvas">
                <div>
                  <p className="font-semibold">{area.name}</p>
                  <p className="text-sm text-muted">{area.borough}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">{formatRent(area.averageRent)}/mo</p>
                  <p className="text-xs text-muted">
                    <PercentChange value={area.changePastYear} /> past year
                  </p>
                </div>
              </Link>
              <button
                type="button"
                onClick={() => unfollow(area.id)}
                className="border-l border-line px-4 text-sm font-semibold text-negative hover:bg-canvas"
                aria-label={`Unfollow ${area.name}`}
              >
                Unfollow
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}