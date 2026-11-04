import { Link, useLocation, Navigate } from 'react-router'
import './SaveSuccess.css'

/**
 * Shown right after a place is saved from the Place Found screen.
 * Router state must include cityId and placeName (set in Identifying.jsx).
 */
export default function SaveSuccess() {
  const location = useLocation()
  const { cityId, cityName, placeName } = location.state ?? {}

  if (!cityId || !placeName) {
    return <Navigate to="/create" replace />
  }

  return (
    <section className="save-success">
      <h1 className="save-success-title">Saved!</h1>
      <p className="save-success-message">
        <strong>{placeName}</strong> was added to your {cityName} list. Your group can vote on it
        from the city page.
      </p>
      <Link
        className="btn-primary hover:btn-primary-hover save-success-cta"
        to={`/city/${cityId}`}
      >
        Open {cityName} list
      </Link>
      <Link className="save-success-secondary" to="/create">
        Add another place
      </Link>
    </section>
  )
}
