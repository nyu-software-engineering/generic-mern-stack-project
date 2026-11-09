import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import categories from '../categories.json'
import Header from './Header'
import './Profile.css'
import './EditProfile.css'
import './EditListing.css'

const DAY_OPTIONS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

const PRICE_UNIT_OPTIONS = [
    { value: 'item', label: 'Per item' },
    { value: 'hour', label: 'Per hour' },
    { value: 'session', label: 'Per session' },
]

function EditListingForm({ service, profile, setProfile, updateService }) {
    const navigate = useNavigate()

    const [title, setTitle] = useState(service.title)
    const [category, setCategory] = useState(service.category)
    const [description, setDescription] = useState(service.description || '')
    const [price, setPrice] = useState(service.price)
    const [priceUnit, setPriceUnit] = useState(service.priceUnit)
    const [workSample, setWorkSample] = useState(service.workSample || null)
    const [days, setDays] = useState(service.availability.days)
    const [startTime, setStartTime] = useState(service.availability.startTime)
    const [endTime, setEndTime] = useState(service.availability.endTime)
    const [error, setError] = useState('')

    function handleSampleChange(event) {
        const file = event.target.files[0]
        if (file) {
            setWorkSample(URL.createObjectURL(file))
        }
    }

    function toggleDay(day) {
        setDays(days.includes(day) ? days.filter(d => d !== day) : [...days, day])
    }

    function handleSubmit(event) {
        event.preventDefault()
        if (!title.trim()) {
            setError('Enter a service title.')
            return
        }
        if (days.length === 0) {
            setError('Choose at least one available day.')
            return
        }
        if (startTime >= endTime) {
            setError('End time must be after start time.')
            return
        }
        updateService(service.id, {
            title: title.trim(),
            category,
            description: description.trim(),
            price: Number(price),
            priceUnit,
            workSample,
            availability: {
                days: DAY_OPTIONS.filter(day => days.includes(day)),
                startTime,
                endTime,
            },
        })
        navigate('/profile/services')
    }

    function togglePaused() {
        updateService(service.id, { status: service.status === 'Paused' ? 'Active' : 'Paused' })
    }

    function removeListing() {
        setProfile({ ...profile, services: profile.services.filter(serviceId => serviceId !== service.id) })
        navigate('/profile/services')
    }

    return (
        <form className="edit-profile" onSubmit={handleSubmit}>
            <h1>Edit Listing</h1>
            <p className="edit-listing-summary">{service.title} · {service.status}</p>

            <label className="edit-profile-field">
                <span>Service title</span>
                <input value={title} onChange={event => setTitle(event.target.value)} required />
            </label>

            <label className="edit-profile-field">
                <span>Category</span>
                <select value={category} onChange={event => setCategory(event.target.value)}>
                    {categories.map(option => <option key={option} value={option}>{option}</option>)}
                </select>
            </label>

            <label className="edit-profile-field">
                <span>Description</span>
                <textarea rows="3" value={description} onChange={event => setDescription(event.target.value)} />
            </label>

            <label className="edit-profile-field">
                <span>Price ($)</span>
                <input type="number" min="0" step="0.01" value={price} onChange={event => setPrice(event.target.value)} required />
            </label>

            <label className="edit-profile-field">
                <span>Pricing unit</span>
                <select value={priceUnit} onChange={event => setPriceUnit(event.target.value)}>
                    {PRICE_UNIT_OPTIONS.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
                </select>
            </label>

            <img
                className="edit-profile-photo"
                src={workSample || `https://picsum.photos/seed/${service.id}/400/240`}
                alt="Work sample"
            />

            <div className="profile-button-row">
                <label className="profile-button">
                    Add sample
                    <input type="file" accept="image/*" onChange={handleSampleChange} hidden />
                </label>
                <button className="profile-button" type="button" onClick={() => setWorkSample(null)}>
                    Remove sample
                </button>
            </div>

            <fieldset className="edit-listing-days">
                <legend>Available days</legend>
                {DAY_OPTIONS.map(day => (
                    <label key={day}>
                        <input type="checkbox" checked={days.includes(day)} onChange={() => toggleDay(day)} />
                        {day}
                    </label>
                ))}
            </fieldset>

            <div className="edit-listing-times">
                <label className="edit-profile-field">
                    <span>Start time</span>
                    <input type="time" value={startTime} onChange={event => setStartTime(event.target.value)} required />
                </label>
                <label className="edit-profile-field">
                    <span>End time</span>
                    <input type="time" value={endTime} onChange={event => setEndTime(event.target.value)} required />
                </label>
            </div>

            {error && <p className="edit-listing-error" role="alert">{error}</p>}

            <button className="profile-button" type="submit">Save changes</button>
            <Link className="profile-button" to="/profile/services">Cancel</Link>

            <div className="profile-button-row">
                <button className="profile-button" type="button" onClick={togglePaused}>
                    {service.status === 'Paused' ? 'Reactivate listing' : 'Pause listing'}
                </button>
                <button className="profile-button" type="button" onClick={removeListing}>Remove listing</button>
            </div>
        </form>
    )
}

export default function EditListing(props) {
    const { serviceId } = useParams()
    const service = props.services.find(s => String(s.id) === serviceId)
    const isMine = service && props.profile.services.includes(service.id)

    return (
        <>
            <Header />
            {isMine
                ? <EditListingForm
                    key={service.id}
                    service={service}
                    profile={props.profile}
                    setProfile={props.setProfile}
                    updateService={props.updateService}
                />
                : <p>Service not found. <Link to="/profile/services">Back to my services</Link></p>}
        </>
    )
}
