
import { useState } from "react";
import "./LeaseMessaging.css";

export default function LeaseMessaging({sublessor, subletName, onBack}) {
    const [message, setMessage] = useState("");
    const [messages, setMessages] = useState([]);
    const [fileName, setFileName] = useState("");
    const [signerName, setSignerName] = useState("");
    const [signed, setSigned] = useState(false);

    function handleSend(e) {
        e.preventDefault();

        if (message.trim() === "") {
            return;
        }

        setMessages((currentMessages) => [...currentMessages, message.trim()]);
        setMessage("");
    }

    function handleFileChange(e) {
        const file = e.target.files[0];

        if (file) {
            setFileName(file.name);
        } else {
            setFileName("");
        }

        setSigned(false);
    }

    function handleSign() {
        if (fileName !== "" && signerName.trim() !== "") {
            setSigned(true);
        }
    }

    return (
        <div className="lease-messaging">
        <button type="button" onClick={onBack}>Back to leases</button>
        <h2>{sublessor}</h2>
        <h3>{subletName}</h3>
        <p>Discuss lease details with the other user.</p>

        <div className="message-box">
            {messages.length === 0 && <p>No messages yet.</p>}

            {messages.map((msg, index) => (
            <p key={index} className="message">
                {msg}
            </p>
            ))}
        </div>

        <form onSubmit={handleSend} className="message-form">
            <input
                type="text"
                placeholder="Type a message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
            />
            <button type="submit">Send</button>
        </form>

        <h3>Lease Documents</h3>
        <p>Select a PDF document to review.</p>

        <input
            type="file"
            accept=".pdf,application/pdf"
            onChange={handleFileChange}
        />

        {fileName && <p>Selected file: {fileName}</p>}

        <div className="sign-section">
            <h3>Document Signing (Demo)</h3>

            <label htmlFor="signer-name">Full Name</label>
            <input
                id="signer-name"
                type="text"
                placeholder="Enter your full name"
                value={signerName}
                onChange={(e) => {
                    setSignerName(e.target.value);
                    setSigned(false);
                }}
            />

            <button
                type="button"
                onClick={handleSign}
                disabled={!fileName || !signerName.trim()}
            >
                Sign Document (Demo)
            </button>

            {signed && (
                <p className="sign-success">
                    Demo acknowledgment recorded for {signerName}.
                </p>
            )}
        </div>

        <p className="demo-note">
            This is a front-end demonstration. Messages and documents
            are not sent or securely stored. Signing does not create
            a legally valid electronic signature.
        </p>
        </div>
    );
}

