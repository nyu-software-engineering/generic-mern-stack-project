import { useState } from 'react'
import { useNavigate } from 'react-router'
import Button from '../components/ui/Button.jsx'
import ScreenTitle from '../components/ui/ScreenTitle.jsx'
import TextField from '../components/ui/TextField.jsx'

const bedroomOptions = [
    { value: 0, label: 'Studio' },
    { value: 1, label: '1' },
    { value: 2, label: '2' },
    { value: 3, label: '3' },
    { value: 4, label: '4+' },
]

const bathroomOptions = [
    { value: 1, label: '1' },
    { value: 2, label: '2' },
    { value: 3, label: '3+' },
]

// a row of tappable boxes, the selected one is filled black
function OptionPicker({ label, options, value, onChange }){
    return (
        <fieldset>
            <legend className="mb-1.5 block text-sm font-medium text-ink">{label}</legend>
            <div className="flex border border-ink">
                {options.map((option) => {
                    const selected = option.value === value
                    let colors = 'bg-surface text-ink hover:bg-canvas'
                    if (selected){
                        colors = 'bg-ink text-white'
                    }
                    return (
                        <button
                            key={option.value}
                            type="button"
                            aria-pressed={selected}
                            onClick={() => onChange(option.value)}
                            className={`flex-1 border-r border-ink py-3 text-sm font-semibold transition last:border-r-0 ${colors}`}
                        >
                            {option.label}
                        </button>
                    )
                })}
            </div>
        </fieldset>
    )
}

export default function CheckApartment(){
    const navigate = useNavigate()
    const [address, setAddress] = useState('')
    const [askingRent, setAskingRent] = useState('')
    const [bedrooms, setBedrooms] = useState(1)
    const [bathrooms, setBathrooms] = useState(1)

    // the button only works once both fields are filled in
    let canSubmit = false
    if (address.trim() !== '' && Number(askingRent) > 0){
        canSubmit = true
    }

    function handleSubmit(event){
        // stop the browser from reloading the page
        event.preventDefault()
        const apartment = {
            address: address.trim(),
            askingRent: Number(askingRent),
            bedrooms: bedrooms,
            bathrooms: bathrooms,
        }
        // send what the renter typed to the result screen
        navigate('/check/result', { state: apartment })
    }

    return (
        <div>
            <ScreenTitle title="Check an apartment" subtitle="We'll compare the asking rent with similar apartments nearby." />
            <form onSubmit={handleSubmit} className="space-y-5">
                <TextField
                    label="Address"
                    id="address"
                    value={address}
                    onChange={(event) => setAddress(event.target.value)}
                    placeholder="e.g. 31-18 30th Ave, Astoria"
                    autoComplete="street-address"
                />
                <TextField
                    label="Asking rent per month ($)"
                    id="askingRent"
                    type="number"
                    inputMode="numeric"
                    min="1"
                    value={askingRent}
                    onChange={(event) => setAskingRent(event.target.value)}
                    placeholder="e.g. 2650"
                />
                <OptionPicker label="Bedrooms" options={bedroomOptions} value={bedrooms} onChange={setBedrooms} />
                <OptionPicker label="Bathrooms" options={bathroomOptions} value={bathrooms} onChange={setBathrooms} />
                <div className="pt-2">
                    <Button type="submit" disabled={!canSubmit}>
                        Check price
                    </Button>
                </div>
            </form>
        </div>
    )
}