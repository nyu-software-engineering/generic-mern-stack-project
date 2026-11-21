import HotelDetails from "../components/HotelDetails";

import "./Home&ResultsPage.css";
import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";

function ResultsPage() {

  // this part is for the search feature
  const [searchParams] = useSearchParams();
const query = (searchParams.get("q") ?? "").trim();
const [hotel, setHotel] = useState(null);
const [loading, setLoading] = useState(false);
const [error, setError] = useState("");

useEffect(() => {
  setHotel(null);
  setError("");
  setLoading(Boolean(query));

  if (!query) return;

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

// this is the end of search featur code



  return (
    <main className="homepage results-page">
        <header className="home-header">
            <img src="https://picsum.photos/340/180" alt="Sample" className="logo" />

        <div className="home-header-actions">
        </div>
      </header>


      <section className="home-search">
        <label className="home-search-label" htmlFor="home-search-input">
          search
        </label>

        <input
          id="home-search-input"
          className="home-search-input"
          type="text"
          readOnly
        />

       <Link to="/results" className="home-search-button">
              search
        </Link>
      </section>

 {/* These are copied form the home page elements for reuse. Always keep them in sync with the home page. */}






    <section className="results-content">
  <h2 className="results-title">results</h2>

<div className="results-cards">
  {loading && <p>Searching...</p>}
  {error && <p role="alert">{error}</p>}
  {hotel && <HotelDetails hotel={hotel} />}
  {query && !loading && !error && !hotel && <p>No hotels found.</p>}
</div>
    </section>


    </main>




   
  );
}

export default ResultsPage;
