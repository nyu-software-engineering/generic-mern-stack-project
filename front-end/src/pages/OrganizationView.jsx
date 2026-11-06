import { useState } from "react";
import { Link } from "react-router-dom";
import { clubs } from "../data/clubs";

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth={2} className="size-7">
      <circle cx="11" cy="11" r="7" />
      <path strokeLinecap="round" d="M20 20l-3.5-3.5" />
    </svg>
  );
}

function ClubCard({ club }) {
  const className = "flex w-full items-center gap-4 rounded-2xl bg-white px-4 py-4 text-left shadow-sm ring-1 ring-black/5";
  const content = (
    <>
      <img
        src={club.logo}
        alt=""
        className="size-14 shrink-0 rounded-full bg-(--paper) object-cover"
      />
      <span>
        <span className="block text-lg font-bold [font-family:var(--font-petrona)]">{club.name}</span>
        <span className="body-copy block">{club.description}</span>
      </span>
    </>
  );

  return (
    <li>
      <Link to={`/organizations/${club.id}`} className={className}>
        {content}
      </Link>
    </li>
  );
}

export default function OrganizationView() {
  const [query, setQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const needle = query.trim().toLowerCase();
  const shownClubs = clubs.filter((club) => {
    return club.name.toLowerCase().includes(needle);
  });

  function toggleSearch() {
    if (searchOpen) {
      setQuery("");
    }
    setSearchOpen((open) => !open);
  }

  return (
    <section className="flex flex-1 flex-col bg-(--parchment) px-5 pt-6 pb-8 text-(--soft-black)">
      <div className="mx-auto flex w-full max-w-md flex-col">
        <div className="flex items-center justify-between gap-3">
          <h1 className="heading">Organization List</h1>
          <button
            type="button"
            aria-label={searchOpen ? "Close search" : "Search clubs"}
            aria-expanded={searchOpen}
            aria-controls="club-search"
            onClick={toggleSearch}
            className="flex size-10 shrink-0 items-center justify-center rounded-full focus-visible:outline-2 focus-visible:outline-(--nyu-indigo)"
          >
            <SearchIcon />
          </button>
        </div>

        {searchOpen ? (
          <input
            id="club-search"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search clubs"
            aria-label="Search clubs by name"
            autoComplete="off"
            autoFocus
            className="body-copy mt-4 w-full rounded-xl border border-black/10 bg-white px-4 py-3 outline-none focus-visible:ring-2 focus-visible:ring-(--nyu-indigo)"
          />
        ) : null}

        {shownClubs.length === 0 ? (
          <p className="body-copy mt-6">No clubs match that name.</p>
        ) : (
          <ul className="mt-5 flex flex-col gap-3">
            {shownClubs.map((club) => (
              <ClubCard key={club.id} club={club} />
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
