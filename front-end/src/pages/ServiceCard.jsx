import { Link } from 'react-router'
// import React from 'react'
// import { Link } from 'react-router-dom'
import './ServiceCard.css'

const ServiceCard = props => {

  // inject a random placeholder image from the Lorem Picsum API
  // the mockaroo API we're using doesn't include this
  // ultimately, this data would come from the API
  const imgSrc = `https://picsum.photos/seed/${props.details.id}/400/240` // tack on this service's id to the query

  return (
    <article className="ServiceCard">
      <Link to={`/services/${props.details.id}`} className="service-card-link">
      <img alt={props.details.title} src={imgSrc} />
      <h2>{props.details.title}</h2>
      <p>{props.details.provider} · {props.details.category}</p>
      <p>
        ${props.details.price} / {props.details.priceUnit} · {props.details.rating !== null ? `${props.details.rating} / 5 · ${props.details.numReviews} reviews` : 'No reviews yet'}
      </p>
      </Link>
    </article>
  )
}

// make this function available to be imported into another module
export default ServiceCard