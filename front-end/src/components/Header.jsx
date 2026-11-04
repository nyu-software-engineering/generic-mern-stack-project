import { Link } from "react-router-dom";
import SplitLeaseLogo from "../assets/splitlease-blank-background-logo.png";

function Header() {
  return (
    <header style={{ display: "flex", justifyContent: "center" }}>
      <Link to="/">
        <img src={SplitLeaseLogo} alt="Split Lease" height="60" />
      </Link>
    </header>
  );
}

export default Header;
