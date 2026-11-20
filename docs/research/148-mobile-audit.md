# Cross-app mobile audit research

Source review on November 20, 2026 for #148. The audit target is the temporary combined checkout at `c94a69e17fa211f60328d91fdef9e97405251e2f`. It combines master `306fc2a` with the pending #157 and #163 heads. This checkout is a local test target, not a published merge.

This note records source contracts and browser test scope. Every risk below is **UNVERIFIED** until reproduced in the browser. It records no new browser result and makes no WCAG conformance claim. Follow the [approved NYU design](../design/2026-11-18-nyu-redesign-design.md).

## Exact route coverage

[App.jsx](../../front-end/src/App.jsx) declares these 28 paths. Query views, tabs, and overlays do not add routes. Page sources below are in `front-end/src/pages/`.

| # | Exact path | Page source | Forms, actions, and states to check |
| --- | --- | --- | --- |
| 1 | `/` | `auth/Welcome.jsx` | Create account and sign-in links. Signed-out and signed-in shell. |
| 2 | `/login` | `auth/Login.jsx` | Email, password, native required/email checks, NYU domain error, error focus, sign in. |
| 3 | `/signup` | `auth/Signup.jsx` | Name, email, password, eight-character minimum, whitespace/domain errors, create account. |
| 4 | `/verify-email` | `auth/VerifyEmail.jsx` | Code, invalid code, resend status, confirmation, signed-out redirect. |
| 5 | `/setup-profile` | `auth/SetupProfile.jsx` | New and prefilled edit form, required fields, whitespace errors, Save profile, identity redirects. |
| 6 | `/profile` | `auth/Profile.jsx` | Long identity, renter/owner/account links, edit, sign out, signed-out redirect. |
| 7 | `/browse` | `browse/Browse.jsx` | Search/category/clear, save/unsave, long cards, loading, retry, empty and populated results. |
| 8 | `/browse/:id` | `browse/ItemDetails.jsx` | Dates, estimate, request link, save, report, own listing, unavailable, read error. |
| 9 | `/listings` | `listings/MyListings.jsx` | Search/status, create/edit/preview, publish/pause, close, validation, pending and failure. |
| 10 | `/listings/new` | `listings/CreateListing.jsx` | Same implementation with form open. Cancel returns to `/listings`; save shows preview. |
| 11 | `/owner-dashboard` | `ownerDashboard/OwnerDashboard.jsx` | Three metrics, search/status/clear, booking links, empty, loading, retry. |
| 12 | `/renter-dashboard` | `renterDashboard/RenterDashboard.jsx` | Status filter, overdue, booking links, independent saved-item loading/error/empty and unsave. |
| 13 | `/listings/:listingId/request` | `booking/Booking.jsx` | Blank/prefilled dates, message, total, date errors, pending/retry, own/unavailable listing. |
| 14 | `/booking-requests` | `booking/BookingRequests.jsx` | Incoming booking and extension cards, decline, pending/error, empty. |
| 15 | `/bookings/:bookingId` | `booking/BookingDetails.jsx` | Owner agreement/confirm/decline; borrower waiting; extension, handoff, cancel, review, message, report. All stored statuses and derived overdue. |
| 16 | `/bookings/:bookingId/extension` | `booking/Extensions.jsx` | Borrower date/estimate, invalid date, waiting, owner approve/decline, approved/declined notice, refused status. |
| 17 | `/bookings/:bookingId/cancel` | `booking/Cancellation.jsx` | Withdraw/cancel confirmation, Keep booking, pending/error, cancelled success, refusal after pickup. |
| 18 | `/handoff/:rentalId` | `handoff/PickupReturn.jsx` | Borrower pickup, owner return, condition/select, accessory checkbox, notes, waiting/complete, saved checks. |
| 19 | `/inbox` | `chat/Inbox.jsx` | List/detail, send draft, offer/counter dialog, accept/decline, empty and missing conversation. |
| 20 | `/requests` | `requests/ItemRequests.jsx` | Create or detail query view; otherwise redirects to board. Fields, responses, close, offer/message, empty/missing/closed states. |
| 21 | `/requests-board` | `requestsBoard/RequestsBoard.jsx` | All, Quick borrow, Item request, My requests filters; reply/manage links; empty tabs. |
| 22 | `/quick-borrow` | `quickBorrow/QuickBorrow.jsx` | Item/date/time/duration/area/details, whitespace errors, save/reset, storage failure, Open inbox. |
| 23 | `/notifications` | `notifications/Notifications.jsx` | All/unread counts, read/unread, mark all, detail links, empty and caught up. |
| 24 | `/report` | `reporting/Report.jsx` | Context, reason, description, optional image filename, validation, pending/error, submit/back links. |
| 25 | `/report/submitted/:reportId` | `reporting/ReportSubmitted.jsx` | Loading, receipt, related destination, not found, failure/retry, changed-id stale response. |
| 26 | `/community-rules` | `reporting/CommunityRules.jsx` | Rules, report link, loading, failure/retry, empty rules. |
| 27 | `/users/:userId/reputation` | `reviews/Reputation.jsx` | Long identity/comments, ratings/unrated, published-listing toggle, own reviewable rentals, missing user. |
| 28 | `/bookings/:bookingId/review` | `reviews/ReviewParticipant.jsx` | Three native 1–5 radio groups, optional 500-character comment, required ratings, submit, duplicate/ineligible. |

