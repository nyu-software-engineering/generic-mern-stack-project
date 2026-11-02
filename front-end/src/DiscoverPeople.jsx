
import "./DiscoverPeople.css";
import mockDiscoverPeople from "./mockDiscoverPeople";

function DiscoverPeople({ onViewProfile }) {
  return (
    <div className="discover">
      <h1>Discover people</h1>
      <hr />

      <label>Search by interest or name</label>
      <input type="text" />

      <div className="filters">
        Filters: Interests • Location
      </div>

      {mockDiscoverPeople.map((person) => (
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

      <div className="navigation">
        <p>People　 Events　 Connect　 Profile</p>
      </div>
    </div>
  );
}

export default DiscoverPeople;
