import { useState } from 'react'
import { Navigate, NavLink, Route, Routes } from 'react-router'
import Home from './pages/Home.jsx'
import Search from './pages/Search.jsx'
import Profile from './pages/Profile.jsx'
import ServiceDetails from './pages/ServiceDetails.jsx'
import BookingRequest from './pages/BookingRequest.jsx'
import Bookings from './pages/Bookings.jsx'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import BookingDetails from './pages/BookingDetails.jsx'
import initialBookings from './data/bookings.json'
import './App.css'

function App() {
  const [user, setUser] = useState(null)
  const [bookings, setBookings] = useState(initialBookings)
  const addBooking = booking => setBookings([...bookings, { ...booking, id: String(Date.now()), status: 'requested' }])
  const updateBooking = (id, changes) => setBookings(bookings.map(b => b.id === id ? { ...b, ...changes } : b))

  //not logged in
  if(!user){
    return (
      <main className="page">
        <Routes>
          <Route path="/login" element={<Login setUser={setUser} />} />

          <Route path="/register" element={<Register />} />

          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </main>
    )
  }
  //user is logged in
  else{
    return (
      <div className="app">

        <header className="top-bar">
          <strong>CampusMart</strong>
          <button type="button" onClick={() => setUser(null)}>
            Log Out
          </button>
        </header>


        <main className="page">
          <Routes>
            {/* Home page */}
            <Route path="/" element={<Home />} />

            {/* Search page */}
            <Route path="/search" element={<Search />} />

            {/* Booking page */}
            <Route path="/services/:serviceId" element={<ServiceDetails />} />
            <Route path="/services/:serviceId/request" element={<BookingRequest addBooking={addBooking} />} />
            <Route path="/bookings" element={<Bookings bookings={bookings} />} />
            <Route path="/bookings/:bookingId" element={<BookingDetails bookings={bookings} updateBooking={updateBooking} />} />
            <Route path="/bookings/:bookingId/reschedule" element={<BookingRequest bookings={bookings} updateBooking={updateBooking} />} />

            {/* Profile page */}
            <Route path="/profile" element={<Profile />} />

            {/* Other */}
            <Route path="/login" element={<Navigate to="/" replace />}/>
            <Route path="/register" element={<Navigate to="/" replace />}/>
            <Route path="*" element={<h1>Page not found</h1>}/>
          </Routes>
        </main>

        <nav className="tab-bar" aria-label="Main navigation">
          <NavLink to="/" end>
            Home
          </NavLink>

          <NavLink to="/search">
            Search
          </NavLink>

          <NavLink to="/bookings">
            Bookings
          </NavLink>

          <NavLink to="/profile">
            Profile
          </NavLink>
        </nav>
      </div>
    )
  }
}

export default App