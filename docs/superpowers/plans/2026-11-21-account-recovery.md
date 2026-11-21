# Account recovery implementation plan

**Goal:** Deliver #139 on the existing account system with a tested Brevo adapter and accessible forms.

**Architecture:** Keep recovery metadata private to a service injected into Express. Use three public routes before session middleware. Email an eight-digit code, exchange it for a restricted reset permission, then accept a new password. The frontend uses the merged async account provider and existing API helper.

**Tech stack:** Node, Express, React, Mocha/Chai, Node test runner, existing Vite app. No new dependencies.

## Constraints

Follow the approved [design](../specs/2026-11-21-account-recovery-design.md). Preserve the 8-128 password policy and existing helper names. Do not read or commit private environment values. Do not send additional real mail. Use small focused commits after tests pass. Keep `.superpowers/` untracked.

## Task 1: Recovery service and routes

Files: `back-end/services/recovery.js`, `back-end/routes/passwordRecovery.js`, `back-end/app.js`, `back-end/test/recovery.test.js`.

Contract:

```js
createRecovery({ auth, store, deliver, now, policy })
// returns { requestReset({email, ip}), verifyCode({email, code, ip}), resetPassword({resetToken, password, ip}), idle() }
createRecoveryRouter(recovery)
createApp({ store, recovery })
```

`requestReset` resolves to the generic message and schedules bounded private work. `resetPassword` changes the existing credential and revokes only that account's sessions. `idle` waits for outstanding delivery work and is never exposed over HTTP. Errors use safe `status` and message fields.

- [ ] Write a real Express capture-adapter test that requests a code, captures it privately, verifies it, resets the account, rejects the old password, and accepts the new one.
- [ ] Run `cd back-end && npx mocha test/recovery.test.js`. Verify a missing-route failure before implementation.
- [ ] Implement the approved expiry, limits, ordering, atomic code and permission claim, safe failures, and exact public route mounting. Add tests before each additional behavior.
- [ ] Test both provider completion orders, newest failure, reset while delivery is pending, concurrent reset, old session invalidation, unknown accounts, five wrong code attempts across IPs, five-minute permission expiry, stale bearer, capacity, cleanup, password validation, and token secrecy.
- [ ] Run the focused tests and existing account tests. Commit `Add account password recovery routes`.

## Task 2: Brevo delivery and explicit configuration

Files: `back-end/services/recoveryDelivery.js`, `back-end/config.js`, `back-end/server.js`, `back-end/.env.example`, `back-end/test/recoveryDelivery.test.js`, `back-end/test/config.test.js`.

Contract:

```js
createBrevoDelivery({ apiKey, from, fromName, fetchImpl })
// returns async deliver({ kind, to, code, expiresAt })
loadEnvironment({ directory, env })
recoveryConfiguration(env)
// returns { deliver } only when the Brevo sender settings are valid; no public origin is needed
```

- [ ] Write tests for HTTPS payloads, provider errors, timeout, no raw error leakage, and invalid sender configuration.
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
verifyPasswordResetCode(email, code) // POST /auth/verify-reset-code
resetPassword(resetToken, password) // POST /auth/reset-password
```

- [ ] Write failing service tests that assert request paths, bodies, generic confirmation, and API errors.
- [ ] Implement the public routes outside MockData. Reuse existing account styles, field error associations, and focus handling.
- [ ] Show email/code first, exchange correct proof for a permission held only in memory, then show New password and Confirm new password. Explain exhausted codes and expired permissions and provide a fresh-code action.
- [ ] Add pending and retry states, repeated-password validation, native new-password completion, and session clearing on success. Guard stale async navigation after unmount.
- [ ] Run frontend tests, lint, and build. Commit service and page work separately.

## Task 4: Verification and independent reviews

- [ ] Run all backend tests and coverage plus all frontend tests, lint, and build.
- [ ] Run a full browser signup, verify, request, privately capture code, verify, reset, old-password rejection, new-password login journey with synthetic data. Include network failure, rejected codes, mobile widths, and keyboard checks.
- [ ] Obtain independent correctness and security reviews against the approved design and interface. Fix findings and repeat affected checks.
- [ ] Record results and limits. Keep a real code-email test pending separate send approval. Update #166 and #139 accurately, request relevant reviews, and do not merge.
