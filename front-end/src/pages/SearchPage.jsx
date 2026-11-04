import { useState } from "react";
import FilterBar from "../FilterBar";
import mockEvents from "../mockEvents";
import mockDiscoverPeople from "../mockDiscoverPeople";
import "./SearchPage.css";

// Filters (#34): pick a category to filter the events, or an
// interest to filter the people. "All" shows everything.
// This page is a stand-in for the Discover and Explore pages
// until they land - the FilterBar component moves into those
// pages then, next to the SearchBar from #33.

// The filter options, written out plainly. The interests come
// from the mock people's hobbies ("NYC" is left out - every
// person has it, so it would not filter anything).
const eventCategories = ["All", "Social", "Arts", "Games"];
const peopleInterests = ["All", "Coffee", "Hiking", "Music", "Movies", "Sports", "Art"];

export default function SearchPage() {
  // One state variable for each filter bar.
  const [category, setCategory] = useState("All");
  const [interest, setInterest] = useState("All");

  // Keep only the events in the selected category.
  const filteredEvents = mockEvents.filter(
    (event) => category === "All" || event.category === category
  );

  // Keep only the people whose hobbies include the interest.
  const filteredPeople = mockDiscoverPeople.filter(
    (person) => interest === "All" || person.hobbies.includes(interest)
  );

  return (
    <main className="search-page">
      <div className="search-container">
        <h1 className="search-title">Search</h1>

        <p className="search-filter-label">Filter events by category:</p>
        <FilterBar
          options={eventCategories}
          selected={category}
          onSelect={setCategory}
        />

        <h2 className="search-section-title">Events</h2>
        {filteredEvents.length === 0 && (
          <p className="search-empty">No events in this category.</p>
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

        <p className="search-filter-label">Filter people by interest:</p>
        <FilterBar
          options={peopleInterests}
          selected={interest}
          onSelect={setInterest}
        />

        <h2 className="search-section-title">People</h2>
        {filteredPeople.length === 0 && (
          <p className="search-empty">No people with this interest.</p>
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
