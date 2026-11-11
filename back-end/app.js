const express = require("express")
const app = express()

app.get("/", (req, res) => {
    res.send("CampusMart Server is Running!")
})

module.exports = app