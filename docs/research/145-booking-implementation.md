# Booking and handoff research for #145

Source audit on November 19, 2026. This note does not claim browser verification. The full frontend baseline is 127 passing tests and one known failure in `test/notifications.test.js:202`.

The approved visual direction is recorded in [DESIGN.md](../../DESIGN.md), [PRODUCT.md](../../PRODUCT.md), and the [NYU specification](../design/2026-11-18-nyu-redesign-design.md). This slice changes presentation while preserving services and rental rules.

## Routes and components

- `/listings/:listingId/request`: [Booking.jsx](../../front-end/src/pages/booking/Booking.jsx), [BookingForm.jsx](../../front-end/src/pages/booking/BookingForm.jsx), and [ListingSummary.jsx](../../front-end/src/pages/booking/ListingSummary.jsx). Query parameters `start` and `end` prefill real calendar dates.
- `/booking-requests`: [BookingRequests.jsx](../../front-end/src/pages/booking/BookingRequests.jsx) and [RequestCard.jsx](../../front-end/src/pages/booking/RequestCard.jsx), including incoming extensions.
- `/bookings/:bookingId`: [BookingDetails.jsx](../../front-end/src/pages/booking/BookingDetails.jsx), with conditional role and status actions.
- `/bookings/:bookingId/extension`: [Extensions.jsx](../../front-end/src/pages/booking/Extensions.jsx) and [ExtensionRequestForm.jsx](../../front-end/src/pages/booking/ExtensionRequestForm.jsx).
- `/bookings/:bookingId/cancel`: [Cancellation.jsx](../../front-end/src/pages/booking/Cancellation.jsx).
- `/handoff/:rentalId`: [PickupReturn.jsx](../../front-end/src/pages/handoff/PickupReturn.jsx) and [HandoffCheckForm.jsx](../../front-end/src/pages/handoff/HandoffCheckForm.jsx), including completion and recorded checks.

[BookingLoadState.jsx](../../front-end/src/pages/booking/BookingLoadState.jsx) handles loading, forbidden/not-found, and recoverable read failures. [useBooking(bookingId)](../../front-end/src/pages/booking/useBooking.js) exposes `{ booking, loadError, retry, pending, actionError, run }`. Preserve its cleanup guard and keyed route wrappers.

## Data and state boundaries

[bookingsApi.js](../../front-end/src/services/bookingsApi.js) owns network requests. `requestBooking({ listingId, startDate, endDate, message })` posts a numeric listing ID. The server owns participants, price terms, and total. Its other public functions fetch and answer bookings/extensions and cancel bookings. Responses hydrate the shared cache.

[bookings.js](../../front-end/src/services/bookings.js) supports other journeys. Preserve helper names, including `getUser`, `formatMoney`, `formatDate`, `extensionCost`, `displayStatus`, and role predicates.

Handoff remains synchronous browser state through `confirmPickup` and `confirmReturn`. These mark rentals as local-only. API helpers preserve them instead of overwriting them with older server records. Local chat bookings use a separate high ID range. Do not change this mechanism or describe local confirmation as server persistence. Handoff integrations #111 and #113 remain separate.

`CURRENT_USER_ID` remains `owner-1`. The merged backend account API does not complete frontend integration #94. Styling must not alter identity.

## Workflow invariants

- Booking rejects unavailable and self-owned listings. A published cached listing appears immediately, refreshes, and survives non-404 refresh failures.
- Booking dates must be real dates. Starts cannot be past; returns must follow starts. Messages trim, total previews round to cents, pending submission disables repeat submission, and failed writes retain values.
- Incoming bookings and extensions load together. A pending decline disables other decline controls, then removes the answered row after success.
- Only owners confirm requested bookings, after checking agreement. Borrowers wait or withdraw.
- `displayStatus` derives overdue for active/extension rentals past return. Overdue is never stored.
- Borrowers request extensions for active rentals. Owners answer pending requests. Approval moves return and adds cost at the agreed daily rate. Decline preserves dates and total.
- Borrowers withdraw requested rentals. Either participant cancels confirmed rentals. Other states retain existing refusal/completion copy. Cancellation has a dedicated confirmation page.
- Borrowers confirm pickup of confirmed rentals. Owners confirm return of active rentals. Pending extensions prevent return confirmation.
- Handoff payloads remain `{ condition, accessoriesComplete, notes }`. Use `ITEM_CONDITIONS`. Missing accessories remain recordable. Completion preserves check records and conditional review links.

## Styling and accessibility

Reuse [design-system.css](../../front-end/src/styles/design-system.css) tokens and shared page, heading, button, field, feedback, status, and link classes. Reuse [StatusBadge](../../front-end/src/components/StatusBadge.jsx) without global behavior changes.

Scope trap: [Profile.jsx](../../front-end/src/pages/auth/Profile.jsx) imports [booking.css](../../front-end/src/pages/booking/booking.css) and uses its legacy classes. Add a new booking root scope or new names to avoid changing #143. [handoff.css](../../front-end/src/pages/handoff/handoff.css) also globally targets booking selects.

Current full-width input and label rules distort checkboxes. Correct this within the new scope. Date and condition errors need `aria-invalid` and `aria-describedby`, with stable accessible names. Long terms/messages must wrap. RequestCard contains an unconditional verification claim; do not strengthen it without supporting data.

## Verification plan

Run existing booking API, extension, cancellation, and handoff tests, then lint/build and the full suite against baseline.

Browser-check all six routes at 320, 375, 390, 768, 1024, and 1366px. Cover prefilled/invalid dates, rounded totals, long content, request-to-summary, owner confirmation, decline failure/pending, extension approval/decline, cancellation/refusal, pickup/return/completion, missing listings, empty requests, read failures/retry, retained failed-write values, keyboard checkboxes, and bottom-nav clearance. Record local-only handoff limitations explicitly.
