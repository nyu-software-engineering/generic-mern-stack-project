import React, { useState } from "react";
import "./Register.css";
import { Link, useNavigate } from "react-router-dom";
import SplitLeaseLogo from "../../assets/splitlease-blank-background-logo.png";

const Register = (props) => {
  const navigate = useNavigate();
  return (
    <div className="registerContainer">
      <div className="registerLogoContainer">
        <img
          src={SplitLeaseLogo}
          alt="SplitLease Logo"
          className="registerLogo"
        />
      </div>

      <h1 className="registerTitle">Register</h1>

      <div className="inputFieldContainer">
        <p className="fieldText">Enter Name</p>
        <input
          type="text"
          className="textInput"
          placeholder="enter name here"
        />
      </div>

      <div className="inputFieldContainer">
        <p className="fieldText">Enter Email</p>
        <input
          type="email"
          className="textInput"
          placeholder="enter email here"
        />
      </div>

      <div className="inputFieldContainer">
        <p className="fieldText">Enter Password</p>
        <input
          type="password"
          className="textInput"
          placeholder="enter password here"
        />
      </div>

      <div className="inputFieldContainer">
        <p className="fieldText">Confirm Password</p>
        <input
          type="password"
          className="textInput"
          placeholder="confirm password here"
        />
      </div>

      <button
        className="registerButton"
        type="button"
        onClick={() => navigate("/")}
      >
        Register
      </button>
    </div>
  );
};

export default Register;