Sources for each row are the named page and its imported children. The [earlier route inventory](redesign-route-inventory.md) explains the service boundaries, but its old CSS risk list predates the redesign. Current source takes precedence.

### Child and query views

- `/inbox?conversation=1` selects conversation 1. Offers and counteroffers open a native modal dialog on that view.
- `/requests?new` selects create. `/requests?request=1` selects detail. `new` takes precedence when both keys exist. Bare `/requests` redirects to `/requests-board`.
- `/listings/2/request?start=2030-02-01&end=2030-02-04` prefills request dates. Invalid dates must still follow existing form validation.
- `/report?rentalId=104`, `/report?conversationId=1`, and `/report?listingId=2` select report context. Check unknown ids and conflicting subjects too. Resolved subjects determine the back link and submitted identifiers.
- Board tabs, listing preview/edit, notification filters, saved controls, and reputation expansion use component state. They are not URL routes.

Sources: [Inbox](../../front-end/src/pages/chat/Inbox.jsx), [ItemRequests](../../front-end/src/pages/requests/ItemRequests.jsx), [Booking](../../front-end/src/pages/booking/Booking.jsx), [Report](../../front-end/src/pages/reporting/Report.jsx), and [reports service](../../front-end/src/services/reports.js).

## Role and status fixtures

Use disposable synthetic data. [The existing frontend fixture](../../front-end/test/fixtures.js) is a useful starting point, not a complete mobile fixture. Service identity stays `owner-1`. Account identity is separate React state and clears on reload. Signing in with another email does not change service role. Do not change either provider or service identity to expose a screen.

| Fixture | Existing records or required addition | Journey covered |
| --- | --- | --- |
| Owner | Listing 1 belongs to `owner-1`. Bookings 101–107 belong to that owner and borrower `student-2`. | Listing management, incoming requests, confirm/decline, owner extension decisions, return. |
| Owner status series | 101 requested, 102 declined, 103 confirmed, 104 active, 105 extension_requested, 106 completed, 107 cancelled. | Status labels and conditional actions. Fixture 105 has no extension object, so add a valid pending `extensionRequest` for the decision view. |
| Borrower | Listing 2 belongs to `student-2`. Booking 201 is confirmed with borrower `owner-1`. Booking 113 is completed in that orientation. | Rental request, pickup, review as borrower. Add separate requested, active, and pending-extension borrower records. |
| Dates | Existing fixture rental dates are November 5–7, 2026. | They are past at audit time. Use future dates for new requests. Use separate active records before and after the audit date for active and derived overdue. Record the test clock. |
| Extension outcomes | Pending object: `{ newEndDate, status: 'pending' }`; later approved or declined object. | Borrower waiting, owner approve/decline, date/price update, declined retry. |
| Handoff | Confirmed borrower record and active owner record, then local pickup/return checks. | Native checkbox, required condition, optional notes, completed state. Unchecked accessories remain valid. |
| Reviews | 106 and 113 are completed. Existing reviews are by `student-2` about `owner-1`. | `owner-1` can submit its own review, then hit duplicate guard. Keep a separate fresh completed booking per repeated run. |
| Conversation | Conversation 1 is about listing 2. Incoming message 2 is a pending $18 offer from `student-2`. | Counter/decline/accept, outgoing-offer gate, native offer dialog, long text and timestamps. |
| Requests | Request 1 is another student's open request. Request 2 belongs to `owner-1`. | Respond with own published listing, blank optional target price, own replies/close. Add closed, no-listing, no-reply, message-reply, and offer-reply states. |
| Text and values | Extend synthetic names, emails, titles, area, terms, unbroken message/comment, prices, and file names. | Reflow and visibility of values and actions. Avoid relying only on short seed copy. |

