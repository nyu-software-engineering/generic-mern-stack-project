import React from 'react';
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
                <h1 className="header-logo">SplitLease</h1>
                <button className="profileButton">User Profile</button>
            </header>
            <h1>Welcome Back, {userName}!</h1>

            <div className="householdListContainer">
                <p className="fieldText">My Households</p>
                <input type="text" className="textInput" placeholder="search households"/>
                <div className="householdList">
                    {households.map((household, index) => (
                        <button key={index} type="button" className="householdItem" onCClick={() => console.log("Selected:", household)}>
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