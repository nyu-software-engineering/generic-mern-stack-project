import express from "express"
import conversationsMockData from "../data/conversationsMockData"

router = express.Router()

router.get("/", (req, res) => {
    const userConvos = []

    for (const convo of conversationsMockData){
        if (convo.userOne == req.userId || convo.userTwo == req.userId){
            userConvos.push(convo)
        }
    }

    return res.json(userConvos)
})

router.get("/:conversationId/messages", (req, res) => {
    const convoId = req.params.conversationId

    for (const convo of conversationsMockData){
        if (convo.conversationId == convoId){
            return res.json(convo)
        }
    }

    return res.status(404).send("Did not find conversation with this ID")
})


router.post("/", (req, res) => {
    const body = req.body

    if (!req.body.userOne){
        return req.status(404).send("Missing user one parameter")
    }

    if (!req.body.userTwo){
        return req.status(404).send("Missing user two parameter")
    }

    const newId = conversationsMockData[conversationsMockData.length - 1].conversationId + 1
    const newConvo = {
        conversationId: newId,
        userOne: body.userOne,
        userTwo: body.userTwo,
        messages: []
    }

    conversationsMockData.push(newConvo)

    res.json(newConvo)
})

router.post("/:conversationId/messages", (req, res) => {
    const convoId = req.params.conversationId

    if (!req.body.sender || !req.body.content){
        return res.status(404).send("Field missing")
    }

    const senderId = req.body.sender
    const content = req.body.content
    

    for (let i = 0; i < conversationsMockData.length; i += 1){
        if (conversationsMockData[i]["conversationId"] == convoId){

            if (senderId != conversationsMockData[i]["userOne"] && conversationsMockData[i]["userTwo"]){
                res.status(404).send("Not allowed to access this conversation")
            }

            const newMessage = {"sender": senderId, "date": new Date(), "content": content, "userOneRead": false, "userTwoRead": false}

            if (senderId == conversationsMockData[i]["userOne"]){
                newMessage["userOneRead"] = true
            }
            else{
                newMessage["userTwoRead"] = true
            }

            conversationsMockData[i]["messages"].push(newMessage)

            return res.json(newMessage)
        }
    }

    
    return  res.status(404).send("Conversation Id not found")
})

router.patch("/:conversationId/read", (req, res) => {
    if (!req.body.reader){
        return res.status(404).send("Reader not found")
    }

    const reader = req.body.reader
    const convoId = req.params.conversationId

    for (let i = 0; i < conversationsMockData.length; i+=1){
        if (convoId == conversationsMockData[i]["conversationId"]){
            if (reader == conversationsMockData[i]["userOne"]){
                for (let j = 0; j < conversationsMockData[i]["messages"].length; j += 1){
                    conversationsMockData[i]["messages"][j]["userOneRead"] = true;
                }
                return res.send("Successfully processed read")
            }

            else if (reader == conversationsMockData[i]["userTwo"]){
                for (let j = 0; j < conversationsMockData[i]["messages"].length; j += 1){
                    conversationsMockData[i]["messages"][j]["userTwoRead"] = true;
                }
                return res.send("Successfully processed read")
            }
            else{
                return res.status(404).send("Reader not found within given conversation id")
            }
        }
    }

    return res.status(404).json("Conversation id not found")
})