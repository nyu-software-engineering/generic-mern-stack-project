const express = require("express")
const app = express()
const services = require("./services.json")
const profiles = require("./profiles.json")

app.get("/api/services", (req, res) => {
    res.json(services)
})

app.get("/api/profile/:id", (req, res) => {
    const id = Number(req.params.id)
    const profile = profiles.find(p => p.id === id)
    
    if (!profile) {
        return res.status(404).json({ error: "Profile not found"})
    }

    res.json(profile)
})

module.exports = app
