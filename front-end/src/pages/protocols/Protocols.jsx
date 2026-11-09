import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import SplitLeaseLogo from "../../assets/splitlease-blank-background-logo.png";
import "./Protocols.css";
import axios from "axios";

const normalizeProtocol = (raw) => {
  const statuses = raw.protocol_status.split(" - ");
  const approvals = statuses.filter((s) => s === "Agreed").length;
  return {
    id: raw.protocol_id,
    name: raw.protocol_name,
    memberCount: statuses.length,
    approvals,
    status: approvals === statuses.length ? "approved" : "pending",
  };
};

const Protocols = () => {
  const navigate = useNavigate();
  const [protocols, setProtocols] = useState([]);
  const [members, setMembers] = useState([]);
  const [approvedByMe, setApprovedByMe] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(import.meta.env.VITE_PROTOCOLS_API_URL).then((response) => {
      setProtocols(response.data.map(normalizeProtocol));
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    axios.get(import.meta.env.VITE_MEMBERS_API_URL).then((response) => {
      setMembers(response.data);
    });
  }, []);

  const pending = protocols.filter((p) => p.status === "pending");
  const approved = protocols.filter((p) => p.status === "approved");

  const proposer = members[0];
  const proposedBy = proposer
    ? `${proposer.first_name} ${proposer.last_name}`
    : "";

  // add the current user's approval; once every member approves, the protocol becomes a household protocol
  const handleApprove = (id) => {
    setApprovedByMe([...approvedByMe, id]);
    setProtocols(
      protocols.map((p) => {
        if (p.id !== id) return p;
        const approvals = p.approvals + 1;
        const status = approvals >= p.memberCount ? "approved" : "pending";
        return { ...p, approvals, status };
      }),
    );
  };

  const viewProtocol = () => navigate("/individual-protocol");

  if (loading) {
    return (
      <div className="protocolsContainer">
        <p className="protocolsLoading">Loading protocols...</p>
      </div>
    );
  }

  return (
    <div className="protocolsContainer">
      <header className="protocolsHeader">
        <img
          src={SplitLeaseLogo}
          alt="SplitLease logo"
          className="protocolsLogo"
          onClick={() => navigate("/home")}
        />
        <button
          type="button"
          className="protocolsBack"
          onClick={() => navigate("/household")}
        >
          Back
        </button>
      </header>

      <section className="protocolsBanner">
        <h1 className="protocolsTitle">Protocols</h1>
        <p className="protocolsCount">
          {protocols.length} protocols · {approved.length} approved ·{" "}
          {pending.length} pending
        </p>
        <button
          type="button"
          className="protocolsPrimary"
          onClick={() => navigate("/new_protocol")}
        >
          Propose New Protocol
        </button>
      </section>

      <section className="protocolsCard">
        <h2 className="protocolsSectionTitle">Pending Protocols</h2>
        {pending.length === 0 && (
          <p className="protocolsEmpty">No protocols waiting for approval.</p>
        )}
        <ul className="protocolsList">
          {pending.map((p) => {
            const alreadyApproved = approvedByMe.includes(p.id);
            return (
              <li key={p.id} className="protocolsRow">
                <div className="protocolsInfo">
                  <span className="protocolsName">{p.name}</span>
                  <span className="protocolsMeta">
                    Proposed by {proposedBy} · {p.approvals}/{p.memberCount}{" "}
                    approved
                  </span>
                </div>
                <div className="protocolsActions">
                  <button
                    type="button"
                    className="protocolsSecondary"
                    onClick={() => viewProtocol(p.id)}
                  >
                    View
                  </button>
                  <button
                    type="button"
                    className="protocolsApprove"
                    onClick={() => handleApprove(p.id)}
                    disabled={alreadyApproved}
                  >
                    {alreadyApproved ? "Approved" : "Approve"}
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="protocolsCard">
        <h2 className="protocolsSectionTitle">Household Protocols</h2>
        {approved.length === 0 && (
          <p className="protocolsEmpty">No approved protocols yet.</p>
        )}
        <ul className="protocolsList">
          {approved.map((p) => (
            <li key={p.id} className="protocolsRow">
              <div className="protocolsInfo">
                <span className="protocolsName">{p.name}</span>
                <span className="protocolsMeta">
                  Proposed by {proposedBy} · Approved by everyone
                </span>
              </div>
              <div className="protocolsActions">
                <button
                  type="button"
                  className="protocolsSecondary"
                  onClick={() => viewProtocol(p.id)}
                >
                  View
                </button>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
};

export default Protocols;
