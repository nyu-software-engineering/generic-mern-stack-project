import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import axios from "axios"
import HobbyCard from "./HobbyCard"
import "./Discover.css"

const categories = ["Outdoors", "Arts", "Music", "Sport"]

const Discover = () => {
  const [hobbies, setHobbies] = useState([])
  const [search, setSearch] = useState("")
  const [category, setCategory] = useState("")

  useEffect(() => {
    axios("/mock/hobbies.json").then(response => setHobbies(response.data))
  }, [])

  const results = hobbies.filter(hobby =>
    hobby.name.toLowerCase().includes(search.toLowerCase()),
  )

  const cards = hobbies.filter(hobby =>
    category === "" ? hobby.isPopular : hobby.category === category,
  )

  return (
    <main className="discover">
      <div className="discover-search">
        <input
          className="discover-input"
          value={search}
          onChange={event => setSearch(event.target.value)}
          placeholder="Search hobbies..."
        />
        {search !== "" && (
          <button className="discover-clear" onClick={() => setSearch("")}>
            x
          </button>
        )}
      </div>

      {search !== "" ? (
        <section>
          <p className="discover-count">{results.length} results</p>
          {results.map(hobby => (
            <Link
              key={hobby.id}
              className="discover-result"
              to={`/hobbies/${hobby.id}`}
            >
              <img
                className="discover-result-photo"
                src={`https://picsum.photos/seed/hobby${hobby.id}/100/100`}
                alt={hobby.name}
              />
              <div>
                <p className="discover-result-name">{hobby.name}</p>
                <p className="discover-result-info">
                  {hobby.category} · {hobby.members} members
                </p>
              </div>
            </Link>
          ))}
        </section>
      ) : (
        <section>
          <div className="discover-categories">
            {categories.map(name => (
              <button
                key={name}
                className={
                  category === name
                    ? "discover-category discover-category-active"
                    : "discover-category"
                }
                onClick={() => setCategory(category === name ? "" : name)}
              >
                {name}
              </button>
            ))}
          </div>

          <h2 className="discover-heading">
            {category === "" ? "Popular near you" : category}
          </h2>

          <div className="discover-grid">
            {cards.map(hobby => (
              <HobbyCard key={hobby.id} hobby={hobby} />
            ))}
          </div>
        </section>
      )}
    </main>
  )
}

export default Discover