import {useEffect, useState} from "react"
import{Link} from "react-router-dom"
import "./Chat.css"

const Chat = () => {
    const[conversations, setConversations] = useState([])
    const[selectedID, setSelectedID] = useState(null)
    const[search, setSearch] = useState("")
    const[message, setMessage] = useState("")
    const[loading, setLoading] = useState(true)
    const[error, setError] = useState(false)

    useEffect(() =>{
        fetch("https://dummyjson.com/comments?limit=8")
        .then(response => {
            if(!response.ok){
                throw new Error("Unable to load chats")
            }
            return response.json()
        })
        .then(data=>{
            const chats = data.comments.map(comment => ({
                id: comment.id,
                name: comment.user.fullName,
                username: comment.user.username,
                messages: [
                    {
                        id: `received-${comment.id}`,
                        text: comment.body,
                        sentByMe: false,
                    },
                ],
            }))
            setConversations(chats)
        })
        .catch(() => setError(true))
        .finally(() => setLoading(false))}, [])

        const selectedChat = conversations.find(chat => chat.id === selectedID)
        const visibleChat = conversations.filter(chat => chat.name.toLowerCase().includes(search.toLowerCase()))
        const openChat = id => {setSelectedID(id), setMessage("")}
        const closeChat = () => {setSelectedID(null), setMessage("")}
        const sendMessage = event => {
            event.preventDefault()
            const text = message.trim()
            if(!text || !selectedChat){
                return
            }
            
        setConversations(previousConversations => 
            previousConversations.map(chat => {
                if(chat.id !== selectedID){
                    return chat
                }
                return{
                    ...chat,
                    messages: [...chat.messages,{id: `sent-${chat.messages.length}`, text: text, sentByMe: true,},],
                }
            })
        )
        setMessage("")

    }

    return(
    <main className="chat-page">
        <header className="chat-header">
            {selectedChat ? (
                <button
                    type="button"
                    className="chat-back"
                    onClick={closeChat}
                >
                    ← Inbox
                </button>
            ):(
                <Link to="/profile" className="chat-back">
                    ← Profile
                </Link>
            )}
            <h1 className="chat-title">
                {selectedChat ? selectedChat.name : "Chat"}
            </h1>
        </header>

        {selectedChat ? (
            <>
            <section
                className="chat-thread"
                aria-label={`Messages with ${selectedChat.name}`}
            >
                <p className="chat-thread-label">
                    @{selectedChat.username}
                </p>
                {selectedChat.messages.map(item=> (
                    <p
                        key={item.id}
                        className={item.sentByMe ? "chat-message chat-message-mine" : "chat-message chat-message-theirs"}
                        >
                        {item.text}
                        </p>
                ))}
                </section>
                <form className="chat-form" onSubmit={sendMessage}>
                    <label className="chat-input-label" htmlFor="chat-draft">
                        Message
                    </label>
                    <input
                        id="chat-draft"
                        className="chat-input"
                        type="text"
                        placeholder="Type a message..."
                        value={message}
                        onChange={event => setMessage(event.target.value)}
                    />
                    <button
                        className="chat-send"
                        type="submit"
                        disabled={!message.trim()}
                    >
                        Send
                    </button>
                </form>
                </>
            ):(
                <section className="chat-inbox">
                    <label className="chat-search-label" htmlFor="chat-search">
                        Search conversations
                    </label>
                    <input
                        id="chat-search"
                        className="chat-search"
                        type="search"
                        placeholder="Search chats..."
                        value={search}
                        onChange={event => setSearch(event.target.value)}
                    />
                    {loading && (
                        <p className="chat-status">Loading conversations...</p>
                    )}
                    {error && (
                        <p className="chat-status">
                            Cannot load chats right now. Please try again by refreshing the page.
                        </p>
                    )}
                    {!loading && !error && visibleChat.length === 0 && (
                        <p className="chat-status">No conversations found.</p>
                    )}
                    {!loading && !error && (
                        <ul className="chat-list">
                            {visibleChat.map(chat=>(
                                <li className="chat-list-item" key={chat.id}>
                                    <button
                                        className="chat-list-button"
                                        type="button"
                                        onClick={() => openChat(chat.id)}
                                    >
                                        <span className="chat-avatar">
                                            {chat.name.charAt(0)}
                                        </span>
                                        <span className="chat-list-copy">
                                            <span className="chat-list-name">
                                                {chat.name}
                                            </span>
                                            <span className="chat-list-preview">
                                                {chat.messages[chat.messages.length-1].text}
                                            </span>
                                        </span>
                                        <span className="chat-arrow">›</span>
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </section>
        )}
        <nav className="chat-navigation" aria-label="Main navigation">
            <Link to="/feed" className="chat-nav-item">Feed</Link>
            <Link to="/discover" className="chat-nav-item">Discover</Link>
            <Link to="/following" className="chat-nav-item">Following</Link>
            <Link to="/map" className="chat-nav-item">Map</Link>
            <Link to="/profile" className="chat-nav-item">Profile</Link>
        </nav>
    </main>
)
}
export default Chat