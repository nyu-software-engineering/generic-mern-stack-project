
import { useEffect, useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom'
import './App.css'
import MyMaps from './MyMaps'
import MapEditor from './Map-Editor'
import Home from './Home'
import Menu from './Menu'
import MapSearch from './MapSearch'
import EditorProvider from './map-editor/EditorProvider'
import { StylePage, EditTextPage, SourcesPage } from './map-editor/EditorScreens'

function AuthPage({ isRegister }) {
  const navigate = useNavigate()

  function handleSubmit(event) {
    event.preventDefault()
    navigate('/home')
  }

  return (
    <div className="page">
      <div className="form-box">
        <h1>MapMaker</h1>
        <p className="tagline">Create, customize, and share your maps.</p>
        <h2>{isRegister ? 'Create an Account' : 'Welcome Back!'}</h2>
        <p className="description">
          {isRegister
            ? 'Get started by creating your account.'
            : 'Sign in to continue creating maps.'}
        </p>

        <form onSubmit={handleSubmit}>
          {isRegister && (
            <div>
              <label htmlFor="username">Username</label>
              <input id="username" type="text" placeholder="Enter your username" required />
            </div>
          )}

          <div>
            <label htmlFor="email">Email</label>
            <input id="email" type="email" placeholder="Enter your email" required />
          </div>

          <div>
            <label htmlFor="password">Password</label>
            <input id="password" type="password" placeholder="Enter your password" required />
          </div>

          <button type="submit">
            {isRegister ? 'Register' : 'Sign In'}
          </button>
        </form>

        <p>
          {isRegister
            ? 'Already have an account?'
            : "Don't have an account?"}
        </p>

        <Link className="switch-button" to={isRegister ? '/login' : '/register'}>
          {isRegister ? 'Sign In' : 'Register'}
        </Link>

        <p><Link to="/">Back to Home</Link></p>
        <p>Frontend demo only. No account is created or verified.</p>
      </div>
    </div>
  )
}

function MapRoutes({ maps, createMap, chooseMap, renameMap }) {
  const location = useLocation()
  const backgroundLocation = location.state?.backgroundLocation

  return (
    <>
      <Routes location={backgroundLocation || location}>
        <Route path="/" element={<AuthPage isRegister={false} />} />
        <Route path="/login" element={<AuthPage isRegister={false} />} />
        <Route path="/register" element={<AuthPage isRegister={true} />} />
        <Route path="/home" element={<Home onCreateMap={createMap} />} />
        <Route path="/search" element={<MapSearch onChooseMap={chooseMap} onCreateMap={createMap} />} />
        <Route path="/menu" element={<Menu />} />
        <Route path="/MyMaps" element={<MyMaps maps={maps} onCreateMap={createMap} />} />
        <Route path="/Map-Editor" element={<MapEditor onRenameMap={renameMap} />} />
        <Route path="/style" element={<StylePage />} />
        <Route path="/edit-text" element={<EditTextPage onRenameMap={renameMap} />} />
        <Route path="/source" element={<SourcesPage />} />
        <Route path="/sources" element={<SourcesPage />} />
      </Routes>

      {backgroundLocation && (
        <Routes>
          <Route path="/menu" element={<Menu />} />
        </Routes>
      )}
    </>
  )
}

function App() {
  const [maps, setMaps] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('mapmaker-maps'))
      return Array.isArray(saved)
        ? saved.filter((map) => !(map.number <= 3 && map.name === 'Map Title' && !map.asset))
        : []
    } catch {
      return []
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem('mapmaker-maps', JSON.stringify(maps))
    } catch {
      return
    }
  }, [maps])

  function createMap(name) {
    const map = { number: Date.now(), name: name.trim() || 'Untitled Map' }
    setMaps((existing) => [map, ...existing])
    return map
  }

  function chooseMap(asset) {
    const map = {
      number: Date.now(),
      name: asset.title,
      image: asset.thumbnail,
      asset
    }
    setMaps((existing) => [map, ...existing])
    return map
  }

  function renameMap(number, name) {
    setMaps((existing) =>
      existing.map((map) => map.number === number ? { ...map, name } : map)
    )
  }

  return (
    <EditorProvider>
      <Router>
        <MapRoutes
          maps={maps}
          createMap={createMap}
          chooseMap={chooseMap}
          renameMap={renameMap}
        />
      </Router>
    </EditorProvider>
  )
}

export default App
