import Header from "./Header";
import NavBar from "./NavBar";
import { Outlet } from "react-router-dom";

export default function Layout () {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
        <main className="flex flex-1 flex-col bg-(--paper)">
          <Outlet />
        </main>
      <NavBar />
    </div>
  );
}