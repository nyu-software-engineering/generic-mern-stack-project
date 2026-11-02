
import { useState } from "react";
import "./PersonDetails.css";

function PersonDetails({ person, onBack }) {
  const [requested, setRequested] = useState(false);

  return (
    <div className="profile">
      <h1>{person.name}</h1>
      <hr />

      <div className="photo">
        <img src={person.image} alt={person.name} />
      </div>

      <h3>{person.hobbies.join(" • ")}</h3>

      <h3>About {person.name.split(" ")[0]}</h3>
      <p>{person.bio}</p>

      <h3>Shared interests</h3>
      <div className="interests">
        {person.sharedInterests.join(" • ")}
      </div>

      <button
        className="purple-button"
        onClick={() => setRequested(true)}
      >
        {requested ? "Request sent" : "Send connection request"}
      </button>

   <button className="purple-button" onClick={onBack}>
  Back to discovery
</button>

      <div className="navigation">
        <p>People　 Events　 Connect　 Profile</p>
      </div>
    </div>
  );
}

export default PersonDetails;
