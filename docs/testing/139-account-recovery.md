# Account recovery verification

The recovery flow uses the existing account credential and session maps. It
requests an emailed code, exchanges correct proof for a restricted reset
permission, then accepts a new password and confirmation. It never signs the
student in automatically.

## Repeatable local checks

Install the normal frontend and backend dependencies. No inbox, provider key,
Mockaroo key, or public app URL is needed for these tests.

```sh
cd back-end
npm test
npm run test:coverage
```

```sh
cd front-end
npm test
npm run lint
npm run build
```

From the repository root, run the browser suite with an installed Playwright
package and its browser binaries. If the package is outside the repository,
set its absolute entry-point path:

```sh
PLAYWRIGHT_MODULE=/absolute/path/to/playwright/index.mjs \
PLAYWRIGHT_BROWSER=chromium \
node --test scripts/account-recovery.browser.mjs

PLAYWRIGHT_MODULE=/absolute/path/to/playwright/index.mjs \
PLAYWRIGHT_BROWSER=webkit \
node --test scripts/account-recovery.browser.mjs
```

The suite starts a fresh loopback Express app for each case and serves the
frontend build. It injects synthetic users, private mail capture, and a fake
clock. It sends no real email and adds no production outbox route. It fails
if Playwright or the selected browser is unavailable. Set
`RECOVERY_BROWSER_EVIDENCE` to save a blank password-form screenshot.

The browser checks cover correct and rejected codes, mismatched passwords,
failed requests, duplicate submission guards, session revocation, old and new
password login, expired and exhausted codes, expired permissions, reload, and
late responses after navigation. Layout checks include narrow and short
viewports and keyboard focus.

## Delivery evidence and limits

The [provider setup record](../research/139-account-recovery.md#brevo-setup-verified-november-20-2026)
records a successful Brevo sandbox request and delivery of one approved plain
test email. Adapter tests validate the code and notice payloads, safe errors,
and timeout with a fake provider.

No live code email or password-change notice was sent during this
implementation. A real recovery-email check needs separate send approval.
Browser engines do not reproduce a physical phone's on-screen keyboard.
Accounts, sessions, and recovery state still reset when the backend restarts.
