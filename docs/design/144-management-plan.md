# Listings and dashboard implementation plan

## Goal and architecture

Deliver #144 using the approved design and existing page state. Reuse shared controls, add scoped management layouts, and keep listing form styling local. See [interface contract](144-management-interface.md) and [research](../research/144-management-implementation.md).

Baseline: 127 frontend tests pass. The unchanged notification test fails at `test/notifications.test.js:202`. A browser check confirmed that spaces-only title, description, and terms produce no feedback today. The old category select is 41px tall, and pages do not yet use the management style scope.

## 1. Shared management layout

- [x] Add `front-end/src/styles/management.css` with the exact shared class responsibilities from the contract.
- [x] Use the existing palette, font, fields, buttons, links, feedback, and icon contracts. Keep other journeys' selectors untouched.
- [x] Check the styles with actual listing/dashboard markup in the following tasks. Commit the shared layout separately once exercised.

## 2. Listing form validation and management

- [x] Add `front-end/test/listingForm.test.js` before the helper. Test trimmed blanks, blank/negative/nonfinite price, valid zero and decimal prices, and unchanged form input.
- [x] Run `node --test test/listingForm.test.js` and confirm it fails because the new helper is missing.
- [x] Add `validateListingForm(form)` with the exact existing rules, returning field messages. Re-run the tests and confirm they pass.
- [x] Apply `ds-page ds-management` layout, visible filter labels, styled listing rows, preview, pending/errors/empty states, and shared controls in MyListings. Add local listing CSS.
- [x] Bind errors to inputs without changing service payloads, accepted values, native constraints, mutation protection, editing, cancellation, or cache writes.
- [x] Browser-check spaces-only feedback, create/save/preview, edit, publish/pause, retained values after failure, duplicate protection, filter empty states, load retry, and a direct new-listing URL.
- [x] Commit validation and page styling as separate small changes where possible.

## 3. Owner dashboard

- [x] Migrate only the page markup and styling. Keep the fetch effect and request ordering guards intact.
- [x] Show server totals as three readable cells, followed by visible search and status labels and rental activity rows. Reuse StatusBadge.
- [x] Check filtered results leave totals unchanged, errors and retry recover, empty activity is understandable, booking links work, and long titles wrap.
- [x] Commit `Restyle owner rental dashboard`.

## 4. Renter dashboard and saved items

- [x] Migrate page markup using the shared management layout. Keep rental loading separate from saved-item loading.
- [x] Preserve derived overdue, filters, booking links, provider state, and SaveListingButton. Make empty states useful without creating extra data or metrics.
- [x] Check save state across Browse and Rentals, unsave failures, separate read failures and retries, empty rentals, and status filtering.
- [x] Commit `Restyle renter dashboard and saved items`.

## 5. Verification and PR

- [x] Run frontend tests, lint, and build. Compare the full suite with the known baseline and run the passing scope separately before review.
- [x] Verify all four routes at 320, 375, 390, 768, 1024, and 1366px. Check long content, keyboard focus, and phone navigation clearance. Record what was and was not tested.
- [x] Capture phone and desktop screenshots with synthetic data.
- [x] Obtain independent code and security reviews. Fix actionable findings and rerun affected checks.
- [x] Open the PR against #154's branch while it is unmerged. If #154 merges first, rebase onto master and target master. Request Sherry and Aayan. Keep #144 open until merge.

Review: [PR #155](https://github.com/agile-students-fall2026/generic-mern-stack-project-dormshare/pull/155), targeting #154's branch until that dependency merges. Sherry and Aayan were requested.
