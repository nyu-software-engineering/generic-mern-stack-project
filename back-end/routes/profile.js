import express from "express"
import profile from "../data/profile.js"
import multer from "multer"
import path from "node:path"

const router = express.Router()

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads")
    },
    filename: (req, file, cb) => {
        cb(
            null, `profile-${Date.now()}${path.extname(file.originalname)}`
        )
    },
})

const upload = multer({
    storage: storage,
    limits: { fileSize: 2 * 1024 * 1024},
    fileFilter: (req, file, cb) => {
        const allowedTypes = ["image/jpeg", "image/png", "image/webp"]
        cb(null, allowedTypes.includes(file.mimetype))
    },
})
router.get("/profile", (req, res) => {
    res.json(profile)
})

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

router.post("/profile/hobbies", (req, res) => {
    const{ hobby } = req.body || {}
    if(typeof hobby !== "string" || !hobby.trim()){
        return res.status(400).json({
            error: "Hobby name is required",
        })
    }
    const hobbyName = hobby.trim()
    if(profile.hobbies.includes(hobbyName)){
        return res.status(409).json({
            error: "Hobby already exists",
        })
    }

    profile.hobbies.push(hobbyName)
    res.status(201).json(profile)
})

router.delete("/profile/hobbies/:hobby", (req, res) => {
    const index = profile.hobbies.indexOf(req.params.hobby)
    if(index === -1){
        return res.status(404).json({
            error: "Hobby not found",
        })
    }
    profile.hobbies.splice(index, 1)
    res.json(profile)
})

router.post("/profile/picture", (req, res) => {
    upload.single("picture")(req, res, err => {
        if(err){
            return res.status(400).json({
                error: "Invalid image upload",
            })
        }
        if(!req.file){
            return res.status(400).json({
                error: "Profile picture is required",
            })
        }
        profile.picture.large = `/uploads/${req.file.filename}`
        res.json(profile)
    })
})
export default router