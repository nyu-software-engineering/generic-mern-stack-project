import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useNavigate } from "react-router-dom";
import axios from 'axios';
import SplitLeaseLogo from "../../assets/splitlease-blank-background-logo.png";
import './AssetList.css';


const AssetList = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [assets, setAssets] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        axios('https://my.api.mockaroo.com/assets.json?key=29824db0')    
            .then(response => {
                console.log("API Response:", response.data);
                setAssets(response.data);
            })
            .catch((err) => {
                console.error('Error getting assets:', err);
            });
    }, []);

    const filteredAssets = assets.filter(asset => 
        asset.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="asset-page-container">
            <div className="asset-header">
                <button type="button" className="logoButton" onClick={() => navigate('/home')}>
                    <img src={SplitLeaseLogo} alt="SplitLease Logo" className="headerLogo"/>
                </button>
                <button className="backButton" onClick={() => navigate('/household')}>
                    Back
                </button>
            </div>

            <main className="main-container">
                { /* Outer box */ }
                <div className="assets-outer-container">
                    <h1 className="asset-page-title">Assets</h1>

                    <div className="action-container">
                        <div className="create-container">
                            <Link to ="/create-asset" className="create-asset-button">
                                Create Asset
                            </Link>
                        </div>

                        { /* Search bar */ }
                        <div className = "search-container">
                            <input
                                type="text"
                                className="search-input"
                                placeholder="Search assets"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                    {/* Create asset button */}
                    

                    { /* Inner box with grid */}
                    <div className="asset-inner-container">
                        <div className="asset-grid">
                            {filteredAssets.length > 0 ? (
                                filteredAssets.map((asset) => (
                                    <div key={asset.id} className="asset-card">
                                        <div className="asset-square">
                                            <div className="asset-name">{asset.name}</div>
                                            <img src={'https://picsum.photos/id/' + asset.id * 20 + '/100/100'}
                                                alt={asset.name}
                                                className="asset-image"
                                            />
                                            <div className="asset-description">{asset.description}</div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                            <p className="no-assets">No assets found.</p>
                            )}
                        </div>
                    </div>
                </div>            
            </main>
        </div>
    );
}

export default AssetList;