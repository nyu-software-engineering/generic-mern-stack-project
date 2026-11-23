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

function App() {
  const [openMenu, setOpenMenu] = useState(false)
  const [postsData, setPostsData] = useState([])
  const [count, setCount] = useState(0)
  const [curr, setCurr] = useState(-1)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [conversations, setConversations] = useState([])
  const [notifications, setNotifications] = useState([])

  useEffect(() => {
    fetchPosts()
    fetchConversations()

    fetch('/api/notifications')
      .then(res => res.json())
      .then(data => setNotifications(data))
      .catch(err => console.error(err))
  }, [])

  // used so that bountyChoice can update back-end of posts
  const fetchPosts = () => {
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
  }

  // loads the chats from the back-end
  const fetchConversations = () => {
    fetch('/api/conversations')
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch conversations')
        return res.json()
      })
      .then(data => setConversations(data))
      .catch(err => console.error(err))
  }

  const toggle = () => {
    setOpenMenu(prev => !prev)
  }

  const close = () => {
    setOpenMenu(false)
  }

  const handleLogo = () => {
    setOpenMenu(false)
    window.scrollTo({
      top: 0, 
      behavior: 'smooth'
    })
  }

  // starts a chat about a post on the back-end, or gets the one that already exists
  const startConversation = async post => {
    const res = await fetch('/api/conversations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        postId: post.id,
        username: post.username,
        pfp: post.pfp,
        item: post.title,
        location: post.location,
        includeBounty: post.includeBounty,
        bounty: post.bounty
      })
    })
    if (!res.ok) throw new Error('Failed to start conversation')
    const convo = await res.json()
    setConversations(prev => [convo, ...prev.filter(c => String(c.id) !== String(convo.id))])
    return convo.id
  }

  // saves a message on the back-end, then adds it to the chat on screen
  const sendMessage = async (convoId, text, sender = 'you') => {
    if (!text.trim()) return

    const res = await fetch(`/api/conversations/${convoId}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, sender })
    })
    if (!res.ok) throw new Error('Failed to send message')
    const message = await res.json()

    setConversations(prev => prev.map(c =>
      String(c.id) === String(convoId)
        ? { ...c, read: sender === 'you', messages: [...c.messages, message] }
        : c
    ))
  }

  return (
    <>
      <Router>
          {isLoggedIn && <nav className="nav">
            <Link onClick={handleLogo} className="nav-logo" to="/" style={{textDecoration: 'none'}}>Bounty</Link>
            <button className='sidemenu' onClick={toggle}>Menu</button>
          </nav>}
          {openMenu && <ul className='open-sidemenu' onClick={close}>
            <li><Link onClick={toggle} className="nav-link" to="/new-post" style={{textDecoration: 'none'}}>New Post</Link></li>
            <li><Link onClick={toggle} className="nav-link" to="/messages" style={{textDecoration: 'none'}}>Messages</Link></li>
            <li><Link onClick={toggle} className="nav-link" to="/notifications" style={{textDecoration: 'none'}}>Notifications</Link></li>
            <li><Link onClick={toggle} className="nav-link" to="/profile" style={{textDecoration: 'none'}}>Profile</Link></li>
          </ul>}
          {openMenu && <div id='close-sidemenu' onClick={close}></div>}
        
        <Routes>
          <Route path="/" element={<Home isLoggedIn={isLoggedIn} postsData={postsData} count={count} curr={curr} setCurr={setCurr} startConversation={startConversation} />} />
          <Route path="/new-post" element={<NewPost postsData={postsData} setPostsData={setPostsData} count={count} setCount={setCount} />} />
          <Route path='/edit-post/:id' element={<EditPost fetchPosts={fetchPosts} postsData={postsData} setPostsData={setPostsData} curr={curr} count={count} setCount={setCount} />} />
          <Route path='/resolve-post/:id' element={<BountyChoice fetchPosts={fetchPosts} postsData={postsData} setPostsData={setPostsData} curr={curr} count={count} setCount={setCount} />} />
          <Route path="/notifications" element={<Notifications notifications={notifications} setNotifications={setNotifications} />} />
          <Route path="/messages" element={<Messages conversations={conversations} />} />
          <Route path="/messages/:id" element={<PrivateChat conversations={conversations} setConversations={setConversations} sendMessage={sendMessage} />} />
          <Route path='/profile' element={<Profile setIsLoggedIn={setIsLoggedIn} />} />
          <Route path='/profile/posts' element={<PostHistory postsData={postsData} />} />
          <Route path='/profile/settings' element={<AccountSettings />} />
          <Route path="/login" element={<Login setIsLoggedIn={setIsLoggedIn} />} />
          <Route path="/signup" element={<SignUp setIsLoggedIn={setIsLoggedIn} />} />
        </Routes>
      </Router>
    </>
  )
}

export default App