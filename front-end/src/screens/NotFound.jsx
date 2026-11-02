import { Link } from 'react-router'
import ScreenTitle from '../components/ui/ScreenTitle.jsx'

export default function NotFound() {
  return (
    <div>
      <ScreenTitle title="Page not found" subtitle="The page you are looking for does not exist." />
      <Link to="/" className="font-semibold text-accent hover:underline">
        Go to Home
      </Link>
    </div>
  )
}