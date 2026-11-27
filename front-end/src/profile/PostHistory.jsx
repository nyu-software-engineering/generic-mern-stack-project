import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import './Profile.css'

function PostHistory({ currentUser, postsData }) {
  const [tab, setTab] = useState('active')
  const [resolvedPosts, setResolvedPosts] = useState([])
  const navigate = useNavigate()

  // resolved posts are kept by the back-end when a post is resolved
  useEffect(() => {
    fetch('/api/posts/resolved')
      .then((res) => res.json())
      .then((data) => setResolvedPosts(data))
      .catch((err) => console.error(err))
  }, [])


  const activePosts = postsData.filter((post) => post.email === currentUser.email)
  const posts = tab === 'active' ? activePosts : resolvedPosts

  return (
    <div className="profile-page">
      <h1>My Posts</h1>

      <div className="profile-tabs">
        <button
          type="button"
          className={tab === 'active' ? 'profile-tab-selected' : ''}
          onClick={() => setTab('active')}
        >
          Active ({activePosts.length})
        </button>
        <button
          type="button"
          className={tab === 'resolved' ? 'profile-tab-selected' : ''}
          onClick={() => setTab('resolved')}
        >
          Resolved ({resolvedPosts.length})
        </button>
      </div>

      {posts.length === 0 && <p>No posts yet.</p>}

      <ul className="profile-post-list">
        {posts.map((post, index) => (
          <li key={index}>
            <strong>{post.title}</strong> | {post.category.charAt(0).toUpperCase() + post.category.slice(1)}
            {post.location && <p>{post.location}</p>}
            {post.date && <p>{post.date}</p>}
          </li>
        ))}
      </ul>

      <button type="button" className="profile-btn-link" onClick={() => navigate('/profile')}>
        Back to Profile
      </button>
    </div>
  )
}

export default PostHistory
