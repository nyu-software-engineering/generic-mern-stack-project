import React, { useState } from "react";
import "./register.css";
import { useNavigate } from "react-router-dom";
import SplitLeaseLogo from "../../assets/splitlease-blank-background-logo.png";
import { register, saveCurrentUser } from "../login/authApi";

const FIELDS = [
  { name: "name", label: "Enter Name", type: "text", placeholder: "enter name here", autoComplete: "name" },
  { name: "email", label: "Enter Email", type: "email", placeholder: "enter email here", autoComplete: "email" },
  { name: "password", label: "Enter Password", type: "password", placeholder: "enter password here", autoComplete: "new-password" },
  { name: "confirmPassword", label: "Confirm Password", type: "password", placeholder: "confirm password here", autoComplete: "new-password" },
];

const EMPTY_FORM = { name: "", email: "", password: "", confirmPassword: "" };

const Register = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);

  const updateField = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  // sends the form to the back-end; shows its errors, or logs the new user in and goes home
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setServerError("");
    setLoading(true);

    try {
      const result = await register(form);

      if (result.errors) {
        setErrors(result.errors);
        return;
      }

      saveCurrentUser(result.user);
      navigate("/home");
    } catch {
      setServerError("Could not reach the server. Please try again.");
    } finally {
      setLoading(false);
    }
  };

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

      <form onSubmit={handleSubmit} noValidate>
        {serverError && (
          <p className="registerAlert" role="alert">
            {serverError}
          </p>
        )}

        {FIELDS.map((field) => (
          <div className="inputFieldContainer" key={field.name}>
            <p className="fieldText">{field.label}</p>
            <input
              type={field.type}
              className="textInput"
              placeholder={field.placeholder}
              aria-label={field.label}
              autoComplete={field.autoComplete}
              value={form[field.name]}
              onChange={updateField(field.name)}
            />
            {errors[field.name] && (
              <p className="registerFieldError">{errors[field.name]}</p>
            )}
          </div>
        ))}

        <button className="registerButton" type="submit" disabled={loading}>
          {loading ? "Creating account..." : "Register"}
        </button>
      </form>
    </div>
  );
};

export default Register;
