import express from "express"
import profile from "../data/profile.js"

const router = express.Router()

//obtain mock profile
router.get("/profile", (req, res) => {
    res.json(profile)
})

//obtain profile by username
router.get("/profiles/:username", (req, res) => {
    if(req.params.username !== profile.login.username){
        return res.status(404).json({
            error: "Profile not found",
        })
    }
    res.json(profile)
})
router.post("/profile/edit", (req,res)=> {
    const{firstName, lastName, username} = req.body || {}
    if(
        typeof firstName !== "string" || typeof lastName !== "string" || typeof username !== "string" ||
        !firstName.trim() || !lastName.trim() || !username.trim()
    ) {  
        return res.status(400).json({
            error: "First name, last name, and username are required",
        })
    } 
    profile.name.first = firstName.trim()
    profile.name.last = lastName.trim()
    profile.login.username = username.trim()
    res.json(profile)
})
router.post("/profile/privacy", (req, res) => {
    const{privacy} = req.body || {}
    if(privacy !== "public" && privacy !== "private"){
        return res.status(400).json({
            error: "Privacy must be public or private",
        })
    }
    profile.privacy = privacy
    res.json(profile)
})
export default router