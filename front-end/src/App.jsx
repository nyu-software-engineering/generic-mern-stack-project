import React, { useState } from "react";
import Login from "./pages/Login";
import Layout from "./pages/Layout";
import Signup from "./pages/Signup";
import Explore from "./pages/Explore";
import ReviewForm from "./components/ReviewForm";
import Messages from "./pages/Messages";
import PostSubletPage from "./pages/PostSubletPage";
import Profile from "./pages/Profile"
import MyListings from "./pages/MyListings"
import SavedListings from "./pages/SavedListings";
import ViewDetails from "./pages/ViewDetails";

import {BrowserRouter, Routes, Route} from "react-router-dom";
import "./App.css";

function App() {
  const [savedIds, setSavedIds] = useState([]);

  function toggleSave(id) {
    setSavedIds(current => {
        if (current.includes(id)) {
            return current.filter(savedId => savedId !== id);
        }
        return [...current, id];
    });
  }
  return (
    <BrowserRouter>
      <Routes>
        <Route path = "/app" element ={<Layout/>}>
          <Route index element = {<Login />} />
          <Route
            path="explore"
            element={<Explore savedIds={savedIds} onToggleSave={toggleSave} />}
          />
          <Route path = "reviewForm" element = {<ReviewForm />} />
          <Route path = "signUp" element = {<Signup />} />
          <Route path = "messages" element = {<Messages />} />
          <Route path = "post" element = {<PostSubletPage />} />
          <Route path = "profile" element = {<Profile />} />
          <Route path="listings/:id" element={<ViewDetails />} />
          <Route
            path="saved"
            element={<SavedListings savedIds={savedIds} onToggleSave={toggleSave} />}
          />
        </Route>

        <Route path = "/" element = {<Login />} />
        <Route path = "/signUp" element = {<Signup />} />
      </Routes>
    </BrowserRouter>
  );
  // const [page, setPage] = useState("login");

  // if (page === "login") {
  //   return (
  //     <Login 
  //       onLogin={() => setPage("home")} 
  //       goSignUp={() => setPage("signup")} 
  //       onGuest={() => setPage("home")} 
  //     />
  //   );
  // }

  // if (page === "signup") {
  //   return (
  //     <SignUp 
  //       onSignUp={() => setPage("home")} 
  //       goLogin={() => setPage("login")} 
  //       onGuest={() => setPage("home")} 
  //     />
  //   );
  // }

  // return (
  //   <div className="app">
  //     <header>
  //       <h1>Sublet Search</h1>
  //       <button className="btn" onClick={() => setPage("login")}>
  //         Log Out
  //       </button>
  //     </header>

  //     <main>
  //       <Explore />
  //       <ReviewForm userName="Alex" />
  //     </main>
  //   </div>
  // );
}

export default App;