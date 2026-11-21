/**
 * PATCH /api/users/me/password
 *
 * Body: { currentPassword: "password123", newPassword: "newpass123" }
 *
 * There is no user id in the URL or the body. "me" is always the demo
 * current user (u_1) until real login exists.
 */

const express = require("express");
const { changePassword } = require("../logic/users");

const router = express.Router();

router.patch("/users/me/password", (req, res) => {
  const body = req.body || {};
  const { currentPassword, newPassword } = body;

  if (typeof currentPassword !== "string" || !currentPassword) {
    return res.status(400).json({ error: "Enter your current password." });
  }
  if (typeof newPassword !== "string") {
    return res.status(400).json({ error: "Enter a new password." });
  }

  const result = changePassword({ currentPassword, newPassword });

  if (!result.ok && result.reason === "missing_user") {
    return res.status(404).json({ error: "We could not find your account." });
  }
  if (!result.ok && result.reason === "wrong_password") {
    return res.status(401).json({ error: "Your current password is wrong." });
  }
  if (!result.ok) {
    return res.status(400).json({ error: result.error });
  }

  // Never send the password back.
  res.json({ ok: true });
});

module.exports = router;
