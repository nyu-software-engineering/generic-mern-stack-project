import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import SplitLeaseLogo from "../../assets/splitlease-blank-background-logo.png";
import "./HouseholdDashboard.css";
import axios from "axios";

const HouseholdDashboard = () => {
  const navigate = useNavigate();
  const [members, setMembers] = useState([]);

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const response = await axios.get(import.meta.env.VITE_MEMBERS_API_URL);
        setMembers(response.data);
      } catch (error) {
        console.error("Error fetching members:", error);
      }
    };

    fetchMembers();
  }, []);

  return (
    <div className="household-dashboard-container">
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
        <button className="backButton" onClick={() => navigate("/home")}>
          Back
        </button>
      </header>
      <h1>Household Dashboard</h1>

      <div className="dashboardGrid">
        <div className="membersListContainer">
          <div className="secitonHeader">
            <p className="fieldText">Members</p>
            <button
              className="manageMembersButton"
              onClick={() => navigate("/manage-members")}
            >
              Manage Members
            </button>
          </div>
          <input
            type="text"
            className="textInput"
            placeholder="search members"
          />
          <div className="membersList">
            {members.length === 0 ? (
              <p className="fieldText">No members available.</p>
            ) : (
              members.map((member, index) => (
                <button
                  key={member.id || index}
                  type="button"
                  className="memebersItem"
                  onClick={() => console.log("Selected:", member.first_name || member)}
                >
                  {member.first_name || member}
                </button>
              ))
            )}
          </div>
        </div>

        <div className="assetsContainer">
          <p className="fieldText">Assets</p>
          <div className="assetsList">
            <button
              className="viewAssetsButton"
              onClick={() => navigate("/assets")}
            >
              View Assets Page
            </button>
            <p className="assetQuickInfo"># of Assets: 5</p>
            <button
              className="fieldText"
              onClick={() => navigate("/assets/create")}
            >
              Quick Create Asset
            </button>
          </div>
        </div>

        <div className="assetsContainer">
          <p className="fieldText">Expenses</p>
          <div className="assetsList">
            <button
              className="viewAssetsButton"
              onClick={() => navigate("/expenses")}
            >
              View Expenses Page
            </button>
            <p className="fieldText">Preview Expenses</p>
          </div>
        </div>

        <div className="assetsContainer">
          <p className="fieldText">Protocols</p>
          <div className="assetsList">
            <button
              className="viewAssetsButton"
              onClick={() => navigate("/protocols")}
            >
              View Protocols Page
            </button>
            <p className="fieldText">Preview Protocols</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HouseholdDashboard;