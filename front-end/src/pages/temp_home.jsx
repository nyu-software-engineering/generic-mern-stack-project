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
    </div>
  )
}
export default Temphome;
