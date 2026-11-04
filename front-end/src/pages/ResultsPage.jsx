import HotelDetails from "../components/HotelDetails";
import { Link } from "react-router-dom";

function ResultsPage() {
  return (
    <main className="homepage">
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
    <HotelDetails />
    <HotelDetails />
  </div>
    </section>


    </main>




   
  );
}

export default ResultsPage;