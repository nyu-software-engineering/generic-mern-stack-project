# Password recovery design for #139

Status: approved by the repository owner on November 21, 2026. The owner selected emailed codes instead of links and asked for separate new-password and confirmation fields after code verification. This document supersedes the earlier reset-link design.

## User flow

1. From Login, choose Forgot password and enter the registered NYU email.
2. Receive an 8-digit code through Brevo. The same confirmation appears for unknown addresses.
3. In DormShare, enter the email and code. A valid code opens the password form.
4. Enter New password and Confirm new password. Successful reset links to normal Login. If this browser still has the matching pending signup, it offers email verification first.

Code verification creates a short-lived permission that only allows setting a new password. It does not create a login session. This flow works against a running local app without a public app URL or deployment. Email can be read on another device because it contains a code, not a localhost link. Public app use still requires HTTPS.

## Existing system

Use the shared account backend and merged #167 frontend at master `e068ba5`. Preserve registered user IDs, salted credentials, email verification, async provider methods, and API helper names. Brevo setup already passed sandbox and plain-email delivery checks. Recovery state stays private in process memory, matching current account storage. A server restart loses registered accounts and recovery state.

## Approved limits and credentials

| Setting | Behavior |
| --- | --- |
| Email code | Eight decimal digits from a cryptographically secure generator. Leading zeroes are valid. Never return a code over HTTP or display it as a demo code. |
| Code lifetime | 15 minutes from request admission. Delivery delay does not extend it. |
| Wrong code attempts | At most five wrong submissions against an issued code, across all IPs. The fifth invalidates that code. The account and password remain usable. |
| Code storage | Store a keyed digest of normalized email plus code. Keep the random digest key private to this process. Compare equal-length digests with a timing-safe operation. |
| Reset permission | After correct code verification, consume the code and issue a separate 32-byte random secret. It expires five minutes after verification, works once, and permits only password reset. Store only its digest. |
| Email frequency | At most one admitted request per 60 seconds and five per rolling hour for each normalized email, including unknown addresses. Suppressed requests receive the generic confirmation. |
| Request IP limit | At most 20 syntactically valid recovery requests per rolling hour. A 429 does not depend on account existence. |
| Verification and reset IP limit | At most ten parsed attempts per rolling 15 minutes, including malformed payloads. Invalid JSON retains the existing parser behavior. |
| Limiter capacity | At most 10,000 live entries per map. Clean expired entries before insertion. Return a safe 503 at capacity; never evict active entries to admit new ones. |
| Delivery capacity | At most 20 outstanding jobs, with no unbounded queue or automatic retry loop. |
| Public admission capacity | At most 20 delivery reservations. An admitted email request or password-change notice holds its reservation for 25 seconds regardless of lookup or delivery outcome. The window covers the normal store and provider timeouts. |
| Provider timeout | Ten seconds. |
| Passwords | Keep the existing 8-128 character rule. Both password fields must match. |
| Existing sessions | Revoke all sessions for the reset account after success. Preserve other accounts and their sessions. |
| Client IP | Use the direct socket address. Keep proxy trust disabled until the actual deployment proxy is known. |

These numeric limits are project choices. An unverified account remains unverified after a reset. A rejected or expired code must not lock the account.

## API contract

All three handlers are public POST routes mounted after JSON parsing and before `currentUser`. They work even when a caller supplies a stale bearer header. Other handlers retain their session checks. The existing frontend helper already excludes inherited bearer headers for `/auth/`.

All three handlers require `application/json`. Other media types receive a safe 415 with `Cache-Control: no-store` before any recovery limits apply. Parsed JSON still counts toward the verification and reset attempt limit when fields are missing or invalid.

| Route | Body | Success |
| --- | --- | --- |
| `/api/auth/forgot-password` | `{ email }` | `202 { message: "If an account exists for this email, password reset instructions will be sent." }` |
| `/api/auth/verify-reset-code` | `{ email, code }` | `200 { resetToken, expiresIn: 300 }`. Only a correct code may return this limited permission. |
| `/api/auth/reset-password` | `{ resetToken, password }` | `200 { message: "Password updated. Sign in with your new password." }` |

Normalize and validate email using the existing account rule. Unknown, expired, exhausted, used, and incorrect codes share a safe 400 message. Invalid reset permissions share a safe 400 message. Missing, short, oversized, and mismatched passwords are rejected before a valid reset permission is consumed. Confirm the two password fields in the frontend; the server enforces its password policy.

No API response returns the email code, email payload, registered profile, or delivery status. The restricted reset permission is intentionally returned only after successful code proof. It is not a bearer login token and cannot access `/users/me` or any other protected route.

Known and unknown email requests follow the same validation, limiter, configuration, capacity, and scheduling path. Account lookup and provider work happen privately after the generic response. Recipient-specific delivery failure cannot reveal whether an account exists. Missing configuration, a full limiter map, or a full reservation pool for a new email request returns a safe 503. Rate limits return 429 with Retry-After.

