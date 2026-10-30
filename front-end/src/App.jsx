import {BrowserRouter, Routes, Route} from "react-router-dom"

import Homepage from "./pages/homepage"
import Inbox from "./pages/inbox"
import Navbar from "./pages/navbar"

export default function App() {
  return (
    <BrowserRouter basename = {import.meta.env.BASE_URL}>
      <Navbar />
      
      <Routes>
        <Route path = "/" element = {<Homepage />} />
        <Route path = "/inbox" element = {<Inbox />} />
      </Routes>
    </BrowserRouter>
  )
}

