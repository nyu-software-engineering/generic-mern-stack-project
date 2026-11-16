import express from 'express';
import users from "../data/users.js";

const router = express.Router();

router.post("/api/signup", (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ error: "Name, email, and password are required." });
    }

    const existing = users.find(user => user.email.toLowerCase() === email.toLowerCase());
    if (existing) {
        return res.status(409).json({ error: "An account with this email already exists." });
    }

    const newUser = {
        id: `user${users.length + 1}`,
        name,
        email: email.toLowerCase(),
        password,
    };

    users.push(newUser);

    res.status(201).json({
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
    });
});

router.post("/api/login", (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: "Email and password are required." });
    }

    const user = users.find(
        user => user.email.toLowerCase() === email.toLowerCase() && user.password === password
    );

    if (!user) {
        return res.status(401).json({ error: "Invalid email or password." });
    }

    res.json({
        id: user.id,
        name: user.name,
        email: user.email,
    });
});

router.get("/api/users/me", (req, res) => {
    const user = users.find(user => user.id === req.userId);
    if (!user) {
        return res.status(404).json({ error: "User not found." });
    }
    res.json({
        id: user.id,
        name: user.name,
        email: user.email,
    });
});

export default router;