
import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import './Home.css'

const EXAMPLES = [
  "Countries That Drive On The Left",
  "Members of the EU in 1995"
]

function Home({ onCreateMap }) {
  const navigate = useNavigate()
  const location = useLocation()
  const [description, setDescription] = useState("")

  function createMap() {
    const map = onCreateMap(description.trim() || "Untitled Map")
    navigate("/Map-Editor", { state: { map } })
  }

  function blankMap() {
    const map = onCreateMap("Untitled Map")
    navigate("/Map-Editor", { state: { map } })
  }

  return (
    <div className="home">
      <header>
        <img
          className="logo"
          src="https://cdn-icons-png.flaticon.com/512/4746/4746231.png"
          alt="MapMaker logo"
        />
        <button onClick={() => navigate("/menu", {
          state: { backgroundLocation: location }
        })}>
          Menu
        </button>
      </header>

      <h1>Describe Your Map</h1>

      <div className="prompt-box">
        <textarea
          placeholder="Make me a map of..."
          value={description}
          onChange={(event) => setDescription(event.target.value)}
        />
        <button className="generate-button" onClick={createMap}>
          Generate
        </button>
      </div>

      <button className="blank-button" onClick={blankMap}>
        Start From A Blank Map
      </button>

      <h3>Examples</h3>

      {EXAMPLES.map((example) => (
        <button
          className="example"
          key={example}
          onClick={() => setDescription(example)}
        >
          {example}
        </button>
      ))}
    </div>
  )
}

export default Home
