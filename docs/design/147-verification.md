# Notifications and trust verification

Work in progress for #147, November 19, 2026. Base: master at `6c718b6`. The [interface contract](147-trust-interface.md) and [implementation plan](147-trust-plan.md) define the scope. This branch is a draft until the remaining checks below are complete.

## Automated checks

| Check | Result |
| --- | --- |
| Full frontend suite on the final source | 128 pass, 0 fail |
| Notification, review, and reporting tests | 11 pass |
| Frontend lint | Pass |
| Frontend production build | Pass, 110 modules |
| Diff whitespace check | Pass |

The prior notification failure at `test/notifications.test.js:202` was reproduced in isolation. Its fixture return date had passed, so the bulk-read step marked the overdue notification as read before the later regression scenario reused that same ID. Freezing Date at November 6, 2026 keeps the intended reminder-to-overdue transition deterministic. The complete test then passes with all original assertions intact. No notification service behavior changed.

The final full suite initially could not start loopback servers under the restricted test environment. It was rerun with loopback access and all 128 tests passed.

## Completed browser checks

Used the in-app Chromium browser with a disposable local Express fixture. All names, comments, reports, and mutations were synthetic.

- Checked Notifications, Reputation, Review Participant, Report, Report Submitted, and Community Rules at 320, 375, 390, 768, 1024, and 1366px. All 36 checks used the new trust scope and document width equalled viewport width.
- Checked a long participant name, long review comments, and a long listing title. Content wrapped without page-level overflow in the route matrix.
- The review form now has a page h1. At 320px, each of the first five rating labels measured 46px wide and 44px high. Before the change, labels were about 33px wide and 21px high.
- Marking a notification read reduced Unread from 12 to 11. Unread filtering excluded that notification. Marking it unread restored it.
- Mark all as read produced an Unread count of zero, the caught-up state, and a disabled bulk action. The zero count survived refresh. View details for New rental request opened `/bookings/101`.
- A report with a valid reason and spaces-only description showed a linked error, set `aria-invalid`, and focused the description. Changing the reason retained that description error. Correcting the description cleared it.
- A failed report submission retained its reason and description and enabled submission again.

These observations were made before browser controls became unavailable. Screenshots were inspected during testing but have not yet been saved as deliverable evidence.

## Review status

The independent security review passed and also ran the 11 targeted frontend tests and 61 backend reporting tests. The source review raised two findings: unrelated field edits cleared description feedback, and the report-confirmation loading branch lacked a heading. Both were fixed in `11e998f`. The error-retention fix was checked in the browser. The loading branch was checked in source. Final independent re-review could not finish because the workspace reviewer reached its usage limit.

## Remaining before ready for review

- Complete keyboard radio selection, native required-rating behavior, successful local review submission, duplicate and ineligible review states, and reputation listing expansion.
- Complete report submission and confirmation for general, rental, conversation, and listing contexts. Check the unchanged payloads and destination links, conflicting references, selected filename retention, delayed pending state, and filename-only help.
- Check confirmation and rules read failures and retries, missing reports, empty rules, and stale response behavior in the browser.
- Check phone bottom-navigation clearance, enlarged text, empty notification data, and save desktop and phone screenshots.
- Complete the independent source re-review of the two fixes.

Review and notification changes still use local state and existing services. Report and rule requests still use the existing backend APIs. No service, identity, route, API payload, or eligibility contract was changed. This report does not claim physical-device, Safari, Firefox, screen-reader, or zoom coverage.
