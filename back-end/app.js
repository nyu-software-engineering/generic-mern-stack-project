const express = require("express")
const bcrypt = require("bcryptjs")

const app = express()
const services = require("./services.json")
const categories = require("./categories.json")
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
const accounts = new Map()

app.post("/api/auth/register", async (req, res) => {
    const { email, password } = req.body ?? {}

    if (!email || !password || typeof email !== "string" || typeof password !== "string") {
        return res.status(400).json({ error: "Enter an email and password." })
    }

    const normalizedEmail = email.trim().toLowerCase()

    if (!/\.edu$/.test(normalizedEmail)) {
        return res.status(400).json({ error: "Enter a university .edu email address." })
    }

    if (password.length < 8 || bcrypt.truncates(password)) {
        return res.status(400).json({
            error: "Use at least 8 characters and at most 72 bytes for your password."
        })
    }

    const passwordHash = await bcrypt.hash(password, 10)

    if (accounts.has(normalizedEmail)) {
        return res.status(409).json({ error: "An account already exists for this email." })
    }

    accounts.set(normalizedEmail, { passwordHash })
    res.status(201).json({ user: { email: normalizedEmail } })
})

app.get("/api/categories", (req, res) => {
    res.json(categories)
})

module.exports = app
