// Search page for the app (demo page with mock data, no backend yet).
// Combines the search bar from issue #33 with the category and interest
// filters from issue #34. Type to search, tap a filter to narrow the
// lists, and both work together.
import { useState } from "react";
import SearchBar from "../SearchBar";
import FilterBar from "../FilterBar";
import mockEvents from "../mockEvents";
import mockDiscoverPeople from "../mockDiscoverPeople";
import "./SearchPage.css";

// The category options for events and the interest options for people.
const eventCategories = ["All", "Social", "Arts", "Games"];
const peopleInterests = ["All", "Hiking", "Photography", "Cooking", "Board Games", "Music", "Soccer"];

function SearchPage() {
  // What the user typed in the search bar and the filters they picked.
  const [searchText, setSearchText] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedInterest, setSelectedInterest] = useState("All");

  // Keep the events that match the search text and the category.
  const shownEvents = mockEvents.filter((event) => {
    const matchesText =
      event.title.toLowerCase().includes(searchText.toLowerCase()) ||
      event.location.toLowerCase().includes(searchText.toLowerCase());
    const matchesCategory =
      selectedCategory === "All" || event.category === selectedCategory;
    return matchesText && matchesCategory;
  });

  // Keep the people that match the search text and the interest.
  const shownPeople = mockDiscoverPeople.filter((person) => {
    const matchesText =
      person.name.toLowerCase().includes(searchText.toLowerCase()) ||
      person.hobbies.join(" ").toLowerCase().includes(searchText.toLowerCase());
    const matchesInterest =
      selectedInterest === "All" || person.hobbies.includes(selectedInterest);
    return matchesText && matchesInterest;
  });

  return (
    <div className="search-page">
      <h1>Search</h1>

      <SearchBar label="Search events and people" value={searchText} onChange={setSearchText} />

      <h2>Events</h2>
      <p className="search-filter-label">Filter by category</p>
      <FilterBar options={eventCategories} selected={selectedCategory} onSelect={setSelectedCategory} />
      <div className="search-list">
        {shownEvents.map((event) => (
          <div className="search-event-card" key={event.id}>
            <h3>{event.title}</h3>
            <p>{event.date} at {event.time}</p>
            <p>{event.location}</p>
            <p>Category: {event.category}</p>
          </div>
        ))}
        {shownEvents.length === 0 && <p>No events match.</p>}
      </div>

      <h2>People</h2>
      <p className="search-filter-label">Filter by interest</p>
      <FilterBar options={peopleInterests} selected={selectedInterest} onSelect={setSelectedInterest} />
      <div className="search-list">
        {shownPeople.map((person) => (
          <div className="search-person-card" key={person.id}>
            <h3>{person.name}</h3>
            <p>{person.age} years old</p>
            <p>Hobbies: {person.hobbies.join(", ")}</p>
          </div>
        ))}
        {shownPeople.length === 0 && <p>No people match.</p>}
      </div>
    </div>
  );
}

export default SearchPage;
