# Booking and handoff implementation plan

## Goal and approved design

Deliver #145 using the approved [NYU light marketplace specification](2026-11-18-nyu-redesign-design.md). Follow the [research](../research/145-booking-implementation.md) and [interface contract](145-booking-interface.md). Preserve the existing services, request ordering guards, role rules, date and price calculations, cache hydration, and local-only handoff records.

Base: `cb1c882`, the #154 foundation. Use a separate branch and small commits. While #154 is open, target its branch. If it merges first, move this work onto master before opening the PR. Do not merge PRs as part of this task.

The full frontend baseline is 127 passing tests and one known notification assertion failure at `test/notifications.test.js:202`. Browser baseline: submitting empty request dates produces no `aria-invalid`, no linked descriptions, and no focus on the first error. At 320px, the handoff checkbox is 288px wide and its label uses grid layout.

## 1. Shared booking presentation

- [x] Add `front-end/src/pages/booking/booking-nyu.css`. Keep every new selector within `.ds-booking`. Keep legacy `booking.css` unchanged because Profile still consumes it.
- [x] The migrated root uses `className="ds-page booking-page ds-booking"`. Override the old width with the 720px reading width plus shared gutters. Use shared typography, surface, border, focus, and spacing tokens.
- [x] Define scoped item summaries, readable content sections, date pairs, request lists, pending/error/empty feedback, metadata, and wrapping action groups. Use native controls with a 44px minimum target. Keep checkboxes at their native square size inside a 44px label target.
- [x] Add scoped danger and danger-link variants to the shared `.ds-button` primitive. Violet remains the primary action; destructive actions use readable red text and clear labels.
- [x] Exercise the stylesheet through the migrated screens, then commit `Add scoped booking layouts`.

## 2. Request, extension, and handoff forms

Files: `BookingForm.jsx`, `ExtensionRequestForm.jsx`, `handoff/HandoffCheckForm.jsx`, and `handoff/PickupReturn.jsx`.

- [x] Add `.ds-field` to text/date/select controls and `.ds-button` variants to actions. Add stable text label IDs and `aria-labelledby` so showing an error does not change a field's accessible name.
- [x] Link the existing validation messages with `aria-invalid` and `aria-describedby`. On invalid submission, focus the first invalid field. Keep current validation rules and payload preparation unchanged.
- [x] Preserve request `aria-busy`, pending protection, submitted values after failure, and extension pending behavior. Do not add network state to synchronous handoff.
- [x] Keep accessory choice recordable as true or false. Use native checkbox keyboard interaction and a wrapping label. Preserve optional notes and completion check summaries.
- [x] Migrate PickupReturn roots, statuses, content, and review/back links to the scoped layout. Remove its legacy handoff CSS import only if the new scoped field rules replace every responsibility.
- [x] Browser-check invalid fields, labels and focus, pickup, return, completion, and keyboard checkbox changes. Run relevant existing tests and lint. Commit forms and handoff separately.

## 3. Booking pages and incoming requests

Files: `Booking.jsx`, `BookingDetails.jsx`, `BookingRequests.jsx`, `BookingLoadState.jsx`, `ListingSummary.jsx`, `RequestCard.jsx`, `Extensions.jsx`, and `Cancellation.jsx`.

- [x] Add scoped roots and imports to all route and loading branches. Use shared buttons and text links. Keep hook and service calls unchanged.
- [x] Group dates, participant, total, status, and agreed terms with clear headings. Keep full terms and messages readable. Keep status words and the existing StatusBadge.
- [x] Preserve agreement-gated confirmation, owner/borrower conditional actions, declined/cancelled/completed states, and cancellation's dedicated confirmation page.
- [x] Give incoming rental and extension lists separate section headings under one page heading. Keep empty requests useful. Remove the unsupported unconditional verified-account claim from RequestCard.
- [x] Retain recoverable failures, retry controls, pending labels, and decline disabling. Preserve every route destination and query-prefilled date.
- [x] Commit request and summary styling separately from extension and cancellation styling.

## 4. Verification and review

- [x] Run `node --test test/bookingsApi.test.js test/extensions.test.js test/cancellation.test.js test/handoff.test.js` from `front-end`. Confirm unchanged contracts and local-only handoff behavior.
- [x] Run frontend lint, build, and full tests. Compare any failure with the baseline. Do not modify the unrelated notification test.
- [x] Verify all six route patterns at 320, 375, 390, 768, 1024, and 1366px. Use long item names, participant names, messages, and terms. Check document width, native fields, actions, and phone navigation clearance.
- [x] Exercise request to summary, agreement and owner confirmation, decline failure and retry, borrower extension, owner approval and decline, cancellation, pickup, return, completion, missing bookings, empty requests, failed reads, and retained failed-write values. Label handoff evidence as local state.
- [x] Check date and condition errors become associated and focused. Check keyboard checkbox operation. Check Profile still uses its legacy styles.
- [x] Save desktop and phone screenshots and `docs/design/145-verification.md` with actual results and limits.
- [x] Obtain independent source and security reviews against the research and interface contract. Resolve actionable findings and repeat affected checks.
- [ ] Push the small commits under the user's identity. Open a focused PR for #145, assign the user, set Sprint 2 and relevant labels, and request Aayan and Samuel for the booking/handoff paths. Keep the issue open until merge.

Implementation is rebased onto master at `6c718b6`. Final source and security reviews passed. See [verification](145-verification.md).
