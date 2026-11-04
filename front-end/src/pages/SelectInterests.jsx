import { useState } from "react";
import { useNavigate } from "react-router";
import "./SelectInterests.css";

const interests = [
  "Coffee",
  "Running",
  "Art",
  "Movies",
  "Food",
  "Music",
  "Study",
  "Games",
  "Sports",
  "Hiking",
];

export default function SelectInterests() {
  const [selectedInterests, setSelectedInterests] = useState([]);
  const navigate = useNavigate();

  function toggleInterest(interest) {
    if (selectedInterests.includes(interest)) {
      setSelectedInterests(
        selectedInterests.filter((item) => item !== interest),
      );
    } else {
      setSelectedInterests([...selectedInterests, interest]);
    }
  }

  function handleNext() {
    navigate("/setup-profile", {
      state: { interests: selectedInterests },
    });
  }

  return (
    <main className="interests-page">
      <div className="interests-container">
        <header className="interests-header">
          <h1>Your interests</h1>
        </header>

        <p className="interests-description">Select activities you enjoy</p>

        <div className="interests-grid">
          {interests.map((interest) => (
            <button
              key={interest}
              type="button"
              className={
                "doin-button interest-option " +
                (selectedInterests.includes(interest)
                  ? "interest-option--selected"
                  : "")
              }
              aria-pressed={selectedInterests.includes(interest)}
              onClick={() => toggleInterest(interest)}
            >
              {selectedInterests.includes(interest) ? "✓ " : ""}
              {interest}
            </button>
          ))}
        </div>

        <div className="interests-actions">
          <button
            type="button"
            className="doin-button interests-next"
            onClick={handleNext}
          >
            {selectedInterests.length === 0 ? "Skip" : "Next"}
          </button>

          <p>Step 1 of 2</p>
        </div>
      </div>
    </main>
  );
}
