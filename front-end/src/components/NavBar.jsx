import list from "../assets/list-view-40px.svg";
import calendar from "../assets/calendar-view-40px.svg";
import add from "../assets/add-box-40px.svg";
import map from "../assets/map-view-40px.svg";
import { NavLink } from "react-router-dom";
import "./NavBar.css";

export default function NavBar() {
  return (
    <nav className="flex w-full items-center justify-center m-auto bg-(--nyu-indigo)">
      <div className="flex justify-between w-[90%]">
        <NavLink to="/organizations" id="navlink">
          <img src={list}/>
        </NavLink>
        <NavLink to="/calendar" id="navlink">
          <img src={calendar}/>
        </NavLink>
        <NavLink to="/add-flyer" id="navlink">
          <img src={add}/>
        </NavLink>
        <NavLink to="/map" id="navlink">
          <img src={map}/>
        </NavLink>
        <NavLink to="/profile" id="navlink">
          <img src="https://picsum.photos/40/40" className="rounded-full"/>
        </NavLink>
      </div>
    </nav>
  );
}