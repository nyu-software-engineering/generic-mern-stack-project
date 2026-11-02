import React, { useState } from "react";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import Explore from "./pages/Explore";
import ReviewForm from "./components/ReviewForm";
import "./App.css";

function App() {
  const [page, setPage] = useState("login");

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

  return (
    <div className="app">
      <header>
        <h1>Sublet Search</h1>
        <button className="btn" onClick={() => setPage("login")}>
          Log Out
        </button>
      </header>

      <main>
        <Explore />
        <ReviewForm userName="Alex" />
      </main>
    </div>
  );
}

export default App;