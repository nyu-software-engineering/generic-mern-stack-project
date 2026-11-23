import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import { useState, useEffect } from 'react'
import { Link } from "react-router-dom"
import './App.css'
import NewPost from './NewPost'
import EditPost from './EditPost'
import Home from './Home'
import Notifications from './Notifications'
import Messages from './Messages'
import PrivateChat from './PrivateChat'
import BountyChoice from './BountyChoice'
import Profile from './profile/Profile'
import PostHistory from './profile/PostHistory'
import AccountSettings from './profile/AccountSettings'
import Login from './Login'
import SignUp from './SignUp'
import ForgotPassword from "./ForgotPassword"


function App() {
  const [postsData, setPostsData] = useState([])
  const [count, setCount] = useState(0)
  const [curr, setCurr] = useState(-1)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [conversations, setConversations] = useState([])
  const [notifications, setNotifications] = useState([])

  useEffect(() => {
    fetch('/api/posts')
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch posts')
        return res.json()
      })
      .then(data => {
        setPostsData(data)
        setCount(data.length)
      })
      .catch(err => console.error(err))

    // still including mock data
    fetch('/api/mockData')
      .then(res => res.json())
      .then(data => {
        // console.log('Mock posts:', data.posts)

        // setPostsData (prev => [...prev, ...data.posts])
        // setCount(prev => prev + data.posts.length)
        setConversations(data.conversations)
        setNotifications(data.notifications)
      })
  }, [])


  const startConversation = post => {
    const existing = conversations.find(c => c.postId === post.id)

    if (existing) return existing.id

    const id = crypto.randomUUID()

    setConversations(prev => [{
      id,
      postId: post.id,
      username: post.username ?? 'Unknown',
      item: post.title,
      read: true,
      messages: [],
      pfp: post.pfp,
      location: post.location,
      includeBounty: post.includeBounty,
      bounty: post.bounty,
    }, ...prev])

    return id
  }

  const sendMessage = (convoId, text, sender = 'you') => {
    if (!text.trim()) return

    setConversations(prev => prev.map(c =>
      c.id === convoId
        ? {
            ...c,
            read: sender === 'you',
            messages: [...c.messages, {
              id: crypto.randomUUID(),
              sender,
              text: text.trim(),
              time: new Date().toLocaleTimeString([], {
                hour: 'numeric',
                minute: '2-digit'
              })
            }]
          }
        : c
    ))
  }

  // beware inevitable merge conflict
  return (
    <>
      <Router>
        {isLoggedIn && <nav className="nav">
          <Link className="nav-logo" to="/" style={{textDecoration: 'none'}}>Bounty</Link>
          <div className="nav-links">
            <Link className="nav-link" to="/new-post" style={{textDecoration: 'none'}}>New</Link>
            <Link className="nav-link" to="/messages" style={{textDecoration: 'none'}}>Messages</Link>
            <Link className="nav-link" to="/notifications" style={{textDecoration: 'none'}}>Notifications</Link>
            <Link className="nav-link" to="/profile" style={{textDecoration: 'none'}}>Profile</Link>
          </div>
        </nav>}
        <Routes>
          <Route path="/" element={<Home isLoggedIn={isLoggedIn} postsData={postsData} count={count} curr={curr} setCurr={setCurr} startConversation={startConversation} />} />
          <Route path="/new-post" element={<NewPost postsData={postsData} setPostsData={setPostsData} count={count} setCount={setCount} />} />
          <Route path='/edit-post/:id' element={<EditPost postsData={postsData} setPostsData={setPostsData} curr={curr} count={count} setCount={setCount} />} />
          <Route path='/resolve-post/:id' element={<BountyChoice postsData={postsData} setPostsData={setPostsData} curr={curr} count={count} setCount={setCount} />} />
          <Route path="/notifications" element={<Notifications notifications={notifications} setNotifications={setNotifications} />} />
          <Route path="/messages" element={<Messages conversations={conversations} />} />
          <Route path="/messages/:id" element={<PrivateChat conversations={conversations} setConversations={setConversations} sendMessage={sendMessage} />} />
          <Route path='/profile' element={<Profile setIsLoggedIn={setIsLoggedIn} />} />
          <Route path='/profile/posts' element={<PostHistory postsData={postsData} />} />
          <Route path='/profile/settings' element={<AccountSettings />} />
          <Route path="/login" element={<Login setIsLoggedIn={setIsLoggedIn} />} />
          <Route path="/signup" element={<SignUp setIsLoggedIn={setIsLoggedIn} />} />
          <Route path="/forgotpassword" element={<ForgotPassword setIsLoggedIn={setIsLoggedIn} />} />
        </Routes>
      </Router>
    </>
  )
}

export default App
