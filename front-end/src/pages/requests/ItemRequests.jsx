import { Navigate, useSearchParams } from 'react-router-dom'
import CreateItemRequest from './CreateItemRequest'
import RequestDetail from './RequestDetail'

// Item request screens (#57). The list itself lives on the shared requests board.
//   /requests?new            → Create Item Request (prototype m15)
//   /requests?request=<id>   → Request detail / respond (prototype m16)
function ItemRequests() {
  const [searchParams] = useSearchParams()
  const requestId = searchParams.get('request')

  if (searchParams.has('new')) return <CreateItemRequest />
  if (requestId) return <RequestDetail key={requestId} requestId={requestId} />
  return <Navigate to="/requests-board" replace />
}

export default ItemRequests
