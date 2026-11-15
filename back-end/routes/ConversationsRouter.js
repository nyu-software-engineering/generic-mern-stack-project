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

    res.json(userConvos)
})

router.get("/:conversationId/messages", (req, res) => {
    const userConvo = null;
    const convoId = req.params.conversationId

    for (const convo of conversationsMockData){
        if (convo.conversationId == convoId){
            userConvo = convo;
        }
    }

    if (userConvo === null){
        res.status(404).send("Conversation Id not found")
    }

    res.json(userConvo.messages)
})

// router.post("/", (req, res) => {
//     const body = req.body

//     if (!req.body.userOne){
//         req.status(404).send("Missing user one parameter")
//     }

//     if (!req.body.userTwo){
//         req.status(404).send("Missing user two parameter")
//     }

//     const newId = conversationsMockData[conversationsMockData.length - 1].conversationId + 1
//     const newConvo = {
//         conversationId: newId,
//         userOne: body.userOne,
//         userTwo: body.userTwo,
//         messages: []
//     }


// })