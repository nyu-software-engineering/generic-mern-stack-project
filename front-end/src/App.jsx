import {useEffect, useState} from "react"
import{
  BrowserRouter as Router,
  Navigate,
  Route,
  Routes,
} from "react-router-dom"
import Profile from "./components/Profile"
import ProfileSettings from "./components/ProfileSettings"
import "./App.css"
import Chat from "./components/Chat"

const App = () => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState (true)
  const [error, setError] = useState(false)

  useEffect(() => {
    let active = true
    
    const fetchUser = async() => {
      try{
        const response = await fetch(
          "https://randomuser.me/api/?seed=hobbyhub"
        )
        if (!response.ok){
          throw new Error("Failed to load profile")
        }
        const data = await response.json()
        if(active){
          setUser(data.results[0])
        }
      } catch {
        if(active) {
          setError(true)
        }
      } finally {
        if (active){
          setLoading(false)
        }
      }
    }

    fetchUser()
    return() => {
      active = false
    }
  }, [])
  if(loading){
    return <p className="app-message">Loading profile...</p>
  }
  if(error){
    return <p className="app-message">Unable to load profile.</p>
  }

  return (
    <Router>
      <Routes>
          <Route path="/" element={<Navigate to="/profile" replace />} />
          <Route path="/profile" element={<Profile user={user} />} />
          <Route path="/chat" element={<Chat />} />
          <Route 
            path="/profile/settings"
            element={
              <ProfileSettings 
                user={user}
                onUpdateUser={setUser}
              />
            }
          />
        </Routes>
      </Router>
  )
}

export default App