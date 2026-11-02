import { Link } from "react-router-dom";

const Temphome = (props) => {
  return (
    <div>
      <h1>This is a temp page</h1>
      <Link to="/create"> See create_household</Link>
      <Link to="/register"> See register</Link>
    </div>
  );
};
export default Temphome;
