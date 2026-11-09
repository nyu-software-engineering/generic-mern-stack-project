import { useState } from 'react'
import { BrowserRouter, Navigate, Outlet, Route, Routes, useLocation } from 'react-router-dom'
import { BottomNav } from './components'
import { AuthProvider } from './context/AuthProvider'
import { ThemeProvider } from './context/ThemeProvider'
import { useAuth } from './hooks/useAuth'

import AddApplication from './pages/applications/AddApplication'
import ApplicationDetails from './pages/applications/ApplicationDetails'
import Archive from './pages/applications/Archive'
import Dashboard from './pages/applications/Dashboard'
import EditApplication from './pages/applications/EditApplication'
import InterviewRound from './pages/applications/InterviewRound'
import OfferDetails from './pages/applications/OfferDetails'
import ForgotPassword from './pages/auth/ForgotPassword'
import LogIn from './pages/auth/LogIn'
import ResetPassword from './pages/auth/ResetPassword'
import SignUp from './pages/auth/SignUp'
import Welcome from './pages/auth/Welcome'
import ComponentGallery from './pages/dev/ComponentGallery'
import AddEvent from './pages/events/AddEvent'
import EditEvent from './pages/events/EditEvent'
import ViewEvent from './pages/events/ViewEvent'
import Upcoming from './pages/events/Upcoming'
import Home from './pages/home/Home'
import NotFound from './pages/NotFound'
import EditAccount from './pages/profile/EditAccount'
import ExportData from './pages/profile/ExportData'
import NotificationSettings from './pages/profile/NotificationSettings'
import Profile from './pages/profile/Profile'
import Statistics from './pages/stats/Statistics'

/**
 * Screens inside this need a logged-in user. Someone who just logged out (or deleted their account)
 * goes to Welcome; anyone else is sent to Log In and brought back to this page afterwards.
 */
function RequireAuth() {
  const { isLoggedIn, justLoggedOut } = useAuth()
  const location = useLocation()
  if (!isLoggedIn) {
    if (justLoggedOut) return <Navigate to="/" replace />
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }
  return <Outlet />
}

/**
 * Welcome, Log In and Sign Up are for logged-out users; if you're already logged in when you open
 * one, you go to Home instead. Only checked when the page opens, so Sign Up can still show its
 * "Account created" pop-up after logging you in.
 */
function GuestOnly() {
  const { isLoggedIn } = useAuth()
  const [wasLoggedInOnOpen] = useState(isLoggedIn)
  if (wasLoggedInOnOpen) return <Navigate to="/home" replace />
  return <Outlet />
}

/** The five main screens share the bottom navigation bar. */
function TabLayout() {
  return (
    <div className="tab-layout">
      <Outlet />
      <BottomNav />
    </div>
  )
}

/**
 * Every screen in the app and its URL.
 * To link to a screen, use one of these paths, e.g. <Button to="/applications/new">.
 */
export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Signed-out screens */}
            <Route element={<GuestOnly />}>
              <Route path="/" element={<Welcome />} />
              <Route path="/signup" element={<SignUp />} />
              <Route path="/login" element={<LogIn />} />
            </Route>
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />

            {/* Everything else needs a logged-in user */}
            <Route element={<RequireAuth />}>
              {/* Main screens with the bottom navigation bar */}
              <Route element={<TabLayout />}>
                <Route path="/home" element={<Home />} />
                <Route path="/applications" element={<Dashboard />} />
                <Route path="/upcoming" element={<Upcoming />} />
                <Route path="/stats" element={<Statistics />} />
                <Route path="/profile" element={<Profile />} />
              </Route>

              {/* Applications */}
              <Route path="/applications/new" element={<AddApplication />} />
              <Route path="/applications/:id" element={<ApplicationDetails />} />
              <Route path="/applications/:id/edit" element={<EditApplication />} />
              <Route path="/applications/:id/offer" element={<OfferDetails />} />
              <Route path="/applications/:id/rounds/new" element={<InterviewRound />} />
              <Route path="/applications/:id/rounds/:roundId" element={<InterviewRound />} />
              <Route path="/archive" element={<Archive />} />

              {/* Events */}
              <Route path="/events/:id" element={<ViewEvent />} />
              <Route path="/events/new" element={<AddEvent />} />
              <Route path="/events/:id/edit" element={<EditEvent />} />

              {/* Profile */}
              <Route path="/profile/edit" element={<EditAccount />} />
              <Route path="/profile/notifications" element={<NotificationSettings />} />
              <Route path="/profile/export" element={<ExportData />} />
            </Route>

            {/* Developer tools: a live gallery of every shared component */}
            <Route path="/dev/components" element={<ComponentGallery />} />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  )
}
