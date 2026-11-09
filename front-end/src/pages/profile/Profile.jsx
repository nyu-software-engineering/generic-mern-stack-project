import SplitLeaseLogo from "../../assets/splitlease-blank-background-logo.png";
import { useNavigate } from 'react-router-dom';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './Profile.css';

const Profile = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState({
        firstName: '',
        lastName: '',
        email: '',
        profilePic: 'https://picsum.photos/150/150'
    });

    useEffect(() => {
        axios.get(import.meta.env.VITE_MEMBERS_API_URL)
            .then(({ data }) => {
                const first = data[0];

            if (!first){
                console.error('No members');
                return;
            }

            setUser(currentUser => ({
                ...currentUser,
                firstName: first.first_name,
                lastName: first.last_name,
                email: first.email
            }));
        })
        .catch(error => {
            console.error('Error fetching member: ', error);
            });
    }, []);

    return (
        <div className="profile-page-container">
            <div className="asset-header">
                <button type="button" className="logoButton" onClick={() => navigate('/home')}>
                    <img src={SplitLeaseLogo} alt="SplitLease Logo" className="headerLogo"/>
                </button>
                <button className="backButton" onClick={() => navigate('/home')}>
                    Back
                </button>
            </div>

            <div className="profile-header-card">
                <div className="profile-pic-container">
                    <img 
                        src={user.profilePic} 
                        alt="Profile" 
                        className="profile-avatar" 
                    />
                </div>
                <div className="profile-info">
                    <h2 className="profile-name">
                        {user.firstName} {user.lastName}
                    </h2>
                    <p className="profile-email">{user.email}</p>
                </div>
            </div>

            <div className="account-section">
                <h3 className="section-title">My Account</h3>
                
                <div className="account-outer-container">
                    
                    {/* Settings Options */}
                    <div className="settings-list">
                        <button className="settings-button">
                            <span>Name</span>
                        </button>
                        <button className="settings-button">
                            <span>Profile Picture</span>
                        </button>
                        <button className="settings-button">
                            <span>Preferred Payment</span>
                        </button>
                        <button className="settings-button">
                            <span>Account Security</span>
                        </button>
                    </div>

                    <div className="logout-container">
                        <button className="logout-button" onClick={() => navigate('/')}>
                            Logout
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default Profile;