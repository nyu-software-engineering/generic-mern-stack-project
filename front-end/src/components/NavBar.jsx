import list from "../assets/list-view-40px-black.svg";
import calendar from "../assets/calendar-view-40px-black.svg";
import add from "../assets/add-box-40px-black.svg";
import map from "../assets/map-view-40px-black.svg";
import { NavLink, useLocation } from "react-router-dom";
import "./NavBar.css";

export default function NavBar() {
  return (
    <nav className="flex w-full items-center justify-center m-auto bg-(--parchment) fixed bottom-0 inset-shadow-sm">
      <div className="flex justify-between w-full items-center">
        <NavLink to="/organizations" className={({isActive}) => `navlink ${isActive ? "active" : ""}`}>
          <img src={list}/>
        </NavLink>
        <NavLink to="/calendar" className={({isActive}) => `navlink ${isActive ? "active" : ""}`}>
          <img src={calendar}/>
        </NavLink>
        <NavLink to="/add-flyer" className={({isActive}) => `navlink ${isActive ? "active" : ""}`}>
          <img src={add}/>
        </NavLink>
        <NavLink to="/map" className={({isActive}) => `navlink ${isActive ? "active" : ""}`}>
          <img src={map}/>
        </NavLink>
        <NavLink to="/profile" className={({isActive}) => `navlink ${isActive ? "active" : ""}`}>
          <img src="https://picsum.photos/38/38" className="rounded-full border-(--soft-black) border-[0.08em]"/>
        </NavLink>
      </div>
    </nav>
  );
}