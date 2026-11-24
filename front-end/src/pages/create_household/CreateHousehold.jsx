import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createHousehold } from "./householdApi";
import { getCurrentUser } from "../login/authApi";
import "./CreateHousehold.css";

const CreateHousehold = () => {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [created, setCreated] = useState(null);
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("Household name is required");
      return;
    }

    setLoading(true);
    try {
      const currentUser = getCurrentUser();
      const result = await createHousehold(name, currentUser ? currentUser.id : null);

      if (result.errors) {
        setError(result.errors.name || "Please check the household name");
      } else {
        setCreated(result);
      }
    } catch (err) {
      setError("Could not reach the server. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(created.household.invite_code);
      setCopied(true);
    } catch (err) {
      setCopied(false);
    }
  };

  // after the household is made, show the invite code so roommates can join
  if (created) {
    return (
      <div className="createHouseholdContainer">
        <h1>Household Created</h1>
        <p className="fieldText">{created.household.household_name} is ready.</p>
        <p className="fieldText">Share this code with your roommates so they can join:</p>
        <div className="inviteCodeBox">{created.household.invite_code}</div>
        <button className="createButton" type="button" onClick={handleCopy}>
          {copied ? "Copied!" : "Copy Code"}
        </button>
        <button className="createButton" type="button" onClick={() => navigate("/home")}>
          Continue
        </button>
      </div>
    );
  }

  return (
    <form className="createHouseholdContainer" onSubmit={handleSubmit} noValidate>
      <h1>Create Household</h1>

      <div className="inputFieldContainer">
        <p className="fieldText">Enter Household Name</p>
        <input
          type="text"
          className="textInput"
          placeholder="enter name here"
          value={name}
          onChange={(event) => setName(event.target.value)}
          maxLength={50}
        />
        {error && <p className="createHouseholdError">{error}</p>}
      </div>
      <button className="createButton" type="submit" disabled={loading}>
        {loading ? "Creating..." : "Create"}
      </button>
    </form>
  );
};

export default CreateHousehold;
