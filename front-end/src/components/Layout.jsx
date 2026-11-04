import { Outlet } from 'react-router'
import BottomNav from './BottomNav'

export default function Layout() {
  return (
    <div className="min-h-screen bg-white pb-20">
      <main className="mx-auto max-w-md">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  )
}