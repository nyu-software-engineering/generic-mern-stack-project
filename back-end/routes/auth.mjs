import express from "express";

const router = express.Router();

const mockUser = {
  username: "John Smith",
  email: "johnsmith@example.com",
  password: "password",
};
const users = [mockUser];
let currentUser = null;

router.post("/login", (req, res) => {
  const body = req.body || {};
  const email = body.email;
  const password = body.password;

  const foundUser = users.find((user) => user.email === email);
  if (foundUser && foundUser.password === password) {
    // TODO connect to db
    currentUser = foundUser;

    res.json({
      success: true,
      message: "Logged in",
      username: foundUser.username,
      email: foundUser.email,
    });
  } else {
    res.status(401).json({
      success: false,
      message: "Invalid email or password",
    });
  }
});

router.post("/register", (req, res) => {
  // TODO connect registration to db
  const body = req.body || {};
  const username = body.username;
  const email = body.email;
  const password = body.password;

  if (!username || !email || !password) {
    res.status(400).json({
      success: false,
      message: "Username, email and password are required",
    });
  } else {
    users.push({
      username: username,
      email: email,
      password: password,
    });

    res.json({
      success: true,
      message: "Registration received",
      username: username,
      email: email,
    });
  }
});

router.post("/logout", (req, res) => {
  // TODO connect logout to db
  currentUser = null;

  res.json({
    success: true,
    message: "Logged out successfully",
  });
});

router.put("/users/me", (req, res) => {
  // TODO connect account changes to db
  const body = req.body || {};
  const username = body.username;
  const email = body.email;

  if (!currentUser) {
    res.status(401).json({
      success: false,
      message: "Not logged in",
    });
  } else if (!username || !email) {
    res.status(400).json({
      success: false,
      message: "Full name and email are required",
    });
  } else {
    currentUser.username = username;
    currentUser.email = email;

    res.json({
      success: true,
      message: "Changes saved",
      username: currentUser.username,
      email: currentUser.email,
    });
  }
});

export default router;
