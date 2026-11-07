import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import mockListings from '../mockListings'
import './ViewDetails.css'

const ListingDetailsPage = () => {
    const { id } = useParams() 
    const navigate = useNavigate()
    const [photoIndex, setPhotoIndex] = useState(0) 

    const listing = mockListings.find(l => l.id === Number(id))

    if (!listing) {
    return (
        <main className="ListingDetails">
        <button type="button" className="ListingDetails-back" onClick={() => navigate(-1)}>
            ← Back
        </button>
        <p>Sorry, we couldn't find that listing.</p>
        </main>
    )
    }

    const photos = listing.photos || [listing.image]

    return (
    <main className="ListingDetails">
        <button type="button" className="ListingDetails-back" onClick={() => navigate(-1)}>
        ← Back
        </button>

        <img
        className="ListingDetails-mainImg"
        src={photos[photoIndex]}
        alt={`${listing.title}, photo ${photoIndex + 1}`}
        />

        {photos.length > 1 && (
        <div className="ListingDetails-thumbs">
            {photos.map((photo, index) => (
            <img
                key={photo}
                className={index === photoIndex ? 'ListingDetails-thumb selected' : 'ListingDetails-thumb'}
                src={photo}
                alt={`Photo ${index + 1}`}
                onClick={() => setPhotoIndex(index)}
            />
            ))}
        </div>
        )}

        <h1>{listing.title}</h1>
        <p className="ListingDetails-price">{listing.price} / month</p>

        <section className="ListingDetails-section">
        <h2>Location</h2>
        <p>{listing.location}</p>
        </section>

        <section className="ListingDetails-section">
        <h2>Availability</h2>
        <p>{listing.availability}</p>
        </section>

        {listing.description && (
        <section className="ListingDetails-section">
            <h2>Description</h2>
            <p>{listing.description}</p>
        </section>
        )}
    </main>
    )
 }

export default ListingDetailsPage