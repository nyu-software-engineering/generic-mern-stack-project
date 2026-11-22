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

An unverified student can also complete signup in the browser, reset their
password, and return to the existing email-verification step. Reset never
verifies the account. A late reset response clears its original local session
while preserving a newer sign-in.

## Delivery evidence and limits

The [provider setup record](../research/139-account-recovery.md#brevo-setup-verified-november-20-2026)
records a successful Brevo sandbox request and delivery of one approved plain
test email. Adapter tests validate the code and notice payloads, safe errors,
and timeout with a fake provider.

Browser engines do not reproduce a physical phone's on-screen keyboard.
Accounts, sessions, and recovery state still reset when the backend restarts.

The owner authorized a live recovery check on November 21, 2026. A temporary
loopback app used synthetic account data and the configured Brevo adapter.
Brevo accepted the code messages, and a code reached the test recipient's NYU
inbox. The received code successfully opened the password step. The owner
entered the new password and confirmed that reset and normal sign-in worked.
The original password returned 401. Brevo also accepted the password-change
notice; inbox delivery of that notice was not independently checked.

NYU added `[Failed NYU Email Security Check]` to the code email subject. The
received headers show NYU's gateway accepted Brevo's SPF and DKIM but recorded
`dmarc=fail header.from=nyu.edu`. The visible NYU sender did not align with the
authenticated Brevo domain. That test did not establish a clean
sender-authentication setup. The later project mailbox check below resolved
this warning for the tested NYU recipient.
No password, code, API key, or raw message header is retained in this record.

### Project mailbox and replacement sender

On November 21, the owner created a dedicated DormShare Gmail mailbox and
authorized its setup in Brevo. The sender was verified through that mailbox.
One plain sender-authentication test was accepted by Brevo and reached the
NYU inbox in three seconds without the security-warning subject prefix.

Brevo replaced the visible From address with its account-specific
`brevosend.com` address and set Reply-To to the project mailbox. The received
headers show SPF and DKIM passing. NYU's gateway also recorded DMARC passing
for the replacement From domain. This verifies the observed recipient path,
not universal inbox placement or permanent availability of Brevo's replacement
service.

The local ignored backend sender setting now uses the verified project
mailbox. Keep `RECOVERY_FROM` set to that mailbox rather than manually copying
the generated replacement address. Restart the backend after changing it.
The private key was preserved and no application source change was required.
Brevo describes replacement as a temporary delivery measure in its
[sender requirements](https://help.brevo.com/hc/en-us/articles/14925263522578-Comply-with-Gmail-Yahoo-and-Microsoft-s-requirements-for-email-senders).

## Verified November 21, 2026

- Backend: 375 tests passed. The configured coverage scope includes the app
  and routes, with 99.3% statement and 96.92% branch coverage.
- Frontend: 155 tests passed. Lint and production build passed.
- Browser: all eight cases passed in Chromium and WebKit, with no skipped
  cases. These include unverified signup and both late-response session cases.
- Independent correctness and security reviews cover the recovery source.

Automated checks used private capture. The separately authorized live check
and its sender-authentication limitation are recorded above.
