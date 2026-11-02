import React, { useState } from "react"

// Invitations inbox (Issue #100, User Stories #67, #68)
// Each invite shows who sent it and which city.
// Accepting or declining removes it from the list.
// Uses mocked data for Sprint 1 (no back-end yet).

const MOCK_INVITES = [
  { id: 1, from: "siyona", city: "New York City" },
  { id: 2, from: "aashma", city: "Paris" },
  { id: 3, from: "inoo", city: "Prague" },
]

const styles = `
.inv-page {
  max-width: 480px;
  margin: 0 auto;
  padding: 16px;
  font-family: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
}
.inv-title {
  font-size: 24px;
  margin: 0 0 16px;
}
.inv-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.inv-card {
  border: 1px solid #ddd;
  border-radius: 12px;
  padding: 14px;
  background: #fff;
}
.inv-text {
  margin: 0 0 12px;
  font-size: 16px;
}
.inv-actions {
  display: flex;
  gap: 8px;
}
.inv-btn {
  flex: 1;
  padding: 10px;
  border-radius: 8px;
  font-size: 15px;
  cursor: pointer;
  border: 1px solid #ccc;
  background: #fff;
}
.inv-btn.accept {
  background: #1f6feb;
  color: #fff;
  border-color: #1f6feb;
}
.inv-empty {
  text-align: center;
  color: #666;
  padding: 40px 0;
}
.inv-toast {
  margin-top: 12px;
  padding: 10px;
  border-radius: 8px;
  background: #eef6ff;
  font-size: 14px;
}
`

export default function InvitationsInbox() {
  const [invites, setInvites] = useState(MOCK_INVITES)
  const [message, setMessage] = useState("")

  const handleAccept = (invite) => {
    setInvites((prev) => prev.filter((i) => i.id !== invite.id))
    setMessage(`You joined ${invite.city}.`)
  }

  const handleDecline = (invite) => {
    setInvites((prev) => prev.filter((i) => i.id !== invite.id))
    setMessage(`Declined the invite to ${invite.city}.`)
  }

  return (
    <main className="inv-page">
      <style>{styles}</style>
      <h1 className="inv-title">Invitations</h1>

      {invites.length === 0 ? (
        <p className="inv-empty">No invitations right now.</p>
      ) : (
        <ul className="inv-list">
          {invites.map((invite) => (
            <li key={invite.id} className="inv-card">
              <p className="inv-text">
                <strong>@{invite.from}</strong> invited you to join{" "}
                <strong>{invite.city}</strong>
              </p>
              <div className="inv-actions">
                <button
                  type="button"
                  className="inv-btn accept"
                  onClick={() => handleAccept(invite)}
                >
                  Accept
                </button>
                <button
                  type="button"
                  className="inv-btn"
                  onClick={() => handleDecline(invite)}
                >
                  Decline
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {message && <div className="inv-toast">{message}</div>}
    </main>
  )
}
