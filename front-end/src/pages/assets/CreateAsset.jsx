import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";
import SplitLeaseLogo from "../../assets/splitlease-blank-background-logo.png";
import './CreateAsset.css';

const CreateAsset = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        price: '',
        date: '',
        paidBy: ''
    });

    const handleChange = (event) => {
        const { name, value } = event.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleSubmit = (event) => {
        event.preventDefault(); 
        console.log("Form submission simulated. Data:", formData);
    };

    return (
        <div className="create-page-container">

            <div className="asset-header">
                <button type="button" className="logoButton" onClick={() => navigate('/home')}>
                    <img src={SplitLeaseLogo} alt="SplitLease Logo" className="headerLogo"/>
                </button>
                <button className="backButton" onClick={() => navigate('/household')}>
                     Back
                </button>
            </div>

            <main className="form-main-container">

                <form className="asset-form">
                    <div className="form-group">
                        <label htmlFor="name">Asset Name</label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            value={formData.name}
                            placeholder="e.g. 65-inch Smart TV"
                            onChange={handleChange}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="price">Total Price ($)</label>
                        <input
                            type="text"
                            id="price"
                            name="price"
                            value={formData.price}
                            placeholder="e.g. 450.00"
                            onChange={handleChange}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="date">Date Purchased</label>
                        <input
                            type="text"
                            id="date"
                            name="date"
                            value={formData.date}
                            placeholder="e.g. 10/24/2026"
                            onChange={handleChange}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="paidBy">Person(s) Who Paid</label>
                        <input
                            type="text"
                            id="paidBy"
                            name="paidBy"
                            value={formData.paidBy}
                            placeholder="e.g. John, Sarah"
                            onChange={handleChange}
                        />
                    </div>

                    <button type="submit" className="submit-button">
                        Create Asset
                    </button>

                </form>
            </main>
        </div>
    );
};

export default CreateAsset;