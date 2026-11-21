# Password recovery design for #139

Status: approved by the repository owner on November 21, 2026. Implementation is authorized. Live reset-link testing still requires a trusted HTTPS app origin and separate email approval.

## Baseline and decisions

Account integration #167 is merged at master `e068ba5`. Brevo setup has passed a sandbox request and one approved plain email delivery test. Omer reviewed #166 and supports the recovery direction. He requested concrete policy values, delivery ordering, explicit private configuration loading, and a trusted HTTPS app origin.

Use the existing account credentials and bearer sessions. Add public request and reset pages using the shared account styles. Deliver reset mail through Brevo's HTTPS API. Use an injected private capture adapter for repeatable local tests. Registered accounts and recovery state remain in process memory, matching the existing account backend. Restart loses them.

The public HTTPS app origin is not established. Local implementation and private tests can proceed. Live reset-link testing waits for that origin. Provider setup does not by itself complete recovery.

## Options and recommendation

1. Extend the existing account system now. Reuse its credential map, hashing, async account provider, and session handling. This is the recommended path and fits #139.
2. Wait for a deployed HTTPS origin before any work. This delays local implementation without improving the test contract.
3. Replace account handling with a hosted identity service. This changes the team contract and duplicates completed #92 and #94 work. It is outside this issue.

## Proposed policy

These numeric values are DormShare choices for the class project. They are not prescribed by OWASP.

| Setting | Proposed value and behavior |
| --- | --- |
| Reset lifetime | 15 minutes from request creation. Email delay does not extend it. |
| Reset secret | 32 cryptographically random bytes, encoded as 64 hexadecimal characters. Store only its SHA-256 digest in recovery state. |
| Per-address recovery requests | At most one delivery attempt per 60 seconds and five per rolling hour. Count normalized unknown addresses too. Suppressed requests return the same generic 202. |
| Per-IP recovery requests | At most 20 syntactically valid requests per rolling hour. Return 429 independently of account existence. |
| Per-IP reset attempts | At most ten requests per rolling 15 minutes, including malformed reset requests. Return 429 before expensive hashing. |
| Per-token reset attempts | At most ten attempts per rolling 15 minutes for a well-formed 64-character token, keyed by its digest. Do not delete a valid token merely because the limit was reached. |
| Metadata capacity | At most 10,000 active entries per limiter map. Remove expired entries before inserting. Fail closed with a generic 503 if capacity is still exhausted. Never evict live entries to bypass a limit. |
| Delivery work | At most 20 outstanding jobs across the process. No unbounded delivery queue or automatic retry loop. |
| Provider timeout | 10 seconds per Brevo request. |
| Password policy | Preserve the existing 8-128 character signup rule. Require matching new-password fields in the frontend. |
| Sessions after reset | Revoke all existing bearer sessions for that account. Do not create a new session. Other accounts remain unchanged. |
| Unverified accounts | Preserve their verification state. Resetting a password does not verify an email. |
| Client IP | Use the direct connection IP. Do not trust forwarded headers until a concrete deployment proxy is configured and reviewed. |

## Public API

| Endpoint | Request | Result |
| --- | --- | --- |
| `POST /api/auth/forgot-password` | `{ email }` | For valid submissions, `202 { message: "If an account exists for this email, password reset instructions will be sent." }`. Known, unknown, and per-address-suppressed addresses share this response. |
| `POST /api/auth/reset-password` | `{ token, password }` | `200 { message: "Password updated. Sign in with your new password." }` after a successful reset. |

Normalize email using the existing trim and lowercase rule. Apply the existing NYU email validation. Invalid input returns 400. Invalid, expired, used, and superseded reset links share a 400 response: "This reset link is invalid or has expired." A weak password is rejected before a valid token is consumed.

Global missing configuration or exhausted capacity returns the same safe 503 regardless of submitted account. An IP limit returns 429 with a retry interval. A recipient-specific delivery failure never changes the generic confirmation or reveals an account.

The frontend calls both routes through `api()`. Its merged `/auth/` exception already omits inherited bearer headers. Mount a dedicated router for exactly these two POST routes after JSON parsing and before `currentUser`. This allows a stale bearer header without weakening `/users/me` or other protected handlers.

Known and unknown requests follow the same public validation, limiter, configuration, and scheduling path. Do not wait for an account-specific provider request before returning confirmation. Do not return early just because an account is unknown. Account lookup and delivery happen in bounded private work with caught failures.

## Delivery ordering and single use

Use one increasing recovery revision per account, plus a password revision. Each candidate records the revisions at creation. Only the newest requested candidate may become active when its delivery succeeds. Completion of an older request must never replace the active link, even if the newer request failed.

A failed new delivery leaves the last successfully activated link valid until its original expiry. It never activates an older unfinished candidate. For example, if A is pending when B starts, A cannot activate later even if B fails. The student may need to request another link. Supersede the previous active link only after the newest candidate succeeds and still matches both revisions. A delivered candidate that has expired or lost its revision check stays invalid.

