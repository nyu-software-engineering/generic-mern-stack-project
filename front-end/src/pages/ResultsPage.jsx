import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import HotelDetails from "../components/HotelDetails";
import "./Home&ResultsPage.css";



// this updat will make us to stay at home page afte clicking search while search results wil pop up

export function HotelSearchResults({ query }) {
  const [hotel, setHotel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    async function searchHotels() {
      try {
        const params = new URLSearchParams({ q: query });
        const response = await fetch(`/api/hotels/search?${params}`, {
          signal: controller.signal,
        });

        if (!response.ok) throw new Error("Could not search hotels.");

        const data = await response.json();
        setHotel(data.hotel);
      } catch (err) {
        if (!controller.signal.aborted) setError(err.message);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    searchHotels();
    return () => controller.abort();
  }, [query]);

  return (
    <section className="results-content" aria-labelledby="search-results-heading">
      <h2 id="search-results-heading" className="results-title">
        Search results for “{query}”
      </h2>

      {loading && <p role="status">Searching...</p>}
      {error && <p role="alert">{error}</p>}
      {hotel && <HotelDetails hotel={hotel} />}
      {!loading && !error && !hotel && <p>No hotels found.</p>}
    </section>
  );
}

export default function ResultsPage() {
  const [searchParams] = useSearchParams();
  const query = (searchParams.get("q") ?? "").trim();

  return (
    <main className="homepage results-page">
      <Link to="/">Back to home</Link>
      {query && <HotelSearchResults key={query} query={query} />}
    </main>
  );
}