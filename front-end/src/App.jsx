import { useState } from 'react'
import { useEffect } from 'react'
import { Navigate, NavLink, Route, Routes } from 'react-router'
import axios from 'axios'
import Home from './pages/Home.jsx'
import Search from './pages/Search.jsx'
import Profile from './pages/Profile.jsx'
import EditProfile from './pages/EditProfile.jsx'
import MyServices from './pages/MyServices.jsx'
import EditListing from './pages/EditListing.jsx'
import CreateListing from './pages/CreateListing.jsx'
import ServiceDetails from './pages/ServiceDetails.jsx'
import BookingRequest from './pages/BookingRequest.jsx'
import Bookings from './pages/Bookings.jsx'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import BookingDetails from './pages/BookingDetails.jsx'
// import initialServices from './services.json'
import './App.css'

function App() {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [services, setServices] = useState([])

  useEffect(() => {
    async function getServices(){
      const response = await axios("/api/services")
      setServices(response.data)
    }
    getServices()
  }, [])

  useEffect(() => {
    axios.get("/api/profile/1")
      .then(response => setProfile(response.data))
      .catch(console.error)
  }, [])

  const updateService = (id, changes) => {
    setServices(previous => previous.map(s => s.id === id ? { ...s, ...changes } : s))
    if (changes.availability) {
      axios.patch(`/api/bookings/services/${id}/availability`, changes.availability).catch(console.error)
    }
  }
  const removeService = id => setServices(services.filter(s => s.id !== id))
  const [bookings, setBookings] = useState([])
  useEffect(() => {
    axios.get('/api/bookings').then(response => setBookings(response.data)).catch(console.error)
  }, [])
  async function addService(service) {
    const response = await axios.post("/api/services", service)
    const savedService = response.data
    setServices(function (currentServices) {
      return currentServices.concat(savedService)
    })
  }
  const addBooking = async booking => {
    const response = await axios.post('/api/bookings', booking)
    setBookings(previous => [...previous, response.data])
    return response.data
  }
  const updateBooking = async (id, changes) => {
    const response = await axios.patch(`/api/bookings/${id}`, changes)
    setBookings(previous => previous.map(b => b.id === id ? response.data : b))
    return response.data
  }

  //not logged in
  if(!user){
    return (
      <main className="page auth-page">
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

        <main className="page">
          <Routes>
            {/* Home page */}
            <Route path="/" element={<Home services={services}/>} />

            {/* Search page */}
            <Route path="/search" element={<Search services={services} />} />
            
            {/* Booking page */}
            <Route path="/services/:serviceId" element={<ServiceDetails services={services} />} />
            <Route path="/services/:serviceId/request" element={<BookingRequest addBooking={addBooking} services={services} />} />
            <Route path="/bookings" element={<Bookings bookings={bookings} services={services} />} />
            <Route path="/bookings/:bookingId" element={<BookingDetails bookings={bookings} updateBooking={updateBooking} services={services} />} />
            <Route path="/bookings/:bookingId/reschedule" element={<BookingRequest bookings={bookings} updateBooking={updateBooking} services={services} />} />

            {/* Profile page */}
            <Route path="/profile" element={profile ? <Profile setUser={setUser} profile={profile} services={services}/> : <p>Loading...</p>} />
            <Route path="/profile/edit" element={profile ? <EditProfile profile={profile} setProfile={setProfile}/> : <p>Loading...</p>}/>
            <Route path="/profile/services" element={profile ? <MyServices profile={profile} setProfile={setProfile} services={services} updateService={updateService} removeService={removeService}/> : <p>Loading...</p>}/>
            <Route path="/profile/services/:serviceId/edit" element={profile ? <EditListing profile={profile} services={services} updateService={updateService} removeService={removeService}/> : <p>Loading...</p>}/>
            <Route path="/profile/services/new" element={profile? <CreateListing userId={profile.id} addService={addService} />: <p>Loading...</p>}/>

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
