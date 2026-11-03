
import { Link } from 'react-router-dom'
import { CURRENT_USER_ID } from '../../services/mockDataService.js'

function ReviewNavigation() {
  return (
    <nav className="review-navigation" aria-label="App navigation">
      <Link to="/browse">Browse</Link>
      <Link to="/requests">Requests</Link>
      <Link to="/listings">List</Link>
      <Link to="/inbox">Messages</Link>
      <Link to={`/users/${CURRENT_USER_ID}/reputation`}>
        Profile
      </Link>
    </nav>
  )
}

export default ReviewNavigation
