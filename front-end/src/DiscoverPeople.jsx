
import { useState } from "react";
import "./DiscoverPeople.css";
import mockDiscoverPeople from "./mockDiscoverPeople";
import SearchBar from "./SearchBar";

function DiscoverPeople({ onViewProfile }) {
  const [search, setSearch] = useState("");
  const [interest, setInterest] = useState("All");


  const filteredPeople = mockDiscoverPeople.filter((person) =>
    (person.name.toLowerCase().includes(search.toLowerCase()) ||
      person.hobbies.toLowerCase().includes(search.toLowerCase())) &&
    (interest === "All" || person.hobbies.includes(interest))
  );

  return (
    <div className="discover">
      <h1>Discover people</h1>
      <hr />

      <SearchBar
  label="Search by interest or name"
  value={search}
  onChange={setSearch}
/>
      

      <div className="filters">
        <label htmlFor="interest-filter">Filter by interest</label>
        <select
          id="interest-filter"
          value={interest}
          onChange={(e) => setInterest(e.target.value)}
        >
          <option value="All">All interests</option>
          <option value="Coffee">Coffee</option>
          <option value="Hiking">Hiking</option>
          <option value="Music">Music</option>
          <option value="Sports">Sports</option>
        </select>
      </div>

      {filteredPeople.map((person) => (
        <div className="person-card" key={person.id}>
          <img src={person.image} alt={person.name} />

          <div className="person-info">
            <h3>{person.name}</h3>
            <p>{person.hobbies}</p>
            <button onClick={() => onViewProfile(person)}>
              View profile
            </button>
          </div>

        </div>
      ))}


    </div>
  );
}

export default DiscoverPeople;
