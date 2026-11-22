import { createContext, useContext, useEffect, useState } from "react";

const curBookingContext = createContext(null);

{
  /*used to share data to children in order for different files to have access to some shared data*/
}
export function SavedCurrentBooking({ children }) {
  const [curBookings, setCurBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const sameId = (a, b) => String(a) === String(b);

  useEffect(() => {
    const loadBookings = async () => {
      try {
        const res = await fetch("/api/bookings");
        if (!res.ok) {
          throw new Error(`Server error ${res.status}`);
        }
        const data = await res.json();
        setCurBookings(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadBookings();
  }, []);

  const isBookingSaved = (id) =>
    curBookings.some((item) => sameId(item.id, id));

  const addBooking = async (hotel) => {
    const res = await fetch("/api/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(hotel),
    });
    if (!res.ok) throw new Error("Couldn't book hotel");
    const newBooking = await res.json();
    setCurBookings((savedList) =>
      savedList.some((item) => sameId(item.id, newBooking.id))
        ? savedList
        : [...savedList, newBooking],
    );
  };

  const deleteBooking = async (id) => {
    const res = await fetch(`/api/bookings/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error("Couldn't delete booking");
    setCurBookings((savedList) =>
      savedList.filter((item) => !sameId(item.id, id)),
    );
  };

  const toggleBookingSaved = async (hotel) => {
    {
      /*ran when the save/book buttons in hotel details is ran*/
    }
    try {
      if (isBookingSaved(hotel.id)) {
        await deleteBooking(hotel.id);
      } else {
        await addBooking(hotel);
      }
    } catch (err) {
      console.error(err.message);
    }
  };

  const updateBooking = async (id, newDescription, newCheckIn, newCheckOut) => {
    const res = await fetch(`/api/bookings/${id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        description: newDescription,
        checkIn: newCheckIn,
        checkOut: newCheckOut,
      }),
    });
    if (!res.ok) throw new Error("Couldn't save booking");
    const updated = await res.json();
    setCurBookings((bookingList) =>
      bookingList.map((item) => (sameId(item.id, id) ? updated : item)),
    );
  };

  return (
    <curBookingContext.Provider
      value={{
        curBookings,
        loading,
        error,
        addBooking,
        deleteBooking,
        toggleBookingSaved,
        isBookingSaved,
        updateBooking,
      }}
    >
      {children}
    </curBookingContext.Provider>
  );
}

export function useCurBookings() {
  const context = useContext(curBookingContext);
  if (!context) throw new Error("Use in a <SavedCurrentBookings>");
  return context;
}
