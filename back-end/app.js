const path = require("path");
require("dotenv").config();

const express = require("express");
const { getHouseholdActivity } = require("./services/activityService");
const purchaseAssetRouter = require("./services/purchase_asset");
const authService = require("./services/authService");
const householdService = require("./services/householdService");
const roommateService = require("./services/roommateService");

const app = express();

app.use(express.json());
app.use(purchaseAssetRouter);

app.get("/api/households/:householdId/activity", async (req, res, next) => {
  const householdId = Number(req.params.householdId);

  if (!Number.isInteger(householdId)) {
    return res.status(400).json({
      error: "householdId must be a number",
    });
  }

  try {
    const result = await getHouseholdActivity(householdId);

    return res.json(result);
  } catch (error) {
    return next(error);
  }
});

app.post("/api/login", async (req, res, next) => {
  const { email, password } = req.body || {}

  if (!email || !password) {
    return res.status(400).json({
      error: "Email and password are required",
    })
  }

  try {
    const user = await authService.loginUser(email, password)

    if (!user) {
      return res.status(401).json({
        error: "Incorrect email or password",
      })
    }

    // mock token for now; real sessions come with the database sprint
    return res.json({ user, token: `mock-token-${user.id}` })
  } catch (error) {
    return next(error)
  }
})

app.post("/api/register", async (req, res, next) => {
  try {
    const result = await authService.registerUser(req.body || {})

    if (result.errors) {
      // 409 means the email is already used, 400 means the form has mistakes
      const status = result.emailTaken ? 409 : 400

      return res.status(status).json({ errors: result.errors })
    }

    return res.status(201).json({
      user: result.user,
      token: `mock-token-${result.user.id}`,
    })
  } catch (error) {
    return next(error)
  }
})

app.post("/api/households", (req, res) => {
  const result = householdService.createHousehold(req.body || {})

  if (result.errors) {
    return res.status(400).json({ errors: result.errors })
  }

  return res.status(201).json(result)
})

app.delete("/api/households/:householdId/members/:memberId", async (req, res, next) => {
  try {
    const result = await roommateService.removeRoommate({
      householdId: req.params.householdId,
      memberId: req.params.memberId,
      requesterId: (req.body || {}).requesterId,
    })

    if (result.error) {
      return res.status(result.status).json({ error: result.error })
    }

    return res.json({ removed: result.removed })
  } catch (error) {
    return next(error)
  }
})

app.use((error, req, res, next) => {
  console.error(error);

  res.status(502).json({
    error: "Could not load activity data",
  });
});

app.use(express.static(path.join(__dirname, "../front-end/dist")));

module.exports = app;
