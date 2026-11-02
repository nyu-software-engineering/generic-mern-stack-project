import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './AssetListPage.css';

export default function AssetListPage({ assets}) {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredAssets = assets.filter((asset) =>
        asset.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="asset-page-container">
            { /* Navigation header */ }
            <header className="page-header">
                <div className="header-buttons">
                    <button className="logo-button" onClick={() => navigate('/')}>Logo</button>
                    <button className="back-button" onClick={() => navigate(-1)}>Back</button>
                </div>
                <h1 className="page-title">Household Assets</h1>
            </header>

            <main className="main-container">
                { /* Outer box */ }
                <div className="assets-outer-container">

                    { /* Search bar */ }
                    <div className = "search container">
                        <input
                            type="text"
                            className="search-input"
                            placeholder="Search assets"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                

                    { /* Inner box with grid */}
                    <div className="asset-inner-container">
                        <div className="asset-grid">
                            {filteredAssets.length > 0 ? (
                                filteredAssets.map((asset) => (
                                    <div key={asset.id} className="asset-card">
                                        <div className="asset-square">
                                            <span className="asset-name">{asset.name}</span>
                                        </div>
                                    </div>
                                ))
                            ) : (
                            <p className="no-assets">No assets found.</p>
                            )}
                        </div>
                    </div>
                </div>            

                {/* Create asset button */}
                <div className="action-container">
                    <Link to ="/create-asset" className="create-asset-button">
                        Create Asset
                    </Link>
                </div>
            </main>
        </div>
    );
}