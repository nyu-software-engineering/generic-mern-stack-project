import React from "react";
import { useNavigate } from "react-router-dom";
import SplitLeaseLogo from "../../assets/splitlease-blank-background-logo.png";
import "./HouseholdDashboard.css";

const HouseholdDashboard = () => {
    const navigate = useNavigate();

    const members = [
        "member1",
        "member2",
        "member3"
    ];

    return (
        <div className="household-dashboard-container">
            <header className="header">
                <button type="button" className="logoButton" onClick={() => navigate('/home')}>
                    <img src={SplitLeaseLogo} alt="SplitLease Logo" className="headerLogo"/>
                </button>
                <button className="backButton" onClick={() => navigate('/home')}>
                    Back
                </button>
            </header>
            <h1>Household Dashboard</h1>

            <div className="membersListContainer">
                <div className="secitonHeader">
                    <p className="fieldText">Members</p>
                    <button className="manageMembersButton" onClick={() => navigate('/members')}>Manage Members</button>
                </div>
                <input type="text" className="textInput" placeholder="search members"/>
                <div className="membersList">
                    {members.map((member, index) => (
                        <button key={index} type="button" className="memebersItem" onClick={() => console.log("Selected:", member)}>
                            {member}
                        </button>
                    ))}
                </div>
            </div>

            <div className="assetsContainer">
                <p className="fieldText">Assets</p>
                <div className="assetsList">
                    <button className="viewAssetsButton" onClick={() => navigate('/assets')}>View Assets Page</button>
                    <p className="assetQuickInfo"># of Assets: 5</p>
                    <button className="fieldText">Quick Create Asset</button>
                </div>
            </div>

            <div className="assetsContainer">
                <p className="fieldText">Expenses</p>
                <div className="assetsList">
                    <button className="viewAssetsButton" onClick={() => navigate('/expenses')}>View Expenses Page</button>
                    <p className="fieldText">Preview Expenses</p>
                </div>
            </div>

            <div className="assetsContainer">
                <p className="fieldText">Protocols</p>
                <div className="assetsList">
                    <button className="viewAssetsButton" onClick={() => navigate('/protocols')}>View Protocols Page</button>
                    <p className="fieldText">Preview Protocols</p>
                </div>
            </div>
        </div>
    )

}

export default HouseholdDashboard;