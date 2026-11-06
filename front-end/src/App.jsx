import { useEffect, useState } from "react"
import{BrowserRouter as Router, Navigate, Route, Routes,} from "react-router-dom"
import Profile from "./components/Profile"
import ProfileSettings from "./components/ProfileSettings"
import Chat from "./components/Chat"
import Discover from "./discover/Discover"
import HobbyDetail from "./discover/HobbyDetail"
import EventDetail from "./discover/EventDetail"
import Login from "./login/Login"
import CreateAccount from "./login/CreateAccount"
import Feed from "./Feed/Feed"
import Following from "./Feed/Following"
import CreatePost from "./Feed/CreatePost"
import Map from "./map/Map"
import './App.css'

const App = () => {
  const[user, setUser] = useState(null)
  useEffect(() => {
    fetch("https://randomuser.me/api/?seed=hobbyhub")
      .then(response => {
        if(!response.ok){
          throw new Error ("Failed to load profile")
        }
        return response.json()
      })
      .then(data => setUser(data.results[0]))
      .catch(error => console.error(error))
    }, [])
  return(
    <Router>
      <Routes>
          <Route path="/" element={<Navigate to="/profile" replace />} />
          <Route path="/profile"
            element={user ? <Profile user={user} /> : <p> Loading profile...</p>}
          />
          <Route path="/chat" element={<Chat />} />
          <Route 
            path="/profile/settings"
            element={
              user ? (
                <ProfileSettings user={user} onUpdateUser={setUser} />
              ) : (
                <p>Loading profile...</p>
              )
            }
          />
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