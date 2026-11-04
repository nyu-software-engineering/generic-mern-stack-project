import { useState } from "react";
import SearchBar from "../SearchBar";
import mockEvents from "../mockEvents";
import mockDiscoverPeople from "../mockDiscoverPeople";
import "./SearchPage.css";

// Search page (#33): the search bar filters the mock events
// and the mock people as you type. This page is a stand-in for
// the Discover and Explore pages until they land - the SearchBar
// component moves into those pages then.
export default function SearchPage() {
  // The text typed into the search bar.
  const [searchText, setSearchText] = useState("");
  const text = searchText.toLowerCase();

  // Keep only the events whose title or location matches.
  const filteredEvents = mockEvents.filter(
    (event) =>
      event.title.toLowerCase().includes(text) ||
      event.location.toLowerCase().includes(text)
  );

  // Keep only the people whose name or hobbies match.
  const filteredPeople = mockDiscoverPeople.filter(
    (person) =>
      person.name.toLowerCase().includes(text) ||
      person.hobbies.toLowerCase().includes(text)
  );

  return (
    <main className="search-page">
      <div className="search-container">
        <h1 className="search-title">Search</h1>

        <SearchBar
          label="Search events and people"
          value={searchText}
          onChange={setSearchText}
        />

        <h2 className="search-section-title">Events</h2>
        {filteredEvents.length === 0 && (
          <p className="search-empty">No events match your search.</p>
        )}
        {filteredEvents.map((event) => (
          <div className="search-card" key={event.id}>
            <img
              className="search-card-image"
              src={event.image}
              alt={event.title}
            />
            <div>
              <h3 className="search-card-title">{event.title}</h3>
              <p className="search-card-details">
                {event.date} {event.time} • {event.location} • {event.category}
              </p>
            </div>
          </div>
        ))}

        <h2 className="search-section-title">People</h2>
        {filteredPeople.length === 0 && (
          <p className="search-empty">No people match your search.</p>
        )}
        {filteredPeople.map((person) => (
          <div className="search-card" key={person.id}>
            <img
              className="search-card-image"
              src={person.image}
              alt={person.name}
            />
            <div>
              <h3 className="search-card-title">{person.name}</h3>
              <p className="search-card-details">{person.hobbies}</p>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
