import { useEffect, useState } from 'react'
import { useLocation } from 'react-router'
import Button from '../components/ui/Button.jsx'
import Card from '../components/ui/Card.jsx'
import ScreenTitle from '../components/ui/ScreenTitle.jsx'
import { getArea, getLatestApartmentCheck } from '../data/api.js'
import { formatRent } from '../data/format.js'

// shows "Studio" for 0 bedrooms, otherwise "2 bd"
function bedroomLabel(bedrooms){
    if (bedrooms === 0){
        return 'Studio'
    }
    return `${bedrooms} bd`
}

// turns the percentage into a sentence and a color
// above average is red because paying more is bad for a renter
function getVerdict(percent){
    const rounded = Math.round(Math.abs(percent))
    if (rounded < 2){
        return { text: 'Right around the local average', color: 'text-ink' }
    }
    if (percent > 0){
        return { text: `About ${rounded}% above the local average`, color: 'text-negative' }
    }
    return { text: `About ${rounded}% below the local average`, color: 'text-positive' }
}

export default function PriceResult(){
    const location = useLocation()
    const typed = location.state
    const [market, setMarket] = useState(null)
    const [area, setArea] = useState(null)

    // load the market numbers once when the screen opens
    useEffect(() => {
        getLatestApartmentCheck().then((check) => {
            setMarket(check)
            getArea(check.areaId).then(setArea)
        })
    }, [])

    if (!market){
        return <p className="text-sm text-muted">Checking the price…</p>
    }

    // use what the renter typed, if they opened this screen directly show their last check instead
    let apartment = {
        address: market.address,
        askingRent: market.askingRent,
        bedrooms: market.bedrooms,
        bathrooms: market.bathrooms,
    }
    if (typed){
        apartment = {
            address: typed.address,
            askingRent: typed.askingRent,
            bedrooms: typed.bedrooms ?? market.bedrooms,
            bathrooms: typed.bathrooms ?? market.bathrooms,
        }
    }

    const percent = ((apartment.askingRent - market.localAverage) / market.localAverage) * 100
    const verdict = getVerdict(percent)

    let subtitle = `${bedroomLabel(apartment.bedrooms)} · ${apartment.bathrooms} ba`
    if (area){
        subtitle = `${subtitle} · ${area.name}`
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
                <p className={`mt-3 text-lg font-semibold ${verdict.color}`}>{verdict.text}</p>
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
                <Button to={`/check/comparables?check=${market.id}`}>See comparable apartments</Button>
                <Button to={`/areas/${market.areaId}`} variant="secondary">
                    See rent trends
                </Button>
            </div>
        </div>
    )
}