import { createContext, useContext, useEffect, useState } from "react";
import { clubs } from "../data/clubs";

const STORAGE_KEY = "flier-favorites";
const knownIds = new Set(clubs.map((club) => club.id));

const FavoritesContext = createContext(null);

function readFavorites() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (!Array.isArray(saved)) {
      return [];
    }
    return saved.filter((id) => knownIds.has(id));
  } catch {
    return [];
  }
}

export function FavoritesProvider({ children }) {
  const [ids, setIds] = useState(readFavorites);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  }, [ids]);

  function isFavorite(id) {
    return ids.includes(id);
  }

  function toggleFavorite(id) {
    setIds((current) => {
      if (current.includes(id)) {
        return current.filter((item) => item !== id);
      }
      return [...current, id];
    });
  }

  const favoriteClubs = ids
    .map((id) => clubs.find((club) => club.id === id))
    .filter(Boolean);

  return (
    <FavoritesContext.Provider value={{ ids, favoriteClubs, isFavorite, toggleFavorite }}>
      {children}
    </FavoritesContext.Provider>
  );
}

// Context modules export a provider component and the hook that reads it.
// eslint-disable-next-line react-refresh/only-export-components
export function useFavorites() {
  const value = useContext(FavoritesContext);
  if (!value) {
    throw new Error("useFavorites must be used within FavoritesProvider");
  }
  return value;
}
