import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router'
import Button from '../components/ui/Button.jsx'
import Card from '../components/ui/Card.jsx'
import ScreenTitle from '../components/ui/ScreenTitle.jsx'
import {
  getApartmentCheck,
  getComparables,
  getLatestApartmentCheck,
} from '../data/api.js'
import { formatBedrooms, formatRent } from '../data/format.js'

function streetOnly(address) {
  return address.split(',')[0]
}

export default function ComparableApartments() {
  const [searchParams] = useSearchParams()
  const checkId = searchParams.get('check')
  const [check, setCheck] = useState(null)
  const [comparables, setComparables] = useState(null)
  const [openId, setOpenId] = useState(null)

  useEffect(() => {
    const loadCheck = checkId
      ? getApartmentCheck(checkId)
      : getLatestApartmentCheck()
    loadCheck.then(loadedCheck => {
      setCheck(loadedCheck)
      getComparables(loadedCheck.id).then(setComparables)
    })
  }, [checkId])

  if (!check || !comparables) {
    return <p className="text-sm text-muted">Loading similar apartments…</p>
  }

  // Tapping an apartment shows its details; tapping it again hides them.
  const toggleDetails = apartmentId => {
    setOpenId(openId === apartmentId ? null : apartmentId)
  }

  return (
    <div>
      <ScreenTitle
        title="Similar apartments nearby"
        subtitle={`${formatBedrooms(check.bedrooms)}, ${check.bathrooms} bath near ${streetOnly(check.address)}`}
      />
      <ul className="space-y-3">
        {comparables.map(apartment => {
          const isOpen = openId === apartment.id
          const difference = apartment.rent - check.askingRent

          return (
            <li key={apartment.id}>
              <Card onClick={() => toggleDetails(apartment.id)}>
                <div className="flex gap-4" aria-expanded={isOpen}>
                  <img
                    src={apartment.imageUrl}
                    alt={`Apartment at ${apartment.address}`}
                    className="h-20 w-24 shrink-0 bg-canvas object-cover"
                    loading="lazy"
                  />
                  <div className="flex-1">
                    <p className="font-semibold">
                      {formatRent(apartment.rent)} / month
                    </p>
                    <p className="text-sm text-ink">
                      {formatBedrooms(apartment.bedrooms)} ·{' '}
                      {apartment.bathrooms} bath
                    </p>
                    <p className="text-sm text-muted">
                      {streetOnly(apartment.address)} ·{' '}
                      {apartment.distanceMiles} mi
                    </p>
                  </div>
                  <span
                    className="self-center text-sm text-muted"
                    aria-hidden="true"
                  >
                    {isOpen ? '−' : '+'}
                  </span>
                </div>

                {isOpen && (
                  <div className="mt-4 border-t border-line pt-4">
                    <img
                      src={apartment.imageUrl}
                      alt={`Larger photo of the apartment at ${apartment.address}`}
                      className="mb-4 h-48 w-full bg-canvas object-cover"
                    />
                    <dl className="divide-y divide-line">
                      <div className="flex justify-between py-2">
                        <dt className="text-sm text-muted">Address</dt>
                        <dd className="text-right text-sm font-semibold">
                          {apartment.address}
                        </dd>
                      </div>
                      <div className="flex justify-between py-2">
                        <dt className="text-sm text-muted">
                          Distance from your apartment
                        </dt>
                        <dd className="text-sm font-semibold">
                          {apartment.distanceMiles} mi
                        </dd>
                      </div>
                      <div className="flex justify-between py-2">
                        <dt className="text-sm text-muted">
                          Compared with your asking rent
                        </dt>
                        <dd
                          className={`text-sm font-semibold ${difference > 0 ? 'text-negative' : 'text-positive'}`}
                        >
                          {difference === 0
                            ? 'Same'
                            : `${formatRent(Math.abs(difference))} ${difference > 0 ? 'more' : 'less'}`}
                        </dd>
                      </div>
                    </dl>
                  </div>
                )}
              </Card>
            </li>
          )
        })}
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
