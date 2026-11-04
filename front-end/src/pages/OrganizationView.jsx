import { useState } from "react";

// Stand-in for the club directory until it comes from the API.
const clubs = [
  {
    name: "Ballroom Dance",
    description: "Social dance every Thursday",
    logo: "https://picsum.photos/seed/flier-ballroom/96/96",
  },
  {
    name: "Code Lab",
    description: "Weekly project nights",
    logo: "https://picsum.photos/seed/flier-code/96/96",
  },
  {
    name: "Film Society",
    description: "Screenings and short films",
    logo: "https://picsum.photos/seed/flier-film/96/96",
  },
  {
    name: "Hiking Club",
    description: "Day trips outside the city",
    logo: "https://picsum.photos/seed/flier-hike/96/96",
  },
  {
    name: "Jazz Ensemble",
    description: "Open rehearsals on campus",
    logo: "https://picsum.photos/seed/flier-jazz/96/96",
  },
  {
    name: "Photography Club",
    description: "Walks and photo critiques",
    logo: "https://picsum.photos/seed/flier-photo/96/96",
  },
  {
    name: "Volunteer Network",
    description: "Local service projects",
    logo: "https://picsum.photos/seed/flier-volunteer/96/96",
  },
];

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth={2} className="size-7">
      <circle cx="11" cy="11" r="7" />
      <path strokeLinecap="round" d="M20 20l-3.5-3.5" />
    </svg>
  );
}

export default function OrganizationView() {
  const [query, setQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const shownClubs = clubs.filter((club) => {
    return club.name.toLowerCase().includes(query.trim().toLowerCase());
  });

  function toggleSearch() {
    if (searchOpen) {
      setQuery("");
    }
    setSearchOpen(!searchOpen);
  }

  return (
    <section className="flex flex-1 flex-col bg-(--parchment) px-5 pt-6 pb-8 text-(--soft-black)">
      <div className="mx-auto flex w-full max-w-md flex-col">
        <div className="flex items-center justify-between gap-3">
          <h1 className="heading">Organization List</h1>
          <button
            type="button"
            aria-label="Search clubs"
            aria-expanded={searchOpen}
            onClick={toggleSearch}
            className="flex size-10 shrink-0 items-center justify-center"
          >
            <SearchIcon />
          </button>
        </div>

        {searchOpen ? (
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search clubs"
            aria-label="Search clubs by name"
            autoFocus
            className="body-copy mt-4 w-full rounded-xl border border-black/10 bg-white px-4 py-3 outline-none"
          />
        ) : null}

        {shownClubs.length === 0 ? (
          <p className="body-copy mt-6">No clubs match that name.</p>
        ) : (
          <ul className="mt-5 flex flex-col gap-3">
            {shownClubs.map((club) => (
              <li key={club.name}>
                <button type="button" className="flex w-full items-center gap-4 rounded-2xl bg-white px-4 py-4 text-left shadow-sm ring-1 ring-black/5">
                  <img
                    src={club.logo}
                    alt=""
                    className="size-14 shrink-0 rounded-full bg-(--paper) object-cover"
                  />
                  <span>
                    <span className="block text-lg font-bold [font-family:var(--font-petrona)]">{club.name}</span>
                    <span className="body-copy block">{club.description}</span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
