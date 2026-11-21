import { useState } from "react";
import EditBooking from "./EditBooking";
import "./Home&ResultsPage.css";
import { Link } from "react-router-dom";
import { useCurBookings } from "../shared_content/SavedCurrentBookings";
import BookingCard from "../components/BookingCard";

function HomePage() {
  const {curBookings, loading, error, deleteBooking, updateBooking} = useCurBookings();
  const [currentView, setCurrentView] = useState('noEdit');
  const [activeItemEdit, setActiveItemEdit] = useState(null);

  const handleEdit = (item) => {
      setCurrentView("edit");
      setActiveItemEdit(item);
    }

    const handleGoBack = () => {
      setCurrentView("noEdit");
      setActiveItemEdit(null);
    }

    const handleSave = async (id, newDescription, newCheckIn, newCheckOut) => {
      try {
        await updateBooking(id, newDescription, newCheckIn, newCheckOut);
        handleGoBack();
      } catch (err) {
        console.error(err.message);
      }
    };

    {/*modify for data base later*/}
    const handleDelete = async (id) => {
      try {
        await deleteBooking(id);
        handleGoBack();
      } catch (err) {
        console.error(err.message);
      }
    };

    return currentView === 'noEdit' ? (
    <main className="homepage">
      <header className="home-header">
        <img src="https://picsum.photos/340/180" className="logo"/>
      </header>

      <section className="home-search">
        <label className="home-search-label">
          search
        </label>

        <input
          id="home-search-input"
          className="home-search-input"
          type="text"
        />

        <Link to="/results" className="home-search-button">
          search
        </Link>
      </section>

      <div id='home-page-current-bookings'>
      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p>Couldn't load bookings: {error}</p>
      ) : curBookings.length === 0 ? (
        <p>You dont have any current bookings yet!</p>
      ) : (
        <>
        <p>Current Bookings</p>
        {curBookings.map((item) => (
          <BookingCard key={item.id} checkIn = {item.checkIn} checkOut = {item.checkOut} name={item.name} location={item.location} description={item.description} Edit={()=>handleEdit(item)}/>
        ))}
        </>
      )}
      </div>
    </main>
  ) : (
    <EditBooking checkIn={activeItemEdit.checkIn} checkOut={activeItemEdit.checkOut} id={activeItemEdit.id} name={activeItemEdit.name} location={activeItemEdit.location} description={activeItemEdit.description} goBack={handleGoBack} onSave={handleSave} onDelete={handleDelete}/>
  );
}

export default HomePage;