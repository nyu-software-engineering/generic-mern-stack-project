/**
 * Creates the Express application.
 * server.js starts listening; tests may require this file.
 */

const path = require("path");
const express = require("express");
const cors = require("cors");

const { stripPasswordsMiddleware } = require("./utils/stripPasswords");
const configRoutes = require("./routes/configRoutes");
const usersRoutes = require("./routes/usersRoutes");
const savedPlacesRoutes = require("./routes/savedPlacesRoutes");
const createFlowRoutes = require("./routes/createFlowRoutes");
const cityListRoutes = require("./routes/cityListRoutes");

const app = express();

// --- Middleware ---
app.use(cors());
app.use(express.json());
app.use(stripPasswordsMiddleware);

// --- Static routes ---
const publicFolder = path.join(__dirname, "public");
app.use(express.static(publicFolder));

// --- Dynamic JSON routes ---
app.get("/", (req, res) => {
  res.json({
    message: "Back-end is running.",
    tryConfig: "/api/config",
    staticExample: "/hello.txt",
  });
});

app.use("/api", configRoutes);
app.use("/api", usersRoutes);
app.use("/api", savedPlacesRoutes);
app.use("/api", createFlowRoutes);
app.use("/api", cityListRoutes);

// --- 404 for anything else ---
app.use((req, res) => {
  res.status(404).json({ error: "Not found", path: req.path });
});

module.exports = app;
