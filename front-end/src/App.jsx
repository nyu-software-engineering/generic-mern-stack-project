import { useState } from 'react'
import { NavLink, Route, Routes } from 'react-router'
import Home from './pages/Home.jsx'
import Search from './pages/Search.jsx'
import Profile from './pages/Profile.jsx'
import ServiceDetails from './pages/ServiceDetails.jsx'
import BookingRequest from './pages/BookingRequest.jsx'
import Bookings from './pages/Bookings.jsx'
import BookingDetails from './pages/BookingDetails.jsx'
import initialBookings from './data/bookings.json'
import './App.css'

export default function App() {
  const [bookings, setBookings] = useState(initialBookings)
  const addBooking = booking => setBookings([...bookings, { ...booking, id: String(Date.now()), status: 'requested' }])
  const updateBooking = (id, changes) => setBookings(bookings.map(b => b.id === id ? { ...b, ...changes } : b))
  return <div className="app">
    <main className="page"><Routes>
      <Route path="/" element={<Home />} />
      <Route path="/search" element={<Search />} />
      <Route path="/services/:serviceId" element={<ServiceDetails />} />
      <Route path="/services/:serviceId/request" element={<BookingRequest addBooking={addBooking} />} />
      <Route path="/bookings" element={<Bookings bookings={bookings} />} />
      <Route path="/bookings/:bookingId" element={<BookingDetails bookings={bookings} updateBooking={updateBooking} />} />
      <Route path="/bookings/:bookingId/reschedule" element={<BookingRequest bookings={bookings} updateBooking={updateBooking} />} />
      <Route path="/profile" element={<Profile />} />
    </Routes></main>
    <nav className="tab-bar" aria-label="Main navigation">
      <NavLink to="/" end>Home</NavLink><NavLink to="/search">Search</NavLink>
      <NavLink to="/bookings">Bookings</NavLink><NavLink to="/profile">Profile</NavLink>
    </nav>
  </div>
}
