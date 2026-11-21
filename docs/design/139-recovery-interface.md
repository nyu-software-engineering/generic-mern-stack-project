# Account recovery interface

Approved design: [November 21 recovery design](../superpowers/specs/2026-11-21-account-recovery-design.md).

## Backend

`createApp({ store, recovery })` accepts an optional recovery dependency. `recovery` has `deliver(message)`, `now()`, `publicOrigin`, and `policy`. Existing calls stay valid. The app initializes `app.locals.recovery` with `createRecovery({ auth: app.locals.auth, store: app.locals.mockDataStore, ...recovery })`.

`createRecovery(options)` returns `requestReset({ email, ip })`, `resetPassword({ token, password, ip })`, and `idle()`. Both action methods return the approved safe message object. Expected failures throw an error with numeric `status`, safe `message`, and optional `retryAfter`. `idle()` is private and waits for outstanding delivery jobs. It is not an HTTP endpoint.

`createRecoveryRouter(recovery)` returns an Express router with exactly the two POST recovery handlers. Mount at `/api/auth` after JSON parsing and before `currentUser`. Catch expected service errors and send `{ error: message }`; forward unexpected errors to the existing safe error handler.

`deliver(message)` returns a promise. The message has `kind` equal to `password-reset` or `password-changed`, registered recipient `to`, and reset-only `resetUrl` and `expiresAt`. A delivery failure rejects with a safe error. The recovery service catches it and never sends provider details to the client. Production delivery requires HTTPS. Capture tests may inject an explicit loopback origin.

`createBrevoDelivery({ apiKey, from, fromName, fetchImpl })` returns that delivery function. It sends through Brevo HTTPS with the configured registered sender and ten-second timeout. The injected fetch implementation allows tests without a key or network. `recoveryConfiguration(env)` returns delivery configuration only for valid real settings. `loadEnvironment({ directory, env })` loads synthetic-testable private files without replacing existing environment values.

## Frontend

`requestPasswordReset(email)` returns the generic confirmation from `POST /api/auth/forgot-password`.

`resetPassword(token, password)` returns the success message from `POST /api/auth/reset-password`.

Both call the existing `api()` helper. The merged helper excludes bearer inheritance for `/auth/` routes. `ForgotPassword()` and `ResetPassword()` are public route components without props. Login adds a recovery link. Successful reset calls the existing context `signOut()` and links to Login. Existing AuthProvider signatures are unchanged.

## Invariants

Recovery updates the same salted credential entry and shared user. Tokens never enter public responses or shared data. Only the newest admitted delivery candidate can activate, and successful reset fences every earlier candidate. Concurrent valid reset has one winner. Rate and capacity limits are bounded and apply without revealing account existence. Missing recovery configuration does not disable existing account operations.
