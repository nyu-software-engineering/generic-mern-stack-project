import React, { useState } from "react";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import ListingCard from "./components/ListingCard";
import "./App.css";

function App() {
  // Page state options: "login", "signup", or "home"
  const [page, setPage] = useState("login");

  const testListing = {
    title: "Brooklyn Apartment",
    location: "Williamsburg, Brooklyn",
    price: "$1,650",
    roommates: 2,
    image: "/images/sublet-sample-apartment.webp"
  };

  if (page === "login") {
    return (
      <Login 
        onLogin={() => setPage("home")} 
        goSignUp={() => setPage("signup")} 
        onGuest={() => setPage("home")} 
      />
    );
  }
  
  if (page === "signup") {
    return (
      <SignUp 
        onSignUp={() => setPage("home")} 
        goLogin={() => setPage("login")} 
        onGuest={() => setPage("home")} 
      />
    );
  }

  // Show Main App page (when page === "home")
  return (
    <div className="app">
      <header>
        <h1>Sublet Search</h1>
        <button className="btn" onClick={() => setPage("login")}>
          Log Out
        </button>
      </header>

      <main>
        <h2>Explore Sublets</h2>
        <ListingCard listing={testListing} />
      </main>
    </div>
  );
}

export default App;
