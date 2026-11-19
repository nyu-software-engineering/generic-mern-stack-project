# Messages and requests implementation plan

## Approved scope

Deliver #146 using the [approved NYU design](2026-11-18-nyu-redesign-design.md), [research](../research/146-messages-implementation.md), and [interface contract](146-messages-interface.md). Base is master at `6c718b6`. Keep services, routes, callback payloads, role rules, local booking IDs, response attribution, filtering, and storage behavior. API migrations remain in #104, #109, and #115.

Baseline: 127 frontend tests pass. The existing notification assertion at `test/notifications.test.js:202` fails. Its test-only fix is already in #159 and is not duplicated here.

## 1. Shared layout and native offer dialog

- [ ] Add scoped `styles/messages.css` with a 720px reading shell, 1184px board variant, shared surfaces, form labels, errors, actions, date pairs, metadata, and visible focus. Reuse existing tokens and control classes.
- [ ] Migrate chat styles within `.ds-messages`. Wrap long messages, names, timestamps, offers, and prices. Give the composer flexible width and stack controls when needed. Preserve sender and offer-status text.
- [ ] Replace the current offer overlay with a native modal dialog. Retain the OfferForm signature and callbacks. Support focus entry, contained Tab navigation, Escape, backdrop dismissal, and return to the opener. Limit dialog height to the viewport and scroll its content.
- [ ] Associate existing offer validation errors with stable field IDs and names. Focus the first invalid field without changing validation rules, calculated days, or submitted values.
- [ ] Commit chat layout, dialog, and conversation markup in separate small changes where useful.

## 2. Requests and board

- [ ] Migrate create and detail forms to shared fields and buttons. Retain every service call, condition, and route destination. Link existing errors and focus the first invalid field.
- [ ] Retain open, closed, own-request replies, no-offerable-listings, missing-request, message-only reply, and offer response paths. Keep target prices optional and free offers valid.
- [ ] Replace incomplete tab semantics on the board with a named button group and pressed filter state. Keep all existing filter values and ordering. Wrap filters, headers, and actions at 320px.
- [ ] Use scoped request cards and a responsive board grid. Preserve latest-response summaries and existing chat links. Keep request type and ownership visible as text.
- [ ] Commit item request forms separately from board presentation.

## 3. Quick Borrow

- [ ] Give Quick Borrow a semantic main, page h1, shared form, fields, actions, and feedback. Keep the same field names, required constraints, input types, service payload, successful reset, and localStorage persistence.
- [ ] Explain that the request is saved in this browser. Keep blank-field feedback linked and focused. Catch storage failure at the submit boundary and retain entered values instead of claiming success.
- [ ] Commit `Restyle Quick Borrow`.

## 4. Verification and delivery

- [ ] Run item request and requests board tests, related booking/chat integration tests, frontend lint, build, and the full suite compared with baseline.
- [ ] Test Inbox, conversation query, new request query, request detail query, board, and Quick Borrow at 320, 375, 390, 768, 1024, and 1366px. Include long and unbroken content and large prices.
- [ ] Exercise message send, offer validation, keyboard dialog behavior, counteroffer, decline, acceptance to booking, create request, own-request close/replies, message-only and offer responses, board filters, Quick Borrow save/refresh, and storage failure. Check missing and empty data.
- [ ] Check phone navigation clearance and a short viewport as a keyboard-space approximation. Record that this is not a physical keyboard or device test.
- [ ] Save desktop and phone screenshots and a verification note with tested behavior and limits.
- [ ] Obtain independent source and security reviews, fix actionable findings, and repeat affected checks.
- [ ] Push small commits under the user's identity. Open a PR against master, set Sprint 2 and relevant labels, assign the user, and request Yutong and Samuel. Keep #146 open until merge.
