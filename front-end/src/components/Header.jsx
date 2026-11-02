import logo from "../assets/flier-logo-title-white.svg";
import home from "../assets/home-40px-white.svg";
import notifications from "../assets/notifications-40px-white.svg";
import { Link } from "react-router-dom";

export default function Header() {
  return (
    <>
      <header className="flex items-center justify-center mx-auto relative w-full h-30 bg-(--nyu-indigo)">
          <Link to="/home" className="absolute left-4 bottom-4">
            <img src={home} alt="Home"/>
          </Link>
          <Link to="/home" className="w-54">
            <img src={logo} alt="Flier logo: origami-style bird shaped like a paper plane, with text: Flier"/>
          </Link>
          <Link to="/" className="absolute right-4 bottom-4">
            <img src={notifications} alt="Notifications"/>
          </Link>
      </header>
    </>
  );
}