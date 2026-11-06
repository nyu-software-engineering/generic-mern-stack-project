import { useState } from "react";
import { Link } from "react-router-dom";
import ClubCard from "../components/ClubCard";
import { useFavorites } from "../context/FavoritesContext";
import { clubs } from "../data/clubs";

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth={2} className="size-7">
      <circle cx="11" cy="11" r="7" />
      <path strokeLinecap="round" d="M20 20l-3.5-3.5" />
    </svg>
  );
}

function HeaderStar({ filled }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="size-7" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth={filled ? 0 : 1.8}>
      <path strokeLinejoin="round" d="M12 2.6l2.05 6.32h6.64l-5.37 3.9 2.05 6.32L12 15.24l-5.37 3.9 2.05-6.32-5.37-3.9h6.64L12 2.6z" />
    </svg>
  );
}

export default function OrganizationView() {
  const { ids } = useFavorites();
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
          <div className="flex items-center gap-1">
            <Link
              to="/favorites"
              aria-label={ids.length > 0 ? `View ${ids.length} favorite clubs` : "View favorite clubs"}
              className={`relative flex size-10 shrink-0 items-center justify-center rounded-full focus-visible:outline-2 focus-visible:outline-(--nyu-indigo) ${
                ids.length > 0 ? "text-(--nyu-indigo)" : "text-(--soft-black)"
              }`}
            >
              <HeaderStar filled={ids.length > 0} />
              {ids.length > 0 ? (
                <span className="absolute top-0 right-0 flex min-w-4 items-center justify-center rounded-full bg-(--nyu-indigo) px-1 text-[10px] leading-4 font-bold text-white">
                  {ids.length}
                </span>
              ) : null}
            </Link>
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
