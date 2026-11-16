const express = require("express")
const app = express()
const services = require("./services.json")

app.get("/api/services", (req, res) => {
    res.json(services)
})

module.exports = app
