import './ProfileServiceCard.css'


export default function ProfileServiceCard({service}) {
    const {title, price, priceUnit, status, rating, numReviews} = service

    return (
        <article className="profile-service-card">
            <h3>{title} · ${price} / {priceUnit} </h3>
            <p>{status} · { rating !== null ? `${rating} / 5` : "No reviews yet"}· {numReviews} reviews</p>
        </article>
    )
}