import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router'
import Button from '../components/ui/Button.jsx'
import Card from '../components/ui/Card.jsx'
import ScreenTitle from '../components/ui/ScreenTitle.jsx'
import { getApartmentCheck, getComparables, getLatestApartmentCheck } from '../data/api.js'
import { formatRent } from '../data/format.js'

function streetOnly(address) {
  return address.split(',')[0]
}

export default function ComparableApartments() {
  const [searchParams] = useSearchParams()
  const checkId = searchParams.get('check')
  const [check, setCheck] = useState(null)
  const [comparables, setComparables] = useState(null)

  useEffect(() => {
    const loadCheck = checkId ? getApartmentCheck(checkId) : getLatestApartmentCheck()
    loadCheck.then((loadedCheck) => {
      setCheck(loadedCheck)
      getComparables(loadedCheck.id).then(setComparables)
    })
  }, [checkId])

  if (!check || !comparables) {
    return <p className="text-sm text-muted">Loading similar apartments…</p>
  }

  return (
    <div>
      <ScreenTitle
        title="Similar apartments nearby"
        subtitle={`${check.bedrooms} bed, ${check.bathrooms} bath near ${streetOnly(check.address)}`}
      />
      <ul className="space-y-3">
        {comparables.map((apartment) => (
          <li key={apartment.id}>
            <Card>
              <p className="font-semibold">{formatRent(apartment.rent)} / month</p>
              <p className="text-sm text-ink">
                {apartment.bedrooms} bed · {apartment.bathrooms} bath · {apartment.address} · {apartment.distanceMiles} mi
              </p>
            </Card>
          </li>
        ))}
      </ul>
      <p className="mb-6 mt-4 text-center text-xs font-semibold">
        Based on {comparables.length} similar listings from public rent data
      </p>
      <Button to="/check/result" variant="secondary">
        Back to price result
      </Button>
    </div>
  )
}
