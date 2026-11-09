import { useEffect, useState } from 'react'
import Button from '../components/ui/Button.jsx'
import Card from '../components/ui/Card.jsx'
import PercentChange from '../components/ui/PercentChange.jsx'
import ScreenTitle from '../components/ui/ScreenTitle.jsx'
import SectionTitle from '../components/ui/SectionTitle.jsx'
import { getApartmentChecks, getAreas } from '../data/api.js'
import { formatBedrooms, formatDate, formatRent } from '../data/format.js'

function percentVsAverage(check) {
  return ((check.askingRent - check.localAverage) / check.localAverage) * 100
}

export default function ChooseApartment() {
  const [checks, setChecks] = useState(null)
  const [areaNames, setAreaNames] = useState({})

  useEffect(() => {
    getApartmentChecks().then(setChecks)
    getAreas().then(areas =>
      setAreaNames(Object.fromEntries(areas.map(area => [area.id, area.name]))),
    )
  }, [])

  if (!checks) {
    return <p className="text-sm text-muted">Loading your apartments…</p>
  }

  return (
    <div>
      <ScreenTitle
        title="Negotiate"
        subtitle="Which apartment are you negotiating for? We'll write the message using its rent and the apartments around it."
      />

      {checks.length === 0 ? (
        <Button to="/check">Check an apartment first</Button>
      ) : (
        <>
          <SectionTitle>Apartments you checked</SectionTitle>
          <ul className="mb-6 space-y-3">
            {checks.map(check => (
              <li key={check.id}>
                <Card to={`/negotiate/${check.id}`}>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-semibold">{check.address}</p>
                      <p className="text-sm text-muted">
                        {areaNames[check.areaId] ?? ''} ·{' '}
                        {formatBedrooms(check.bedrooms)} · {check.bathrooms} ba
                      </p>
                      <p className="mt-1 text-xs text-muted">
                        Checked {formatDate(check.checkedOn)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">
                        {formatRent(check.askingRent)}/mo
                      </p>
                      <p className="text-xs text-muted">
                        <PercentChange value={percentVsAverage(check)} /> vs.
                        average
                      </p>
                    </div>
                  </div>
                </Card>
              </li>
            ))}
          </ul>
          <Button to="/check" variant="secondary">
            Check another apartment
          </Button>
        </>
      )}
    </div>
  )
}