Sources: [mock data service](../../front-end/src/services/mockDataService.js), [AuthProvider](../../front-end/src/context/AuthProvider.jsx), [booking helpers](../../front-end/src/services/bookings.js), [booking details](../../front-end/src/pages/booking/BookingDetails.jsx), [extensions](../../front-end/src/pages/booking/Extensions.jsx), and [review service](../../front-end/src/services/reviews.js).

## Current mobile rules and unverified risks

| Area | Current source contract | UNVERIFIED browser risk and check |
| --- | --- | --- |
| Shared shell | `--ds-control-height: 44px`; `--ds-nav-height: 4.5rem`. Phone nav is fixed with five equal columns, safe-area padding, wrapping labels, and z-index 20. Root bottom padding uses the nav token plus safe area. | Measure the actual nav height and content clearance when labels grow. Root reserve does not measure rendered nav height. Scroll each final action fully above the bar, including focus outline. Check signed-in and signed-out shells. |
| Header | Header has a 72px minimum. At 768px, desktop nav replaces phone nav and has a full-row flex basis. At 1024px, flex basis becomes auto and header minimum becomes 88px. Destinations/actions can wrap. | Check natural header height at 768/1024 and enlarged text. Confirm each action remains readable and reaches at least 44px. No page should assume a fixed header height. |
| Enlarged text | Body and shared tokens use rem values, but many page labels and headings still use fixed px sizes. Root enlargement is distinct from browser zoom. | Record 200% root-text results separately from true 400% tab zoom. Inspect clipped text, crowded controls, native widgets, page overflow, and lost actions at each setting. |
| Dates and selects | Shared fields have `width: 100%`, `min-width: 0`, and 44px minimum height. Detail dates also declare `min-inline-size: 0` and `max-width: 100%`. Other date/time fields lack those extra declarations. | Check native dates/time and long selected options in booking, extension, request, Quick Borrow, and offer forms in Chromium and iPhone Safari. Native intrinsic sizes and picker UI can differ. |
| Forms and error focus | Migrated forms use linked invalid/error attributes and focus the first custom error. Native required checks remain in auth, listing, review, report, and Quick Borrow forms. | Test native and custom error paths with the keyboard open. Confirm focus stays visible, values remain, all errors can be reached, and submission does not sit behind navigation. A short viewport only approximates reduced keyboard space. |
| Listing management | Form becomes one column below 768px. Phone listing rows use a fixed 72px image plus a flexible text column. Action groups wrap. | Long titles and enlarged action labels can narrow the text column. Test create, edit, preview, publish/pause, pending, failure, and the final Cancel/Save controls. |
| Booking actions | Phone date/fact grids collapse below 768px. Agreement and accessory labels use flex, 44px minimum height, and 20px native checkboxes. | Use the label hit area, Tab, Space, date keyboard entry, and wrapped agreement copy. Test both roles because available actions differ. |
| Offer dialog | Native `dialog.showModal()`, named heading, initial amount focus, Tab loop, Escape/cancel/backdrop handling, focus return. CSS width is constrained and height is `90dvh` with vertical scrolling. | Test the last actions while the keyboard is open and at true zoom. Verify background cannot receive focus, dialog scroll works, cancel restores the opener, and dragging from inside to backdrop preserves the draft. |
| Ratings | Three native required radio groups. Five columns each have a 44px minimum. Labels are at least 44 by 44px; native radios are 16px. | At 320px only limited spare space remains inside card padding. Test enlarged digits and labels, focus outlines, Space/arrow keys, native required feedback, and Submit clearance. Measure labels, not only the radio glyph. |
| Discovery cards | Phone cards use an 88px minimum media column, flexible content, and `overflow: hidden`. Description is intentionally clamped. | Check title-link focus outlines against clipping and long title/price/save wrapping. Confirm the full details remain available on the detail route. |

