import React, { useState } from "react";
import "./Register.css";

const Register = (props) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  return (
    <div className="registerContainer">
      <h1>Register</h1>

      <div className="inputFieldContainer">
        <p className="fieldText">Enter Name</p>
        <input
          type="text"
          className="textInput"
          placeholder="enter name here"
          value={name}
        />
      </div>

      <div className="inputFieldContainer">
        <p className="fieldText">Enter Email</p>
        <input
          type="email"
          className="textInput"
          placeholder="enter email here"
          value={email}
        />
      </div>

      <div className="inputFieldContainer">
        <p className="fieldText">Enter Password</p>
        <input
          type="password"
          className="textInput"
          placeholder="enter password here"
          value={password}
        />
      </div>

      <div className="inputFieldContainer">
        <p className="fieldText">Confirm Password</p>
        <input
          type="password"
          className="textInput"
          placeholder="confirm password here"
          value={confirmPassword}
        />
      </div>

      <button className="registerButton" type="button">
        Register
      </button>
    </div>
  );
};

export default Register;
