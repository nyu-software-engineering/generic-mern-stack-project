import React, { useState } from 'react';
import { link } from 'react-router-dom';

export default function AssetListPage({ assets}) {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredAssets = assets.filter((asset) =>
        asset.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="asset-page-container">
            <header className="page-header">
                <h1>Household Assets</h1>
            </header>

            { /* Search bar */ }
            <div className="search-container">
                <input
                    type="text"
                    placeholder="Search assets..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <div className="asset-grid">

            </div>
        </div>

