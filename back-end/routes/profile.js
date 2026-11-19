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
export default router