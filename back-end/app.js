const express = require("express")
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

app.post("/api/services", (req, res) => {
    const newService = req.body

    res.json(newService)
})

module.exports = app