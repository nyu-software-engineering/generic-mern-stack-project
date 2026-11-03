import React, { useState } from "react";
import Login from "./pages/Login";
import Layout from "./pages/Layout";
import Signup from "./pages/Signup";
import Explore from "./pages/Explore";
import ReviewForm from "./components/ReviewForm";
import Messages from "./pages/Messages";
import Post from "./pages/Post";

import {BrowserRouter, Routes, Route} from "react-router-dom";
import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path = "/" element ={<Layout/>} />
          <Route index element = {<Login />} />
          <Route path = "explore" element = {<Explore />} />
          <Route path = "reviewForm" element = {<ReviewForm />} />
          <Route path = "signUp" element = {<Signup />} />
          <Route path = "messages" element = {<Messages />} />
          <Route path = "post" element = {<Post />} />
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