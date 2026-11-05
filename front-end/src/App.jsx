// import {useEffect, useState} from "react"
// import{
//   BrowserRouter as Router,
//   Navigate,
//   Route,
//   Routes,
// } from "react-router-dom"
// import Profile from "./components/profile/Profile"
// import ProfileSettings from "./components/profile/ProfileSettings"
// import "./App.css"

// const App = () => {
//   const [user, setUser] = useState(null)
//   const [loading, setLoading] = useState (true)
//   const [error, setError] = useState(false)

//   useEffect(() => {
//     let active = true
    
//     const fetchUser = async() => {
//       try{
//         const response = await fetch(
//           "https://randomuser.me/api/?seed=hobbyhub"
//         )
//         if (!response.ok){
//           throw new Error("Failed to load profile")
//         }
//         const data = await response.json()
//         if(active){
//           setUser(data.results[0])
//         }
//       } catch {
//         if(active) {
//           setError(true)
//         }
//       } finally {
//         if (active){
//           setLoading(false)
//         }
//       }
//     }

//     fetchUser()
//     return() => {
//       active = false
//     }
//   }, [])
//   if(loading){
//     return <p className="app-message">Loading profile...</p>
//   }
//   if(error){
//     return <p className="app-message">Unable to load profile.</p>
//   }

//   return (
//     <Router>
//       <Routes>
//           <Route path="/" element={<Navigate to="/profile" replace />} />
//           <Route path="/profile" element={<Profile user={user} />} />
//           <Route 
//             path="/profile/settings"
//             element={<ProfileSettings />}
//           />
//         </Routes>
//       </Router>
//   )
// }

// export default App


import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import Discover from "./discover/Discover"
import HobbyDetail from "./discover/HobbyDetail"
import EventDetail from "./discover/EventDetail"
import Login from "./login/Login";
import CreateAccount from "./login/CreateAccount";
import Feed from "./Feed/Feed"
import Following from "./Feed/Following"
import CreatePost from "./Feed/CreatePost"
import Map from "./map/Map"
import './App.css'

const App = () => {
  return(
    <Router>
      <Routes>
        <Route path="/discover" element={<Discover />} />
        <Route path="/hobbies/:id" element={<HobbyDetail />} />
        <Route path="/events/:id" element={<EventDetail />} />
        <Route path="/login" element={<Login />} />
        <Route path="/create-account" element={<CreateAccount />} />
        <Route path="/feed" element={<Feed />} />
        <Route path="/following" element={<Following />} />
        <Route path="/create-post" element={<CreatePost />} />
        <Route path="/map" element={<Map />} />
      </Routes>
    </Router>
  )
}

export default App