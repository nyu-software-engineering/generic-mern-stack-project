import React, { useState } from "react";
import "./individual_protocol.css";
import { Link, useNavigate } from "react-router-dom";
import SplitLeaseLogo from "../../assets/splitlease-blank-background-logo.png";

const IndividualProtocol = (props) => {
  const navigate = useNavigate();
  return (
    <>
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

        <h1 className="protocolTitle">
          Protocol for [Example Protocol]{props.householdName}
        </h1>

        <div className="protocolInfo">
          <p>
            Status of Protocol: Under Review <br />
            Proposed by: Derek Kim
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
              To ensure a smooth transition when a roommate moves out, all
              departing residents must follow a standardized move-out process to
              settle outstanding responsibilities, return shared spaces to their
              original condition, and coordinate the transfer of household
              responsibilities.
            </p>

            <h3 className="termsTitle">Terms</h3>
            <ol className="termsList">
              <li>
                <strong>Notice Period:</strong> Roommates must notify the
                household at least 30 days before their intended move-out date.
              </li>
              <li>
                <strong>Cleaning Responsibilities:</strong> The departing
                roommate must clean their bedroom and contribute to cleaning
                common areas before departure.
              </li>
              <li>
                <strong>Outstanding Payments:</strong> All outstanding rent,
                utility bills, and shared expenses must be settled before the
                move-out date.
              </li>
              <li>
                <strong>Keys &amp; Access:</strong> All physical keys, access
                cards, and other household credentials must be returned or
                transferred to the designated remaining roommate.
              </li>
              <li>
                <strong>Personal Belongings:</strong> All personal belongings
                must be removed by the move-out date. Items left behind after 7
                days may be considered abandoned following written notice.
              </li>
              <li>
                <strong>Room Inspection:</strong> Remaining roommates must
                conduct a walkthrough of the departing roommate's space to
                document any damages beyond normal wear and tear.
              </li>
              <li>
                <strong>Final Settlement:</strong> Any remaining shared
                financial obligations must be reconciled and documented in
                SplitLease within 7 days of departure.
              </li>
            </ol>
          </div>
        </section>

        <section className="membersSection">
          <h2 className="sectionTitle">Members and status</h2>
          <div className="membersList">
            <div className="memberRow">
              <div className="memberName">Member 1</div>
              <div className="memberStatus">Agreed</div>
            </div>
            <div className="memberRow">
              <div className="memberName">Member 2</div>
              <div className="memberStatus">
                Disagree with Term #4, changes if all roommates move out at the
                same time
              </div>
            </div>
            <div className="memberRow">
              <div className="memberName currentUser">Member 3 (You)</div>
              <div className="memberStatus">[Declare Status]</div>
            </div>
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
          <button type="button" className="submitButton">
            Submit Response
          </button>
        </section>
      </main>
    </>
  );
};

export default IndividualProtocol;
