
import './Messages.css'
import { useState } from 'react'
import { Link } from 'react-router-dom'

const Messages = ({ conversations }) => {
    const [search, setSearch] = useState('')
    
    const filtered = conversations.filter(c =>
        c.username.toLowerCase().includes(search.toLowerCase()) ||
        c.item.toLowerCase().includes(search.toLowerCase())
    )

    return (
        <div className="messages">
            <h1>Messages</h1>

            <div className="messageSearch">
                <label htmlFor="search">Search conversations</label>
                <input
                    id="search"
                    type="text"
                    placeholder="Search students or items"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                />
            </div>

            <div className="messageList">
                {filtered.map((c) => (
                    <Link
                        className="messageItem"
                        key={c.id}
                        to={`/messages/${c.id}`}
                        style={{ textDecoration: 'none', color: 'inherit' }}
                    >
                        <img
                            className="messageImage"
                            src={c.pfp}
                            alt=""
                        />

                        <div className="messageContent">
                            <h3>{c.username}</h3>
                            <strong>{c.item}</strong>
                            <p>{c.messages?.at(-1)?.text ?? c.preview ?? ''}</p>
                        </div>

                        <div className="messageStatus">
                            <span>{c.messages?.at(-1)?.time ?? c.time ?? ''}</span>
                            {!c.read && <span className="messageDot"></span>}
                        </div>
                    </Link>
                ))}
            </div>

            <Link className="backHome" to="/">
                Back to Home
            </Link>
        </div>
    )
}

export default Messages