Use monotonic revisions or unique attempt identities. Never recycle an identity while old delivery callbacks remain. A successful reset invalidates every active and pending reset for that account. This fences any provider request that finishes after the password change. Out-of-order notices may arrive, but an old link cannot reactivate.

Before changing a password, finish any required shared-data load. Then recheck expiry, revisions, account identity, and token ownership. Consume the token, replace the existing salt and hash, and remove that user's reset state and sessions without an intervening await. Concurrent uses have exactly one winner. Preserve the existing signup hash method and use a fresh salt.

Send a separate password-change notice with no password or reset secret. Failure to deliver this notice must not undo a completed password change. Record only a safe failure category. Never log provider payloads, secrets, reset URLs, passwords, or raw provider response bodies.

## Backend boundary and configuration

Keep recovery routing separate from account signup and profile handlers. Reuse the shared users and credential/session maps. Do not create another user store or a public outbox endpoint.

Extend `createApp` with an optional recovery dependency. It supplies a delivery function, clock, trusted origin, and policy. Existing callers continue to work. The recovery service owns token metadata, limiter state, revision checks, and bounded delivery work. A private completion hook lets tests wait for work without exposing secrets through HTTP.

The Brevo adapter accepts reset and password-change messages. It receives recipients only from the registered account. Use native Node fetch and its timeout. Do not add a provider SDK solely for a single HTTP request.

Load `back-end/.env.local` explicitly at server startup, then the existing `.env`, without overriding exported process values. This keeps the private Brevo key separate from existing Mockaroo settings. Resolve both paths from the server file, not the terminal's current directory. Keep secrets out of Vite environment variables and committed files.

Configuration names are `BREVO_API_KEY`, `RECOVERY_FROM`, `RECOVERY_FROM_NAME`, and `PUBLIC_APP_ORIGIN`. The current private setup has no confirmed public app origin. Validate an exact HTTPS origin with no credentials, path, query, or fragment. Never construct links from the request Host or submitted origin. Tests inject an explicit loopback origin; live Brevo recovery requires HTTPS. An absent recovery configuration must not stop existing account routes from working.

## Frontend behavior

Add a Forgot password link to Login and public `/forgot-password` and `/reset-password` routes outside the shared MockData boundary. Reuse `accounts.css` and the agreed NYU design. No new visual direction is needed.

The request form preserves email on failure and shows a generic confirmation after accepted requests. It does not claim delivery to an inbox. Disable repeated submissions while pending. Show retryable service and rate-limit errors accessibly.

Use `/reset-password#token=<secret>` links. Capture the fragment into component memory, remove it from the address bar, and send the secret only in the reset POST body. Use no-referrer protection. Do not persist the secret in localStorage, sessionStorage, query strings, or analytics. A reload after fragment removal requires a fresh link and must explain that clearly.

Provide two password fields with `autocomplete="new-password"`. Validate required values, the shared length rule, and matching confirmation. Preserve field values on retryable errors. Focus the first invalid field. Missing or rejected links show a route to request another link. Successful reset clears any local signed-in state through the merged `signOut()` contract and links to normal sign-in.

## Verification required

- Existing account identity is preserved. The old password fails and the new password signs in through the normal backend and frontend.
- Known and unknown recovery requests have the same status and body. Neither exposes account details or delivery status.
- Reset tokens expire, work once, and resist concurrent reuse. Weak input does not consume a valid token.
- All out-of-order delivery cases preserve the revision rules, including successful reset while a mail request is pending.
- Limits cover unknown addresses, malformed inputs where applicable, exact boundaries, capacity, cleanup, and forwarded-header spoofing.
- Reset revokes that account's sessions while preserving other accounts. Unverified state is unchanged.
- Capture-adapter success/failure and mocked Brevo success, timeout, and error handling pass without a real inbox or a real API key.
- Public recovery works with a stale bearer header. Protected account routes still reject that header.
- Secrets do not enter API responses, mock data, application logs, browser storage, or retained URLs.
- Both forms cover pending, retry, validation, success, rejected links, keyboard navigation, short phone viewports, and widths from 320px through desktop.
- A real reset-link check waits for a trusted HTTPS app origin and separate authorization to send test mail.

## Sources and scope

The [source audit and verified Brevo setup](../../research/139-account-recovery.md) describe the existing account and delivery boundaries. The merged contract is in `front-end/src/context/authSession.js`, `front-end/src/services/api.js`, and `back-end/routes/accounts.js` at master `e068ba5`.

[OWASP's Forgot Password guidance](https://cheatsheetseries.owasp.org/cheatsheets/Forgot_Password_Cheat_Sheet.html) supports generic confirmations, secure one-use expiring tokens, abuse controls, password confirmation, normal login after reset, and session invalidation. The numeric settings and scheduling rules above are project proposals. The fragment choice is a project design decision based on the [URI fragment behavior](https://developer.mozilla.org/en-US/docs/Web/URI/Reference/Fragment).

Approval covers the implementation contract and local testing. It does not create a deployment, purchase a domain, broaden the Brevo key, or authorize additional real emails.
