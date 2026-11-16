const express = require("express");
const morgan = require("morgan");
const path = require("path");

const uploadRoutes = require("./routes/uploads");

const app = express();

// Middleware
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files
app.use("/static", express.static(path.join(__dirname, "public")));

// Test route
app.get("/", (req, res) => {
  res.send("Flier backend is running!");
});

// API routes
app.use("/api/uploads", uploadRoutes);

module.exports = app;