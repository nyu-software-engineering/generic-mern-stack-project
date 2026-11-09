import React, { useState } from "react";
import "./protocol_proposal.css";
import { Link, useNavigate } from "react-router-dom";
import SplitLeaseLogo from "../../assets/splitlease-blank-background-logo.png";

const ProtocolProposal = (props) => {
  const navigate = useNavigate();
  return (
    <div className="protocolContainer">
      <header className="protocolHeader">
        <div className="protocolHeaderTop">
          <img
            src={SplitLeaseLogo}
            alt="SplitLease Logo"
            className="protocolLogo"
            onClick={() => navigate("/home")}
          />
          <button
            type="button"
            className="backButton"
            onClick={() => navigate("/protocols")}
          >
            Back
          </button>
        </div>
        <h1 className="protocolTitle">Propose a Protocol</h1>
      </header>

      <div className="proposalForm">
        <div className="proposalCard">
          <h2 className="proposalLabel">Proposal Name:</h2>
          <input type="text" className="proposalInput" />
        </div>

        <div className="proposalCard">
          <h2 className="proposalLabel">Proposal Description:</h2>
          <textarea className="proposalInput proposalTextarea"></textarea>
        </div>

        <div className="resourceActions">
          <button type="button" className="resourceButton">
            Upload additional resources
          </button>
          <button type="button" className="resourceButton">
            Link additional resources
          </button>
        </div>

        <div className="proposalCard resourcesCard">
          <p className="resourcesTitle">Resources attached to this proposal</p>
          <div className="resourceRow"></div>
          <div className="resourceRow"></div>
          <div className="resourceRow"></div>
          <div className="resourceRow"></div>
        </div>

        <button type="button" className="proposalSubmit">
          Submit Proposal
        </button>
      </div>
    </div>
  );
};

export default ProtocolProposal;
