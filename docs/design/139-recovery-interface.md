# Account recovery interface

Approved [code-based design](../superpowers/specs/2026-11-21-account-recovery-design.md), November 21, 2026. This supersedes the earlier reset-link interface.

## Backend

`createApp({ store, recovery })` accepts optional recovery dependencies: `deliver(message)`, `now()`, and `policy`. Existing callers remain valid. It creates `app.locals.recovery` using the shared auth and data store.

`createRecovery({ auth, store, deliver, now, policy })` returns `requestReset({ email, ip })`, `verifyCode({ email, code, ip })`, `resetPassword({ resetToken, password, ip })`, and private `idle()`.

`requestReset` returns the generic confirmation and schedules private delivery. `verifyCode` returns `{ resetToken, expiresIn: 300 }` only after correct code proof. `resetPassword` returns the success message after changing the existing credential and revoking that account's sessions. Expected errors have numeric `status`, safe `message`, and optional `retryAfter`.

Admitted email requests hold a fixed 25-second reservation. Lookup and provider completion do not release it early. Private jobs have their own cap, so a stalled job can cause a later delivery to be skipped without changing the public result. Code proof and password reset can proceed when delivery is full. A password-change notice holds a reservation when a public slot is available, even if the private job cap prevents delivery. A skipped or failed notice logs a fixed failure category after the password change.

`createRecoveryRouter(recovery)` returns exactly three POST handlers: `/forgot-password`, `/verify-reset-code`, and `/reset-password`. Mount at `/api/auth` after JSON parsing and before currentUser. Safe service errors become `{ error: message }`. Unexpected errors use the existing error handler.

Each handler requires `application/json`. Unsupported media types receive a safe 415 with `Cache-Control: no-store` before any recovery limits apply.

`deliver(message)` resolves when provider submission succeeds. A reset message is `{ kind: 'password-reset', to, code, expiresAt }`, where `code` is an eight-character decimal string and expiry is epoch milliseconds. A notice is `{ kind: 'password-changed', to }`.

`createBrevoDelivery({ apiKey, from, fromName, fetchImpl })` returns the delivery function. Use HTTPS and a ten-second timeout. `recoveryConfiguration(env)` returns delivery configuration when the three Brevo settings are present and valid. It requires no public app origin. `loadEnvironment({ directory, env })` loads .env.local then .env while preserving existing environment values.

## Frontend

`requestPasswordReset(email)` calls `/auth/forgot-password`.

`verifyPasswordResetCode(email, code)` calls `/auth/verify-reset-code` and returns the restricted reset permission.

`resetPassword(resetToken, password)` calls `/auth/reset-password`.

All use the existing api helper. `ForgotPassword()` and `ResetPassword()` are public components without props. ResetPassword shows email and code first, then separate New password and Confirm new password fields. It holds the permission only in component memory.

Before submitting the reset, ResetPassword calls `prepareResetSignOut(email)` with the normalized email used for code proof. When the server confirms success, the returned function clears any local session from a sign-in started before reset submission, even if the form has closed. Sign-in, signup, and verification requests started after reset submission can finish and keep their results. An earlier pending signup survives when the email matches and a demo verification code is present, or when a newer verification request uses it. The success screen offers Continue email verification for a matching pending signup and Sign in otherwise. Verification and sign-in each require a separate user action. Calling `signOut()` clears the session and pending signup and invalidates all pending auth requests.

## Invariants

No code is returned over HTTP. The reset permission is returned only after code verification and never authenticates a normal account request. Recovery does not create users or a second identity store. Code expiry is 15 minutes; five wrong attempts exhaust a code; permission expiry is five minutes. Code proof and reset each work once. Revisions fence older deliveries. Missing configuration does not stop existing account operations. No additional real email is authorized by implementation.
