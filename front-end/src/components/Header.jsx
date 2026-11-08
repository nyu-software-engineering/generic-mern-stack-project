import logo from "../assets/flier-logo-title.svg";
import home from "../assets/home-40px-black.svg";
import notifications from "../assets/notifications-40px-black.svg";
import { Link } from "react-router-dom";

export default function Header() {
  return (
    <header className="flex items-center justify-center mx-auto relative w-full h-24 bg-(--paper)">
        <Link to="/home" className="absolute left-4 bottom-2">
          <img src={home} alt="Home" className="w-8"/>
        </Link>
        <Link to="/home" className="w-54">
          <img src={logo} alt="Flier logo: origami-style bird shaped like a paper plane, with text: Flier"/>
        </Link>
        <Link to="/notifications" className="absolute right-4 bottom-2">
          <img src={notifications} alt="Notifications" className="w-8"/>
        </Link>
    </header>
  );
}