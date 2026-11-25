import './PrivateChat.css'
import { useState, useEffect, useRef } from 'react'
import { Link, useParams } from 'react-router-dom'
import { RiImageUploadLine } from "react-icons/ri";
import { IconContext } from "react-icons";

const PrivateChat = ({ conversations, setConversations, sendMessage }) => {
    const { id } = useParams()
    const [text, setText] = useState('')
    const [error, setError] = useState('')
    const [fileName, setFileName] = useState('No File Selected')
    const [pictureFile, setPictureFile] = useState(undefined)
    const fileInputRef = useRef(null)

    const convo = conversations.find(c => String(c.id) === id)

    useEffect(() => {
        window.scrollTo({
            top: document.documentElement.scrollHeight, 
            behavior: 'instant'
        })
    }, [conversations])

    useEffect(() => {
        if (!convo || convo.read) return

        fetch(`/api/conversations/${id}/read`, { method: 'PATCH' })
            .then(res => {
                if (!res.ok) throw new Error('Failed to mark conversation as read')
                setConversations(prev => prev.map(c =>
                    String(c.id) === id ? { ...c, read: true } : c
                ))
            })
            .catch(err => console.error(err))
    }, [id, convo?.read, setConversations])

    const getFileName = (e) => {
        const file = e.target.files[0]
        if (file) {
            setFileName(file.name)
            changeImageFile(e)
        }
    }

    const changeImageFile = (e) => {
        const file = e.target.files[0]
        if (!file || !file.type.startsWith('image/')) return
        setPictureFile(file)
    }

    const removeImage = () => {
        setPictureFile(undefined)
        setFileName('No File Selected')
        if (fileInputRef.current) fileInputRef.current.value = ''
    }

    const handleSubmit = e => {
        e.preventDefault()

        if (!text.trim() || !convo) return

        const formData = new FormData()
        formData.append('id', convo.id)
        formData.append('text', text.trim())
        if(pictureFile){
            formData.append('image', pictureFile)
        }
        else{
            formData.append('image', undefined)
        }
        sendMessage(formData)
            .then(() => {
                setText('')
                setError('')
                removeImage()
            })
            .catch(() => setError('Could not send your message. Try again.'))
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
                            {m.image && <div className="chatBubble"><img src={m.image}/></div>}
                        <span>
                            {m.sender === 'you' ? 'You' : convo.username} · {m.time}
                        </span>
                    </div>
                ))}
            </div>
            {error && <p className="chatError">{error}</p>}

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
                    <IconContext.Provider value={{ className: "uploadImage"}}>
                    <label htmlFor="imageUpload">
                    <RiImageUploadLine/>
                    </label>
                    <input id="imageUpload" ref={fileInputRef} type="file" accept='image/*' hidden onChange={getFileName}></input>
                    <p>{fileName}</p>
                    {pictureFile && (
                        <button type="button" className="removeImage" onClick={removeImage} aria-label="Remove image">
                            ×
                        </button>
                    )}
                    </IconContext.Provider>
                    <button type="submit" disabled={!text.trim()}>
                        Send
                    </button>
                </div>
            </form>
        </div>
    )
}

export default PrivateChat
