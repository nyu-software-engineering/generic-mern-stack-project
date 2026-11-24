const express = require("express")
const bcrypt = require("bcryptjs")
const multer = require("multer")

const app = express()
const services = require("./services.json")
const categories = require("./categories.json")
const users = require("./users.json")
const { SORT_OPTIONS, sortServices } = require("./serviceSort")

const path = require("path")

const storage = multer.diskStorage({
    destination: "uploads",
    filename: function (req,file,cb) {
        cb(null, `${Date.now()}${path.extname(file.originalname)}`)
    }
})

const upload = multer({storage: storage})

app.use(express.json())
app.use("/api/uploads", express.static("uploads"))

app.get("/api/services", (req, res) => {
    const { sort } = req.query

    if (sort !== undefined && !SORT_OPTIONS.includes(sort)) {
        return res.status(400).json({ error: `Sort must be one of: ${SORT_OPTIONS.join(", ")}` })
    }

    // res.send("CampusMart Server is Running!")
    const serviceWithProviders = services.map(service => {
        const user = users.find(user => user.id === service.userId)

        return {
            ...service,
            provider: user ? user.full_name: service.provider
        }
    })
    res.json(sort ? sortServices(serviceWithProviders, sort) : serviceWithProviders)
})

app.get("/api/profile/:id", (req, res) => {
    const id = Number(req.params.id)
    const profile = users.find(p => p.id === id)
    
    if (!profile) {
        return res.status(404).json({ error: "Profile not found"})
    }

    res.json(profile)
})

app.put("/api/profile/:id", (req, res) => {
    const body = req.body ?? {}
    const id = Number(req.params.id)
    const profile = users.find(p => p.id === id)

    if (!profile) {
        return res.status(404).json({ error: "Profile not found"})
    }

    if (!Object.hasOwn(body, "full_name") || typeof body.full_name  !== "string"
        || body.full_name.trim() === "" || !Object.hasOwn(body, "email")
        || typeof body.email !== "string" || !body.email.includes("@")) {
        return res.status(400).json({ error: "Profile has missing/invalid fields"})       
    }

    profile.full_name = body.full_name
    if (body.bio !== undefined) profile["bio"] = body["bio"]
    if (body.university !== undefined) profile["university"] = body["university"]
    if (body.email !== undefined) profile["email"] = body["email"]
    if (body.profile_picture !== undefined) profile["profile_picture"] = body["profile_picture"]

    res.json(profile)
})

app.post("/api/services", upload.array("photos", 1), (req, res) => {
    const newService = req.body
    
    if(req.is("multipart/form-data")) {
        newService.userId = Number(newService.userId)

        if (typeof newService.price === "string" && newService.price.trim() !== ""){
            newService.price = Number(newService.price)
        }
    }

    if (!newService.title){
        return res.status(400).json({error: "Title is required"})
    }

    if (!categories.includes(newService.category)){
        return res.status(400).json({error: "Category does not exist"})
    }

    const user = users.find(user => user.id === newService.userId)

    if(!user) {
        return res.status(400).json({error: "User does not exist"})
    }

    if (typeof newService.price !== "number" || newService.price < 0) {
        return res.status(400).json({error: "Price should be a nonnegative number"})
    }
    
    let nextId = 1
    for (const service of services) {
        if (service.id >= nextId) {
            nextId = service.id + 1
        }
    }
    newService.id = nextId
    newService.createdAt = new Date().toISOString().slice(0, 10)
    newService.numReviews = 0
    newService.rating = null
    newService.status = "Active"
    newService.recent = true
    newService.availability = {
        days: [],
        startTime: "",
        endTime: ""
    }
    if (req.files && req.files.length > 0) {
        newService.workSample = "/api/uploads/" + req.files[0].filename
    }
    services.push(newService)
    res.json({...newService, provider: user.full_name})
    // console.log(req.files)
})

//Registration routes
//Account store for now
const accounts = new Map()

app.post("/api/auth/register", async (req, res) => {
    const { email, password } = req.body ?? {}

    if (!email || !password || typeof email != "string" || typeof password != "string") {
        return res.status(400).json({ error: "Enter an email and password." })
    }

    const normalizedEmail = email.trim().toLowerCase()

    if (!/\.edu$/.test(normalizedEmail)) {
        return res.status(400).json({ error: "Enter a .edu email address." })
    }

    if (password.length < 8 || bcrypt.truncates(password)) {
        return res.status(400).json({
            error: "Use at least 8 characters and at most 72 bytes for your password."
        })
    }

    const passwordHash = await bcrypt.hash(password, 10)

    if (accounts.has(normalizedEmail)) {
        return res.status(400).json({ error: "An account already exists for this email." })
    }

    accounts.set(normalizedEmail, passwordHash)
    res.status(201).json({ user: { email: normalizedEmail } })
})

//Login routes
app.post("/api/auth/login", async (req, res) => {
    const { email, password } = req.body ?? {}

    if (!email || !password || typeof email !== "string" || typeof password !== "string") {
        res.status(400)
        res.json({ error: "Enter an email and password." })
        return
    }

    const normalizedEmail = email.trim().toLowerCase()
    const passwordHash = accounts.get(normalizedEmail)

    if (!accounts.has(normalizedEmail)){
        res.status(401)
        res.json({ error: "Invalid email or password"})
        return
    }
    if (bcrypt.truncates(password) ||
        !(await bcrypt.compare(password, passwordHash))) {
        res.status(401)
        res.json({ error: "Invalid email or password" })
        return
    }

    res.status(200).json({ user: { email: normalizedEmail } })
})

//Logout routes
app.post("/api/auth/logout", (req, res) => {
    res.status(200)
    res.json({success: true})
    return
})

app.get("/api/categories", (req, res) => {
    res.json(categories)
})

app.use("/api/bookings", require("./bookingRoutes"))

module.exports = app
