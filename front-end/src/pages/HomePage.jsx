import "./HomePage.css";
import { Link } from "react-router-dom";

function HomePage() {
  return (
    <main className="homepage">
        <header className="home-header">
            <img src="https://picsum.photos/340/180" alt="Sample" className="logo" />

            <div className="home-header-actions">
            <button type="button" className="home-header-button">
            profile
          </button>

          <button type="button" className="home-header-button">
            saved
          </button>
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











    </main>
  );
}

export default HomePage;