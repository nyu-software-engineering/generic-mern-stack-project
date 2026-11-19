# Notifications and trust implementation plan

## Goal and boundaries

Deliver #147 under the approved [NYU design](2026-11-18-nyu-redesign-design.md). Follow the [research](../research/147-trust-implementation.md) and [interface contract](147-trust-interface.md). Base: master at `6c718b6`. Keep this slice independent of the open dashboard and booking PRs.

Keep notification ordering, categories, destinations, per-user read storage, review eligibility and ratings, report subjects, response guards, API payloads, and confirmation links. Notification and review writes remain local until #98 and #103. Reporting and community rules already use the backend.

## 1. Deterministic notification regression test

- [x] Confirm `node --test test/notifications.test.js` fails at the existing overdue unread assertion.
- [x] Freeze only Date in that test before its first read using `t.mock.timers.enable({ apis: ['Date'], now: new Date('2026-11-06T12:00:00Z') })`.
- [x] Run the complete notification test again. The initial active reminder must be read before the later overdue event is generated. Keep every existing assertion and service untouched.
- [x] Commit `Fix notification test clock`.

## 2. Shared trust layout and page styles

- [x] Add `front-end/src/styles/trust.css` with `.ds-trust` reading width, shared header, surfaces, metadata, feedback, and focus. Use the existing tokens and `.ds-page`, `.ds-heading`, `.ds-button`, `.ds-field`, `.ds-feedback`, and `.ds-text-link`.
- [x] Migrate the three journey stylesheets with scoped selectors. Notifications retain one readable list and labeled All/Unread filter buttons. Reviews use native radio inputs in labeled fieldsets. Reports use a single labeled form and clear submitted/error states.
- [x] Ensure 44px button and rating-label targets, readable text, wrapping names/comments/rules, and a 720px reading column. At 320px, five rating labels must fit without horizontal overflow. Do not rewrite the shared base system or other journeys.
- [x] Commit styles after exercising actual markup.

## 3. Notifications and reviews

Files: `notifications/Notifications.jsx`, `reviews/ReviewParticipant.jsx`, `reviews/Reputation.jsx`.

- [x] Apply shared roots, headings, buttons, fields, and links. Keep all services and state transitions intact.
- [x] Keep explicit Unread text, pressed filter state, individual read/unread actions, mark-all disabling, and empty All/Unread states. Add no asynchronous loading or persistence claims.
- [x] Give the review form one page heading and clear fieldset legends. Preserve required native 1-to-5 radios, optional 500-character comment, service validation, synchronous submission, and destination.
- [x] Keep review eligibility, duplicate-submission states, reputation calculations, listing toggle, and review links. Remove unsupported verified-account copy and show completed-rental counts only when provided by the data.
- [ ] Browser-check mark/read/unread/all and destination behavior, keyboard radio selection, successful review and duplicate guard, missing user/booking, no reviews, and listing expansion.
- [x] Commit notifications separately from reputation and review forms.

## 4. Reporting and community rules

Files: `reporting/Report.jsx`, `ReportSubmitted.jsx`, `CommunityRules.jsx`.

- [x] Apply shared roots, complete heading hierarchy, labeled fields, clear subject context, and recovery links.
- [x] Preserve native required/maxLength constraints and manual trimmed-description validation. Link and focus manual errors without treating a server subject rejection as a field error. Retain fields and selected file after failed submission.
- [x] Expose existing pending state through `aria-busy` and disabled submission. Explain that only the supporting image filename is saved by this prototype.
- [x] Keep subject resolution for rental, conversation, listing, and general reports. Keep all payload IDs and confirmation/back destinations unchanged.
- [x] Preserve rule/report loading, cleanup guards, error retries, and not-found behavior. Add an understandable empty-rules state with retry.
- [x] Commit report form separately from confirmation and rules.

## 5. Verification and delivery

- [x] Run `node --test test/notifications.test.js test/reviews.test.js test/reports.test.js`, full frontend tests, lint, and production build. Run `git diff --check`.
- [ ] Check all six route patterns at 320, 375, 390, 768, 1024, and 1366px with long comments, names, titles, and rules. Check native rating target size and phone navigation clearance.
- [ ] Cover rental/conversation/listing/general report contexts, whitespace validation, failure retaining values, delayed pending submission, success, confirmation recovery links, failed reads/retry, missing report, and empty rules.
- [ ] Save phone/desktop screenshots and `docs/design/147-verification.md` with actual checks and limits. Distinguish local review/read state from backend report storage.
- [ ] Obtain independent source and security reviews. Resolve findings and repeat affected checks.
- [ ] Push small commits under the user's identity, open a PR against master for #147, set Sprint 2 and relevant labels, and request Omer and Samuel. Keep the issue open until merge.

Current state: implementation and automated checks are complete. Browser checks are partial. Final source re-review and saved screenshots remain pending. See [verification](147-verification.md). Keep the PR in draft.