Sources: [design tokens and shell reserve](../../front-end/src/styles/design-system.css), [Navbar markup](../../front-end/src/components/Navbar.jsx), [Navbar CSS](../../front-end/src/components/Navbar.css), [listing CSS](../../front-end/src/pages/listings/listings.css), [booking CSS](../../front-end/src/pages/booking/booking-nyu.css), [offer dialog](../../front-end/src/pages/chat/OfferForm.jsx), [chat CSS](../../front-end/src/pages/chat/chat.css), [rating CSS](../../front-end/src/pages/reviews/reviews.css), [browse CSS](../../front-end/src/pages/browse/browse.css), and [detail CSS](../../front-end/src/pages/browse/itemDetails.css).

## Browser scope and evidence limits

Check all 28 routes at 320, 375, 390, 768, 1024, and 1366px. Add every child query view above. Use a signed-in session for bottom-navigation checks. Since account state clears on reload, use app navigation or re-establish sign-in before claiming signed-in coverage.

For each view, record document/viewport width, horizontal clipping, reading order, visible focus, target bounds, and final-action scroll clearance. On forms, cover invalid, valid, pending, error with retained values, and success when those states exist. Include shared bootstrap failure and retry plus the independently loaded rental and saved-item sections.

Run true Chromium tab zoom to 400% from a 1280 by 900 window. Record the achieved zoom and effective layout viewport. Browser zoom, root-font enlargement, and a manually narrowed viewport must have separate evidence. A headless viewport change alone does not establish true zoom.

Use a short phone viewport for a repeatable scroll approximation. Physical iPhone Safari still needs a manual check with the real keyboard, native date/time pickers, safe-area bar, orientation, and offer dialog. Keep manual findings separate from Chromium results. If that device check is not completed, report it as outstanding.

Earlier evidence can guide regression cases, but does not prove the combined checkout. [#143](../design/143-verification.md) covers six account views, root text enlargement, and short-viewport clearance. [#144](../design/144-verification.md) covers four management routes and listing actions. [#145](../design/145-verification.md) covers six booking routes, role actions, and native handoff checks. [#146](../design/146-verification.md) covers six message/request views and the dialog. [#147](../design/147-verification.md) covers six trust routes, native ratings, root text enlargement, and phone clearance. These reports explicitly exclude physical-device and true full-zoom coverage.

## Change boundaries

Keep all route paths, query keys, field names, native constraints, callbacks, eligibility gates, API payloads, cache updates, and provider boundaries. `MockData` wraps 21 routes. `SavedItemsProvider` wraps only Browse, item detail, and renter dashboard. There is no app-wide auth guard. Only verification, setup, and Profile have account redirects. Source: [App.jsx](../../front-end/src/App.jsx).

Keep server-backed listing, booking, saved-item, report, and rule calls intact. Chat, requests, reviews, and handoff still use existing local services. Quick Borrow and notification read state retain their existing browser storage. Chat-created and handoff-mutated bookings retain their local-only behavior and ID range. Report attachments still send only a file name. These are existing boundaries, not new persistence promises. Sources: [service inventory](redesign-route-inventory.md), [booking service](../../front-end/src/services/bookings.js), [booking API](../../front-end/src/services/bookingsApi.js), and [Report](../../front-end/src/pages/reporting/Report.jsx).

Make a source change only after a browser reproduction identifies a concrete failure. Record its viewport, role, state, steps, and evidence. Review the proposed fix for architecture, source quality, and security in the required later stages. Repeat the affected journey and shared-shell checks after any shared CSS change.
