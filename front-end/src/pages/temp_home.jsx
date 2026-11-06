import { Link } from "react-router-dom";
import SplitLeaseLogo from "../assets/splitlease-blank-background-logo.png";

const Temphome = (props) => {
  return (
    <div>
      <img
        src={SplitLeaseLogo}
        alt="SplitLeaseLogo"
        style={{
          width: "300px",
          height: "auto",
          display: "block",
          margin: "0 auto",
        }}
      />
      <Link to="/login"> See Login</Link>
      <br />
      <Link to="/register"> See Register</Link>
      <br />
      <Link to="/create"> See Create Household</Link>
      <br />
      <Link to="/home"> See User Home Page</Link>
      <br />
      <Link to="/individual-protocol"> See Individual Protocol</Link>
      <br />
      <Link to="/protocols"> See Protocols</Link>
      <br />
      <Link to="/assets"> See Assets</Link>
      <br />
      <Link to="/monthly-activity"> See Monthly Activity</Link>
    </div>
  )
}
export default Temphome;
