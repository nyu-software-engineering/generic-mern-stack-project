import { useState } from 'react'
import { useNavigate } from 'react-router'
import Button from '../components/ui/Button.jsx'
import ScreenTitle from '../components/ui/ScreenTitle.jsx'
import TextField from '../components/ui/TextField.jsx'

export default function CheckApartment(){
    const navigate = useNavigate()
    const [address, setAddress] = useState('')
    const [askingRent, setAskingRent] = useState('')

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
                <div className="pt-2">
                    <Button type="submit" disabled={!canSubmit}>
                        Check price
                    </Button>
                </div>
            </form>
        </div>
    )
}