import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import SplitLeaseLogo from "../../assets/splitlease-blank-background-logo.png";
import axios from "axios";
import "./CreateAsset.css";

const API_URL = "http://localhost:3000";

const CreateAsset = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    date: "",
    paidBy: "",
  });
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState("");
  const [members, setMembers] = useState([]);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    axios
      .get(`${API_URL}/api/members`)
      .then((response) => setMembers(response.data))
      .catch((err) => console.error("Error getting members:", err));
  }, []);

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleImageChange = (event) => {
    const file = event.target.files[0] || null;
    setImage(file);
    setPreview(file ? URL.createObjectURL(file) : "");
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setErrors({});

    const data = new FormData();
    data.append("name", formData.name);
    data.append("price", formData.price);
    data.append("date", formData.date);
    data.append("paidBy", formData.paidBy);
    if (image) data.append("image", image);

    axios
      .post(`${API_URL}/api/assets`, data)
      .then(() => {
        navigate("/assets");
      })
      .catch((err) => {
        if (err.response && err.response.data.errors) {
          setErrors(err.response.data.errors);
        } else {
          console.error("Error creating asset:", err);
          setErrors({
            form: "Could not reach the server. Is the back-end running on port 3000?",
          });
        }
      });
  };

  return (
    <div className="create-page-container">
      <div className="asset-header">
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
        <button className="backButton" onClick={() => navigate("/household")}>
          Back
        </button>
      </div>

      <main className="form-main-container">
        <form className="asset-form" onSubmit={handleSubmit}>
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
            {errors.name && <p className="errorText">{errors.name}</p>}
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
            {errors.price && <p className="errorText">{errors.price}</p>}
          </div>

          <div className="form-group">
            <label htmlFor="date">Date Purchased</label>
            <input
              type="text"
              id="date"
              name="date"
              value={formData.date}
              placeholder="MM/DD/YYYY, e.g. 10/24/2026"
              onChange={handleChange}
            />
            {errors.date && <p className="errorText">{errors.date}</p>}
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
            {members.length > 0 && (
              <p className="formHint">
                Members:{" "}
                {members
                  .map((m) => `${m.first_name} ${m.last_name}`)
                  .join(", ")}
              </p>
            )}
            {errors.paidBy && <p className="errorText">{errors.paidBy}</p>}
          </div>

          <div className="form-group">
            <label htmlFor="image">Picture (optional)</label>
            <input
              type="file"
              id="image"
              name="image"
              accept="image/*"
              onChange={handleImageChange}
            />
            {preview && (
              <img
                src={preview}
                alt="Selected asset"
                className="image-preview"
              />
            )}
            {errors.image && <p className="errorText">{errors.image}</p>}
          </div>

          {errors.form && <p className="errorText">{errors.form}</p>}

          <button type="submit" className="submit-button">
            Create Asset
          </button>
        </form>
      </main>
    </div>
  );
};

export default CreateAsset;
