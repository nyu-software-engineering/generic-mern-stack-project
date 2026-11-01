import { useState } from 'react'
import heroImg from './assets/hero.png'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import './App.css'
import MyMaps from "./MyMaps";
import MapEditor from "./Map-Editor";
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'

function App() {
  const [count, setCount] = useState(0)

  return(

    <>

       <div className="App">
        <Router>
          <main className="App-main">
            <Routes>
              <Route path="/MyMaps" element={<MyMaps/>}/>
              <Route path="/Map-Editor" element={<MapEditor/>}/>
            </Routes>
          </main>
        </Router>
      </div>
    </>
  )
}

export default App
