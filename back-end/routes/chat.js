import express from "express"
import chats from "../data/chats.js"

const router = express.Router()
router.get("/chats", (req, res) => {
    res.json(chats)
})

router.get("/chats/:id", (req, res) => {
    const chat = chats.find(item => String(item.id) == req.params.id)
    if(!chat){
        return res.status(404).json({
            error: "Chat not found",
        })
    }
    res.json(chat)
})

router.get("/chats/:id/messages", (req, res) => {
    const chat = chats.find(item => String(item.id) == req.params.id)
    if(!chat){
        return res.status(404).json({
            error: "Chat not found",
        })
    }
    res.json(chat.messages)
})

router.post("/chats/:id/messages", (req, res) => {
    const chat = chats.find(item => String(item.id) === req.params.id)
    if(!chat){
        return res.status(404).json({
            error: "Chat not found",
        })
    }

    const{ text } = req.body || {}
    if(typeof text !== "string" || !text.trim()){
        return res.status(400).json({
            error: "Message text is required",
        })
    }

    const newMessage = {
        id: `sent-${chat.id}-${chat.messages.length + 1}`,
        text: text.trim(),
        sentByMe: true,
    }
    chat.messages.push(newMessage)
    res.status(201).json(newMessage)
})

export default router