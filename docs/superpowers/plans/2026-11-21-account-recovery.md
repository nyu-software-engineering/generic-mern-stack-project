# Account recovery implementation plan

**Goal:** Deliver #139 on the existing account system with a tested Brevo adapter and accessible forms.

**Architecture:** Keep recovery metadata private to a service injected into Express. Use public routes before session middleware. The frontend uses the merged async account provider and existing API helper.

**Tech stack:** Node, Express, React, Mocha/Chai, Node test runner, existing Vite app. No new dependencies.

## Constraints

Follow the approved [design](../specs/2026-11-21-account-recovery-design.md). Preserve the 8-128 password policy and existing helper names. Do not read or commit private environment values. Do not send additional real mail. Use small focused commits after tests pass. Keep `.superpowers/` untracked.

## Task 1: Recovery service and routes

Files: `back-end/services/recovery.js`, `back-end/routes/passwordRecovery.js`, `back-end/app.js`, `back-end/test/recovery.test.js`.

Contract:

```js
createRecovery({ auth, store, deliver, now, publicOrigin, policy })
// returns { requestReset({email, ip}), resetPassword({token, password, ip}), idle() }
createRecoveryRouter(recovery)
createApp({ store, recovery })
```

`requestReset` resolves to the generic message and schedules bounded private work. `resetPassword` changes the existing credential and revokes only that account's sessions. `idle` waits for outstanding delivery work and is never exposed over HTTP. Errors use safe `status` and message fields.

- [ ] Write a real Express capture-adapter test that requests a link, extracts it privately, resets the account, rejects the old password, and accepts the new one.
- [ ] Run `cd back-end && npx mocha test/recovery.test.js`. Verify a missing-route failure before implementation.
- [ ] Implement the approved expiry, limits, ordering, atomic token claim, safe failures, and exact public route mounting. Add tests before each additional behavior.
- [ ] Test both provider completion orders, newest failure, reset while delivery is pending, concurrent reset, old session invalidation, unknown accounts, stale bearer, capacity, cleanup, password validation, and token secrecy.
- [ ] Run the focused tests and existing account tests. Commit `Add account password recovery routes`.

## Task 2: Brevo delivery and explicit configuration

Files: `back-end/services/recoveryDelivery.js`, `back-end/config.js`, `back-end/server.js`, `back-end/.env.example`, `back-end/test/recoveryDelivery.test.js`, `back-end/test/config.test.js`.

Contract:

```js
createBrevoDelivery({ apiKey, from, fromName, fetchImpl })
// returns async deliver({ kind, to, resetUrl, expiresAt })
loadEnvironment({ directory, env })
recoveryConfiguration(env)
// returns { deliver, publicOrigin } only when the real delivery settings are valid
```

- [ ] Write tests for HTTPS payloads, provider errors, timeout, no raw error leakage, and rejected origins.
- [ ] Verify focused tests fail because the delivery module is absent.
- [ ] Implement native fetch delivery with a ten-second timeout and no retry loop. Keep all private settings on the server.
- [ ] Test environment precedence with temporary synthetic files: process environment, `.env.local`, then `.env`. Never read the real files in tests.
- [ ] Load configuration before constructing the server app. Missing recovery setup must keep existing account routes working and return safe recovery failures.
- [ ] Run delivery and configuration tests. Commit `Configure private Brevo recovery delivery`.

## Task 3: Frontend request and reset forms

Files: `front-end/src/services/accountRecovery.js`, `front-end/src/pages/auth/ForgotPassword.jsx`, `front-end/src/pages/auth/ResetPassword.jsx`, `front-end/src/pages/auth/Login.jsx`, `front-end/src/App.jsx`, frontend service and browser tests.

Contract:

```js
requestPasswordReset(email) // POST /auth/forgot-password
resetPassword(token, password) // POST /auth/reset-password
```

- [ ] Write failing service tests that assert request paths, bodies, generic confirmation, and API errors.
- [ ] Implement the public routes outside MockData. Reuse existing account styles, field error associations, and focus handling.
- [ ] Capture and remove a reset fragment without browser persistence. Keep it in component memory. Explain missing and expired links and provide a fresh-link action.
- [ ] Add pending and retry states, repeated-password validation, native new-password completion, and session clearing on success. Guard stale async navigation after unmount.
- [ ] Run frontend tests, lint, and build. Commit service and page work separately.

## Task 4: Verification and independent reviews

- [ ] Run all backend tests and coverage plus all frontend tests, lint, and build.
- [ ] Run a full browser signup, verify, request, privately capture, reset, old-password rejection, new-password login journey with synthetic data. Include network failure, rejected links, mobile widths, and keyboard checks.
- [ ] Obtain independent correctness and security reviews against the approved design and interface. Fix findings and repeat affected checks.
- [ ] Record results and limits. Keep live HTTPS testing explicitly pending. Update #166 and #139 accurately, request relevant reviews, and do not merge.
