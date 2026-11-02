import { Outlet } from 'react-router'

export default function AppLayout({ role }) {
  return (
    <main className="px-5 py-6" data-role={role}>
      <Outlet />
    </main>
  )
}