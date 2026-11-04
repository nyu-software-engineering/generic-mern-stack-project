import { Link } from 'react-router'
import './Profile.css'
import './MyServices.css'

export default function MyServices(props) {
    const profile = props.profile
    const myServices = props.services.filter(service => profile.services.includes(service.id))

    function removeService(id) {
        props.setProfile({ ...profile, services: profile.services.filter(serviceId => serviceId !== id) })
    }

    return (
        <section className="my-services">
            <h1>My Services</h1>
            <button className="profile-button" type="button">Create listing</button>
            <p className="my-services-count">{myServices.length} listings · Your offered services</p>

            {myServices.length === 0 && <p>You haven't listed any services yet.</p>}

            {myServices.map(service => (
                <article key={service.id} className="my-service">
                    <img src={`https://picsum.photos/seed/${service.id}/400/240`} alt={service.title} />
                    <h2>{service.title}</h2>
                    <p>{profile.full_name} · {profile.university} · {service.category}</p>
                    <p>
                        ${service.price} / {service.priceUnit} · {service.rating !== null ? `${service.rating} / 5` : 'No reviews yet'} · {service.numReviews} reviews
                    </p>
                    <Link className="my-service-link" to={`/services/${service.id}`}>View service</Link>

                    <h3>{service.status}</h3>
                    <div className="my-service-actions">
                        <button className="profile-button" type="button">Edit</button>
                        {service.status === 'Paused'
                            ? <button className="profile-button" type="button" onClick={() => props.updateService(service.id, { status: 'Active' })}>Reactivate</button>
                            : <button className="profile-button" type="button" onClick={() => props.updateService(service.id, { status: 'Paused' })}>Pause</button>}
                        <button className="profile-button" type="button" onClick={() => removeService(service.id)}>Remove</button>
                    </div>
                </article>
            ))}

            <Link className="profile-button" to="/profile">Back to profile</Link>
        </section>
    )
}
