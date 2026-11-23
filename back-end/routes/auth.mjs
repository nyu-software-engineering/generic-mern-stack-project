import express from "express";

const router = express.Router();

const mockUser = {
  username: "John Smith",
  email: "johnsmith@example.com",
  password: "password",
};

router.post("/login", (req, res) => {
  const body = req.body || {};
  const email = body.email;
  const password = body.password;

  if (email === mockUser.email && password === mockUser.password) {
    // TODO handled by backend
    res.json({
      success: true,
      message: "Logged in",
      username: mockUser.username,
      email: mockUser.email,
    });
  } else {
    res.status(401).json({
      success: false,
      message: "Invalid email or password",
    });
  }
});

router.post("/register", (req, res) => {
  // TODO connect registration
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
    res.json({
      success: true,
      message: "Registration received",
      username: username,
      email: email,
    });
  }
});

router.post("/logout", (req, res) => {
  // TODO connect logout
  res.json({
    success: true,
    message: "Logged out successfully",
  });
});

router.get("/users/me", (req, res) => {
  // TODO connect logged in uer
  res.json({
    success: true,
    username: mockUser.username,
    email: mockUser.email,
  });
});

export default router;
