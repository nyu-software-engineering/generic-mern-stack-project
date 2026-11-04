import React, { useState } from "react";
import "./individual_protocol.css";
import { Link } from "react-router-dom";
import SplitLeaseLogo from "../../assets/splitlease-blank-background-logo.png";

const IndividualProtocol = (props) => {
  return (
    <header className="protocolHeader">
      <div className="protocolHeaderTop">
        <img
          src={SplitLeaseLogo}
          alt="SplitLease Logo"
          className="protocolLogo"
        />
        <button
          type="button"
          className="backButton"
          onClick={() => navigate(-1)}
        >
          Back
        </button>
      </div>

      <h1 className="protocolTitle">Protocol for {props.householdName}</h1>

      <div className="protocolInfo">
        <p>Status of Protocol: </p>
        <p>Proposed by: </p>
      </div>
    </header>
  );
};

export default IndividualProtocol;
