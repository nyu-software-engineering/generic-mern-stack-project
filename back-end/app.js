const path = require("path")
require("dotenv").config()

const express = require("express")
const { getHouseholdActivity } = require("./services/activityService")

const app = express()

app.use(express.json())

app.get("/api/households/:householdId/activity", async (req, res, next) => {
  const householdId = Number(req.params.householdId)

  if (!Number.isInteger(householdId)) {
    return res.status(400).json({
      error: "householdId must be a number",
    })
  }

  try {
    const result = await getHouseholdActivity(householdId)

    return res.json(result)
  } catch (error) {
    return next(error)
  }
})

app.use((error, req, res, next) => {
  console.error(error)

  res.status(502).json({
    error: "Could not load activity data",
  })
})

app.use(
  express.static(
    path.join(__dirname, "../front-end/dist"),
  )
)

module.exports = app