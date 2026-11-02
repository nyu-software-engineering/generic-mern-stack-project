import { BrowserRouter, Routes, Route } from 'react-router-dom'

import Navbar from './components/Navbar'

import Welcome from './pages/auth/Welcome'
import Login from './pages/auth/Login'
import Signup from './pages/auth/Signup'
import Profile from './pages/auth/Profile'

import CreateListing from './pages/listings/CreateListing'
import MyListings from './pages/listings/MyListings'
import OwnerDashboard from './pages/ownerDashboard/OwnerDashboard'

import Browse from './pages/browse/Browse'
import ItemDetails from './pages/browse/ItemDetails'
import RenterDashboard from './pages/renterDashboard/RenterDashboard'

import Booking from './pages/booking/Booking'
import BookingDetails from './pages/booking/BookingDetails'
import BookingRequests from './pages/booking/BookingRequests'
import Extensions from './pages/booking/Extensions'
import Cancellation from './pages/booking/Cancellation'

import Inbox from './pages/chat/Inbox'
import ItemRequests from './pages/requests/ItemRequests'

import PickupReturn from './pages/handoff/PickupReturn'
import QuickBorrow from './pages/quickBorrow/QuickBorrow'
import Report from './pages/reporting/Report'


function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Welcome />} />

        {/* Auth*/}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/setup-profile" element={<Profile />} />

        {/* Listings & owner dashboard*/}
        <Route path="/listings" element={<MyListings />} />
        <Route path="/listings/new" element={<CreateListing />} />
        <Route path="/owner-dashboard" element={<OwnerDashboard />} />

        {/* Browse & renter dashboard*/}
        <Route path="/browse" element={<Browse />} />
        <Route path="/browse/:id" element={<ItemDetails />} />
        <Route path="/renter-dashboard" element={<RenterDashboard />} />

        {/* Booking*/}
        <Route path="/listings/:listingId/request" element={<Booking />} />
        <Route path="/booking-requests" element={<BookingRequests />} />
        <Route path="/bookings/:bookingId" element={<BookingDetails />} />
        <Route path="/bookings/:bookingId/extension" element={<Extensions />} />
        <Route path="/bookings/:bookingId/cancel" element={<Cancellation />} />

        {/* Chat & requests*/}
        <Route path="/inbox" element={<Inbox />} />
        <Route path="/requests" element={<ItemRequests />} />

        {/* Handoff, quick borrow, reporting*/}
        <Route path="/handoff/:rentalId" element={<PickupReturn />} />
        <Route path="/quick-borrow" element={<QuickBorrow />} />
        <Route path="/report" element={<Report />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
