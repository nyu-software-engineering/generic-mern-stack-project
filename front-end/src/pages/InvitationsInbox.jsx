// Import React and the useState hook.
// useState lets the screen remember things (the list of invites, the message).
import React, { useState } from "react"

// Invitations inbox (Issue #100, User Stories #67, #68)
// Each invite shows who sent it and which city.
// Accepting or declining removes it from the list.
// Uses mocked data for Sprint 1 (no back-end yet).

// Fake invites for now. Later these will come from the database.
// id    = unique number for each invite
// from  = username of the friend who sent it
// city  = the city list they invited you to
const MOCK_INVITES = [
  { id: 1, from: "siyona", city: "New York City" },
  { id: 2, from: "aashma", city: "Paris" },
  { id: 3, from: "inoo", city: "Prague" },
]

// All the CSS for this screen, kept inside this file so it works on its own.
// Class names start with "inv-" so they don't clash with other screens.
const styles = `
/* The whole page: centered, narrow like a phone screen */
.inv-page {
  max-width: 480px;
  margin: 0 auto;
  padding: 16px;
  font-family: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
}
/* The "Invitations" heading */
.inv-title {
  font-size: 24px;
  margin: 0 0 16px;
}
/* The list that holds all the invite cards (no bullet points) */
.inv-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
/* One invite card */
.inv-card {
  border: 1px solid #ddd;
  border-radius: 12px;
  padding: 14px;
  background: #fff;
}
/* The text inside a card: "@siyona invited you to join New York City" */
.inv-text {
  margin: 0 0 12px;
  font-size: 16px;
}
/* The row that holds the Accept and Decline buttons */
.inv-actions {
  display: flex;
  gap: 8px;
}
/* Both buttons share this base look */
.inv-btn {
  flex: 1;
  padding: 10px;
  border-radius: 8px;
  font-size: 15px;
  cursor: pointer;
  border: 1px solid #ccc;
  background: #fff;
}
/* The Accept button is blue so it stands out */
.inv-btn.accept {
  background: #1f6feb;
  color: #fff;
  border-color: #1f6feb;
}
/* The text shown when there are no invites left */
.inv-empty {
  text-align: center;
  color: #666;
  padding: 40px 0;
}
/* The small message shown after you accept or decline */
.inv-toast {
  margin-top: 12px;
  padding: 10px;
  border-radius: 8px;
  background: #eef6ff;
  font-size: 14px;
}
`

// The screen itself. "export default" lets other files import and show it.
export default function InvitationsInbox() {
  // invites = the current list of invites. setInvites = how we change the list.
  // It starts with the fake invites from above.
  const [invites, setInvites] = useState(MOCK_INVITES)

  // message = the small note shown after a button click.
  // It starts empty, so nothing is shown at first.
  const [message, setMessage] = useState("")

  // Runs when you click Accept.
  const handleAccept = (invite) => {
    // Keep every invite EXCEPT the one that was clicked (this removes it).
    setInvites((prev) => prev.filter((i) => i.id !== invite.id))
    // Show a confirmation message.
    setMessage(`You joined ${invite.city}.`)
  }

  // Runs when you click Decline. Same idea, different message.
  const handleDecline = (invite) => {
    setInvites((prev) => prev.filter((i) => i.id !== invite.id))
    setMessage(`Declined the invite to ${invite.city}.`)
  }

  // Everything below is what shows up on the screen.
  return (
    <main className="inv-page">
      {/* Put our CSS on the page */}
      <style>{styles}</style>

      <h1 className="inv-title">Invitations</h1>

      {/* If the list is empty, show a friendly message. Otherwise show the cards. */}
      {invites.length === 0 ? (
        <p className="inv-empty">No invitations right now.</p>
      ) : (
        <ul className="inv-list">
          {/* Make one card for each invite in the list.
              "key" helps React keep track of which card is which. */}
          {invites.map((invite) => (
            <li key={invite.id} className="inv-card">
              {/* Who sent it and which city */}
              <p className="inv-text">
                <strong>@{invite.from}</strong> invited you to join{" "}
                <strong>{invite.city}</strong>
              </p>

              {/* The two buttons */}
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

      {/* Only show the message box if there is a message */}
      {message && <div className="inv-toast">{message}</div>}
    </main>
  )
}