The public capacity check uses fixed reservations. Private work that is still running after its reservation ends continues to count toward the outstanding job limit. If the private pool stays full, newly admitted email work is skipped and the public response stays the same. Code proof and password reset can proceed while delivery is full. A password-change notice reserves a slot whenever the public pool has room. It keeps that slot for 25 seconds even if the private job cap prevents delivery. The service logs the same fixed failure category for skipped and failed notices.

## Ordering and atomic use

An existing active code or reset permission remains usable while a new code email is pending. Only the newest admitted candidate may activate after successful delivery. Activation replaces earlier code and permission state. If the newest delivery fails, keep the previously active credential until its original expiry. Never activate an older unfinished candidate afterward.

Use monotonic revisions or unique attempt identities that cannot be recycled while callbacks remain. For example, if A is pending when B starts, A cannot activate later even when B fails. Successful code verification consumes its code and fences older pending deliveries. Successful password reset invalidates every code, permission, and pending delivery for that account. Out-of-order callbacks cannot restore old access.

Complete shared-data awaits before the final checks. Then recheck expiry, account identity, credential identity, and revision. Consume the code or permission and mutate its state without an intervening await. Concurrent verification has one winner; concurrent password reset has one winner. Use the existing hashing method and a fresh salt. Preserve the existing verification code for an unverified signup.

Send a separate password-change notice without passwords or recovery credentials. Notice failure does not undo a completed reset. Log fixed safe failure categories only. Do not log codes, grants, passwords, provider bodies, or email payloads.

## Components and configuration

`createRecovery` owns code digests, limited reset permissions, revisions, rate limits, and bounded private delivery jobs. It receives the existing credential/session maps and shared store. A private idle hook permits deterministic tests. There is no public outbox or token retrieval endpoint.

The Brevo adapter sends only configured sender details, the registered recipient, and the required message content. Use native Node fetch, not a new SDK. A password-reset message has `{ kind, to, code, expiresAt }`; a password-changed message contains no secret.

Load backend `.env.local` explicitly, then `.env`, without replacing exported process values. Resolve paths relative to the server file. Use `BREVO_API_KEY`, `RECOVERY_FROM`, and `RECOVERY_FROM_NAME`. A public application origin is not needed for code mail. Missing recovery settings leave existing account routes working and disable recovery with a safe error. Never expose keys through Vite or committed files.

## Frontend behavior

Add a Login recovery link and public `/forgot-password` and `/reset-password` routes outside MockData. Reuse the NYU account form styles. The request page links to the code-entry page after the generic confirmation. The reset page asks for NYU email and an 8-digit code first. Use a text field with numeric input mode and `autocomplete="one-time-code"` so leading zeroes and paste work.

Only after successful code verification show New password and Confirm new password, both with `autocomplete="new-password"`. Hold the restricted reset permission in component memory only. Do not put code, permission, or passwords into URLs, localStorage, sessionStorage, analytics, or public logs. A reload loses this short-lived form state and explains how to request another code.

Each step supports idle, pending, validation, safe API error, retry, and success. Disable duplicate submissions, preserve entered values for retryable failures, and focus the first invalid field. Clear the email code after successful verification. Missing or expired credentials offer a fresh request. Guard late page updates and navigation after unmount. A successful reset clears the local session captured when it was submitted, even if the form has since closed. It preserves a newer session. Keep a matching pending signup available for email verification without verifying it automatically. Other accounts follow normal Login after reset.

## Required verification

- Real account identity stays the same. Old password fails and new password signs in through the existing frontend and backend.
- Known and unknown requests share confirmation and do not reveal delivery status.
- Codes preserve leading zeroes, expire at 15 minutes, reject after five wrong attempts across IPs, and work once.
- A verified code grants only a five-minute password-reset permission. That permission cannot be used as a login bearer and is single use.
- Invalid password input does not consume a valid permission. Concurrent code verification and concurrent reset have one winner each.
- Out-of-order delivery, newest failure, code proof while mail is pending, and password reset while mail is pending preserve revision rules.
- Limits cover unknown addresses, exact boundaries, capacity, cleanup, and spoofed forwarded headers.
- Valid codes and reset permissions work at delivery capacity. Notices respect both caps.
- Unsupported media types leave recovery attempt allowances available for JSON requests.
- Other users, sessions, passwords, and unverified state remain unchanged.
- Capture adapter and mocked Brevo tests cover success, failure, timeout, and secrecy without real keys or inboxes.
- Full browser journey covers the three steps, mismatch, rejected codes, retry, old/new login, pending states, keyboard, short phone viewports, and representative widths from 320px through desktop.
- A real code email test needs separate approval for the recipient and send. Deployment is not required for that local test.

## Source

The owner approved the code-based direction and separate password confirmation on November 21, 2026. [OWASP Forgot Password guidance](https://cheatsheetseries.owasp.org/cheatsheets/Forgot_Password_Cheat_Sheet.html#pins) describes code proof followed by a limited reset session, expiring one-use credentials, and normal login after reset. Project numeric values above are our implementation choices.
