import { Outlet } from 'react-router-dom'

// Shell for the logged-in screens. The bottom tab bar is added in issue #7.
export default function AppLayout() {
  return (
    <div className="mx-auto min-h-dvh max-w-md bg-white">
      <Outlet />
    </div>
  )
}
