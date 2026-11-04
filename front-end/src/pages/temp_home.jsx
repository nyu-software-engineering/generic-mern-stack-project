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
      <Link to="/register"> See register</Link>
      <br />
      <Link to="/create"> See create_household</Link>
      <br />
      <Link to="/individual-protocol"> See individual protocol</Link>
      <br />
      <Link to="/protocols"> See Protocols</Link>
      <br />
      <Link to="/assets"> See assets</Link>
      <br />
      <Link to="/monthly-activity"> See Monthly Activity</Link>
    </div>
  );
};
export default Temphome;
