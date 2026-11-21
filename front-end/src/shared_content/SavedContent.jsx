import { createContext, useContext, useEffect, useState } from "react";

const SavedContext = createContext(null);

export function SavedContent({ children }) {
  const [savedItems, setSavedItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadSaved = async () => {
      try {
        const res = await fetch("/api/saved", {
          method: "GET",
        });
        if (!res.ok) {
          throw new Error(`Server error ${res.status}`);
        }
        const data = await res.json();
        setSavedItems(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadSaved();
  }, []);

  const sameId = (a, b) => String(a) === String(b);

  const isSaved = (id) => savedItems.some((item) => sameId(item.id, id));

  const addSaved = async (hotel) => {
    //function calling this handles the potential error
    const res = await fetch("/api/saved", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(hotel),
    });
    if (!res.ok) throw new Error("Couldn't save hotel");
    const newItem = await res.json();
    setSavedItems((savedList) =>
      savedList.some((item) => sameId(item.id, newItem.id))
        ? savedList
        : [...savedList, newItem],
    );
  };

  const removeSaved = async (id) => {
    //function calling this handles the potential error
    const res = await fetch(`/api/saved/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error("Couldn't delete hotel");
    setSavedItems((savedList) =>
      savedList.filter((item) => !sameId(item.id, id)),
    );
  };

  const toggleSaved = async (hotel) => {
    try {
      if (isSaved(hotel.id)) {
        await removeSaved(hotel.id);
      } else {
        await addSaved(hotel);
      }
    } catch (err) {
      console.err(err.message);
    }
  };

  const updateDescription = async (id, newDescription) => {
    const res = await fetch(`/api/saved/${id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ description: newDescription }),
    });
    if (!res.ok) throw new Error("Couldn't save changes");
    const updated = await res.json();
    setSavedItems((savedList) =>
      savedList.map((item) => (sameId(item.id, id) ? updated : item)),
    );
  };

  return (
    <SavedContext.Provider
      value={{
        savedItems,
        loading,
        error,
        isSaved,
        toggleSaved,
        removeSaved,
        updateDescription,
      }}
    >
      {children}
    </SavedContext.Provider>
  );
}

export function useSaved() {
  const context = useContext(SavedContext);
  if (!context) {
    throw new Error("useSaved must be used inside <SavedContent>");
  }
  return context;
}
