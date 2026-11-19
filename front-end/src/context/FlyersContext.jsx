import { createContext, useContext, useState } from "react";
import { flyers as seedFlyers } from "../data/flyers";

const FlyersContext = createContext(null);

// Flyers live in memory only: uploaded images are blob URLs, which do not
// survive a page reload, so saving them to localStorage would break them.
export function FlyersProvider({ children }) {
  const [flyers, setFlyers] = useState(seedFlyers);

  function getFlyer(id) {
    return flyers.find((flyer) => flyer.id === id);
  }

  function addFlyer(fields) {
    // Temporary id until the back end assigns one.
    const id = `flyer-${Date.now()}`;
    setFlyers((current) => [...current, { ...fields, id }]);
    return id;
  }

  function updateFlyer(id, fields) {
    setFlyers((current) =>
      current.map((flyer) => (flyer.id === id ? { ...flyer, ...fields, id } : flyer)),
    );
  }

  return (
    <FlyersContext.Provider value={{ flyers, getFlyer, addFlyer, updateFlyer }}>
      {children}
    </FlyersContext.Provider>
  );
}

// Context modules export a provider component and the hook that reads it.
// eslint-disable-next-line react-refresh/only-export-components
export function useFlyers() {
  const value = useContext(FlyersContext);
  if (!value) {
    throw new Error("useFlyers must be used within FlyersProvider");
  }
  return value;
}
