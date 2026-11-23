import './PrivateChat.css'
import { useState, useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'

const PrivateChat = ({ conversations, setConversations, sendMessage }) => {
    const { id } = useParams()
    const [text, setText] = useState('')

    const convo = conversations.find(c => String(c.id) === id)

    useEffect(() => {
        window.scrollTo({
            top: document.documentElement.scrollHeight, 
            behavior: 'instant'
        })
    }, [conversations])

    useEffect(() => {
        if (!convo || convo.read) return

        setConversations(prev => prev.map(c =>
            String(c.id) === id ? { ...c, read: true } : c
        ))
    }, [id, convo?.read, setConversations])

    const handleSubmit = e => {
        e.preventDefault()

        if (!text.trim() || !convo) return

        sendMessage(convo.id, text.trim())
        setText('')
    }

    if (!convo) {
        return (
            <div className="privateChat">
                <Link to="/messages">Back to Messages</Link>
                <h2>Conversation not found</h2>
            </div>
        )
    }

    return (
        <div className="privateChat">
            <Link to="/messages">Back to Messages</Link>

            <div className="chatUser">
                <img className="chatAvatar" src={convo.pfp} alt="" />
                <h2>{convo.username}</h2>
            </div>

            <div className="chatItem">
                <h3>{convo.item}</h3>
                <p>
                {convo.location ?? 'Location not provided'}
                {convo.includeBounty && ` · Bounty: $${convo.bounty}`}
            </p>
            </div>

            <div className="chatMessages">
                {convo.messages.map(m => (
                    <div className={`chatMessage ${m.sender}`} key={m.id}>
                        <div className="chatBubble">{m.text}</div>
                        <span>
                            {m.sender === 'you' ? 'You' : convo.username} · {m.time}
                        </span>
                    </div>
                ))}
            </div>

            <form className="chatForm" onSubmit={handleSubmit}>
                <label htmlFor="messageInput">Message</label>
                <div className="chatInput">
                    <input
                        id="messageInput"
                        type="text"
                        placeholder="Type a message..."
                        value={text}
                        onChange={e => setText(e.target.value)}
                    />
                    <button type="submit" disabled={!text.trim()}>
                        Send
                    </button>
                </div>
            </form>
        </div>
    )
}

export default PrivateChat
