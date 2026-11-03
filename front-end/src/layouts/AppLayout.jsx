import { Outlet, useLocation } from 'react-router-dom'
import { TabBar } from '../components'

// hiding tab bar on the add, edit, bulk-log and photo screens
function shouldShowTabBar(pathname) {
  const hidden =
    pathname.startsWith('/closet/new') ||
    pathname.endsWith('/edit') ||
    pathname.endsWith('/bulk-log')
  return !hidden
}

// Shell for the logged-in screens
export default function AppLayout() {
  const { pathname } = useLocation()
  const showTabBar = shouldShowTabBar(pathname)

  return (
    <div className={`mx-auto min-h-dvh max-w-md bg-white ${showTabBar ? 'pb-16' : ''}`}>
      <Outlet />
      {showTabBar && <TabBar />}
    </div>
  )
}