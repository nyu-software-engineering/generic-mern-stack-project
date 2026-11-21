const express = require("express")
const bcrypt = require("bcryptjs")

const app = express()
const services = require("./services.json")
const users = require("./users.json")

app.use(express.json())

app.get("/api/services", (req, res) => {
    const serviceWithProviders = services.map(service => {
        const user = users.find(user => user.id === service.userId)

        return {
            ...service,
            provider: user ? user.full_name: service.provider
        }
    })
    res.json(serviceWithProviders)
})

app.get("/api/profile/:id", (req, res) => {
    const id = Number(req.params.id)
    const profile = users.find(p => p.id === id)
    
    if (!profile) {
        return res.status(404).json({ error: "Profile not found"})
    }

    res.json(profile)
})

app.post("/api/services", (req, res) => {
    const newService = req.body

    res.json(newService)
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

module.exports = app