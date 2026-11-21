import { useEffect, useState } from 'react'
import { useLocation } from 'react-router'
import Button from '../components/ui/Button.jsx'
import Card from '../components/ui/Card.jsx'
import ScreenTitle from '../components/ui/ScreenTitle.jsx'
import { getArea, getLatestApartmentCheck } from '../data/api.js'
import { formatRent } from '../data/format.js'

// shows "Studio" for 0 bedrooms, otherwise "2 bd"
function bedroomLabel(bedrooms) {
  if (bedrooms === 0) {
    return 'Studio'
  }
  return `${bedrooms} bd`
}

// turns the percentage into a sentence and a color
// above average is red because paying more is bad for a renter
function getVerdict(percent) {
  const rounded = Math.round(Math.abs(percent))
  if (rounded < 2) {
    return { text: 'Right around the local average', color: 'text-ink' }
  }
  if (percent > 0) {
    return {
      text: `About ${rounded}% above the local average`,
      color: 'text-negative',
    }
  }
  return {
    text: `About ${rounded}% below the local average`,
    color: 'text-positive',
  }
}

export default function PriceResult() {
  const location = useLocation()
  // the check just made on the Check apartment form, if the renter came from there
  const newCheck = location.state
  const [market, setMarket] = useState(newCheck)
  const [area, setArea] = useState(null)

  // load the result once when the screen opens
  useEffect(() => {
    if (newCheck) {
      getArea(newCheck.areaId).then(setArea)
    } else {
      // opened directly, so show the renter's last check
      getLatestApartmentCheck().then(check => {
        setMarket(check)
        getArea(check.areaId).then(setArea)
      })
    }
  }, [newCheck])

  if (!market) {
    return <p className="text-sm text-muted">Checking the price…</p>
  }

  const apartment = market

  const percent =
    ((apartment.askingRent - market.localAverage) / market.localAverage) * 100
  const verdict = getVerdict(percent)

  let subtitle = `${bedroomLabel(apartment.bedrooms)} · ${apartment.bathrooms} ba`
  if (area) {
    subtitle = `${subtitle} · ${area.name}`
  }
  // a new check isn't saved yet, so the comparables page uses the last saved check
  let comparablesLink = `/check/comparables?check=${market.id}`
  if (newCheck) {
    comparablesLink = '/check/comparables'
  }
  return (
    <div>
      <ScreenTitle title={apartment.address} subtitle={subtitle} />

      <Card>
        <p className="text-sm text-muted">Asking rent</p>
        <p className="text-4xl font-bold tracking-tight">
          {formatRent(apartment.askingRent)}
          <span className="text-base font-medium text-muted">/mo</span>
        </p>
        <p className={`mt-3 text-lg font-semibold ${verdict.color}`}>
          {verdict.text}
        </p>
        <dl className="mt-5 divide-y divide-line border-t border-line">
          <div className="flex justify-between py-3">
            <dt className="text-sm text-muted">Similar apartments nearby</dt>
            <dd className="font-semibold whitespace-nowrap">
              {formatRent(market.rangeLow)} – {formatRent(market.rangeHigh)}
            </dd>
          </div>
          <div className="flex justify-between py-3">
            <dt className="text-sm text-muted">Local average</dt>
            <dd className="font-semibold">{formatRent(market.localAverage)}</dd>
          </div>
        </dl>
      </Card>

      <div className="mt-6 space-y-3">
        <Button to={comparablesLink}>See comparable apartments</Button>
        <Button to={`/areas/${market.areaId}`} variant="secondary">
          See rent trends
        </Button>
      </div>
    </div>
  )
}
