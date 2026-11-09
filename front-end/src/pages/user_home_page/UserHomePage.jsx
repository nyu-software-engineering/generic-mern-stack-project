import React, { useState, useEffect } from "react";
import SplitLeaseLogo from "../../assets/splitlease-blank-background-logo.png";
import { useNavigate } from "react-router-dom";
import "./UserHomePage.css";
import axios from "axios";

function UserHomePage() {
  const userName = "[user]";
  const navigate = useNavigate();

  const [households, setHouseholds] = useState([]);

  useEffect(() => {
    const fetchHouseholds = async () => {
      try {
        const response = await axios.get(
          import.meta.env.VITE_HOUSEHOLDS_API_URL,
        );
        const uniqueHouseholds = response.data.filter(
          (household, index, self) =>
            index ===
            self.findIndex(
              (h) => h.household_name === household.household_name,
            ),
        );

        setHouseholds(uniqueHouseholds);
      } catch (error) {
        console.error("Error fetching households:", error);
      }
    };

    fetchHouseholds();
  }, []);

  return (
    <div className="createUserHomePageContainer">
      <header className="header">
        <button
          type="button"
          className="logoButton"
          onClick={() => navigate("/home")}
        >
          <img
            src={SplitLeaseLogo}
            alt="SplitLease Logo"
            className="headerLogo"
          />
        </button>
        <button className="profileButton" onClick={() => navigate("/profile")}>
          User Profile
        </button>
      </header>

      <h1>Welcome Back, {userName}!</h1>

      <div className="householdListContainer">
        <p className="fieldText">My Households</p>
        <input
          type="text"
          className="textInput"
          placeholder="search households"
        />

        <div className="householdList">
          {households.length === 0 ? (
            <p className="fieldText">No households available.</p>
          ) : (
            households.map((household, index) => (
              <button
                key={household.id || index}
                type="button"
                className="householdItem"
                onClick={() => navigate("/household")}
              >
                {household.household_name || household.name || household}
              </button>
            ))
          )}
        </div>
      </div>

            <div className="actionButtons">
                <button
                    className="createButton"
                    type="button"
                    onClick={() => navigate('/create')}
                >
                    Create Household
                </button>
                <button className="createButton"
                        type="button"
                        onClick={() => navigate('/join-household')}>Join Household</button>
            </div>
        </div>
    );
}

export default UserHomePage;
