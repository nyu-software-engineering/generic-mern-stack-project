import React from 'react';
import SplitLeaseLogo from "../../assets/splitlease-blank-background-logo.png";
import { useNavigate } from 'react-router-dom';
import './UserHomePage.css';

function UserHomePage() {
    const userName = "[user]";

    const navigate = useNavigate();

    const households = [
        "Household 1"
    ]

    return(
        <div className = "createUserHomePageContainer">
            <header className="header">
                <button type="button" className="logoButton" onClick={() => navigate('/home')}>
                    <img src={SplitLeaseLogo} alt="SplitLease Logo" className="headerLogo"/>
                </button>
                <button className="profileButton">User Profile</button>
            </header>
            <h1>Welcome Back, {userName}!</h1>

            <div className="householdListContainer">
                <p className="fieldText">My Households</p>
                <input type="text" className="textInput" placeholder="search households"/>
                <div className="householdList">
                    {households.map((household, index) => (
                        <button key={index} type="button" className="householdItem" onClick={() => navigate('/household')}>
                            {household}
                        </button>
                    ))}
                </div>
            </div>

            <div className="actionButtons">
                <button className="createButton" type="button" onClick={() => navigate('/create')}>
                    Create Household
                </button>
                <button className="createButton">Join Household</button>
            </div>
        </div>
    )
}

export default UserHomePage;