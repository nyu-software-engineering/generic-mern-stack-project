import React, { useState, useEffect } from "react";
import axios from "axios";
import "./individual_protocol.css";
import { useNavigate } from "react-router-dom";
import SplitLeaseLogo from "../../assets/splitlease-blank-background-logo.png";

const IndividualProtocol = (props) => {
  const navigate = useNavigate();
  const [protocol, setProtocol] = useState({
    protocol_name: "",
    protocol_description: "",
    protocol_status: "",
  });
  const [members, setMembers] = useState([]);

  useEffect(() => {
    axios.get(import.meta.env.VITE_PROTOCOLS_API_URL).then((response) => {
      setProtocol(response.data[0]); // pick the first protocol
    });
  }, []);

  useEffect(() => {
    axios.get(import.meta.env.VITE_MEMBERS_API_URL).then((response) => {
      setMembers(response.data);
    });
  }, []);

  const statuses = protocol.protocol_status.split(" - ");
  const proposer = members[0];
  const proposedBy = proposer
    ? `${proposer.first_name} ${proposer.last_name}`
    : "";
  const protocolStatus = statuses.every((s) => s === "Agreed")
    ? "Approved"
    : "Pending";

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

        <h1 className="protocolTitle">{protocol.protocol_name}</h1>

        <div className="protocolInfo">
          <p>
            Status of Protocol: {protocolStatus} <br />
            Proposed by: {proposedBy}
          </p>
        </div>
      </header>

      <main className="protocolBody">
        <section className="descriptionSection">
          <div className="sectionHeaderRow">
            <h2 className="sectionTitle">Description</h2>
            <button type="button" className="editButton">
              Edit/Request Edit
            </button>
          </div>
          <div className="descriptionBox">
            <p className="overallDescription">
              {protocol.protocol_description}
            </p>
          </div>
        </section>

        <section className="membersSection">
          <h2 className="sectionTitle">Members and status</h2>
          <div className="membersList">
            {members.slice(0, 3).map((member, index) => (
              <div className="memberRow" key={member.id}>
                <div className="memberName">
                  {member.first_name} {member.last_name}
                </div>
                <div className="memberStatus">{statuses[index]}</div>
              </div>
            ))}
          </div>
        </section>

        <section className="responseSection">
          <h2 className="sectionTitle">Your response</h2>
          <p className="responsePrompt">
            Do you agree with this protocol? If not, tell your roommates which
            term you disagree with and why.
          </p>
          <textarea
            className="statusInput"
            placeholder="Agree, or explain your concerns (e.g. Term #4)"
          />
          <button
            type="button"
            className="submitButton"
            onClick={() => navigate("/protocols")}
          >
            Submit Response
          </button>
        </section>
      </main>
    </div>
  );
};

export default IndividualProtocol;
