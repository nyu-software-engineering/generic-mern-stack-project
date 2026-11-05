import { useState } from "react";
import { hobbies, creators } from "./mockData";

function Following() {
  const [tab, setTab] = useState("hobbies");

  return (
    <div className="page">
      <h2>Following</h2>

      <button onClick={() => setTab("hobbies")}>
        Hobbies
      </button>

      <button onClick={() => setTab("creators")}>
        Creators
      </button>

      {tab === "hobbies" &&
        hobbies.map((hobby) => (
          <div className="follow-item" key={hobby.id}>
            <img src={hobby.image} alt="" />
            <div>
              <strong>{hobby.name}</strong>
              <p>{hobby.update}</p>
            </div>
            <button>Unfollow</button>
          </div>
        ))}

      {tab === "creators" &&
        creators.map((creator) => (
          <div className="follow-item" key={creator.id}>
            <img src={creator.image} alt="" />
            <div>
              <strong>{creator.name}</strong>
              <p>{creator.update}</p>
            </div>
            <button>Unfollow</button>
          </div>
        ))}
    </div>
  );
}

export default Following;