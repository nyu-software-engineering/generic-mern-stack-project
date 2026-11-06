import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./CreateHousehold.css";
const CreateHousehold = (props) => {
  const navigate = useNavigate();
  return (
    <div className="createHouseholdContainer">
      <h1>Create Household</h1>

      <div className="inputFieldContainer">
        <p className="fieldText">Enter Household Name</p>
        <input
          type="text"
          className="textInput"
          placeholder="enter name here"
        />
      </div>
      <button className="createButton" type="button" onClick={() => navigate('/home')}>
        Create
      </button>
    </div>
  );
};

export default CreateHousehold;
