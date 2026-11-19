# Booking and handoff interface contract

Scope: #145 under the approved [NYU light marketplace design](2026-11-18-nyu-redesign-design.md). The base is `cb1c882`, the #154 source branch. This contract changes presentation and accessible feedback within the existing rental journey. Source contracts are recorded in the [implementation research](../research/145-booking-implementation.md).

## Routes and component interfaces

Keep the current routes and component responsibilities.

| Route | Retained component interfaces |
| --- | --- |
| `/listings/:listingId/request?start=YYYY-MM-DD&end=YYYY-MM-DD` | `Booking()` and `BookingForm({ listing, initialStart = '', initialEnd = '', onSubmit })` |
| `/booking-requests` | `BookingRequests()` and `RequestCard({ booking, onDecline, declining = false, disabled = false })` |
| `/bookings/:bookingId` | `BookingDetails()` and private `BookingSummary({ bookingId })` |
| `/bookings/:bookingId/extension` | `Extensions()`, private `ExtensionPage({ bookingId })`, and `ExtensionRequestForm({ booking, onSubmit, submitting = false })` |
| `/bookings/:bookingId/cancel` | `Cancellation()` and private `CancelPage({ bookingId })` |
| `/handoff/:rentalId` | `PickupReturn()`, private `Handoff({ rentalId })`, `CheckSummary({ title, check })`, and `HandoffCheckForm({ conditionLabel, accessoriesLabel, submitLabel, onSubmit })` |

Keep shared `ListingSummary({ listing, detail })`, `BookingLoadState({ loadError, retry })`, and `StatusBadge({ status })`. No new fetching component or service abstraction is needed.

The listing has its existing ID, owner ID, title, description, daily price, rental terms, and status. The booking has its existing participants, dates, status, total, terms, extension request, and optional pickup/return checks. All prices remain numeric. Dates remain ISO date strings. Stored status values and condition values stay unchanged.

`BookingForm.onSubmit` receives `{ startDate: string, endDate: string, message: string }` and may return a promise. `ExtensionRequestForm.onSubmit` receives one new return date string. `RequestCard.onDecline` receives the booking ID. `HandoffCheckForm.onSubmit` receives `{ condition: string, accessoriesComplete: boolean, notes: string }`. These callbacks retain their current return and failure behavior.

## Style ownership and layout

Retain `pages/booking/booking.css` for legacy consumers. Profile imports it and must keep its current appearance. Add `pages/booking/booking-nyu.css` for this migration. Every new style rule must require a `.ds-booking` ancestor or the `.ds-booking` root itself. Add `ds-page ds-booking` to all migrated main roots, including loading, error, unavailable, and not-found branches. Retaining the old `booking-page` class is safe only when the scoped stylesheet overrides its layout inside `.ds-booking`.

Use the existing shared palette, font, gutters, focus ring, fields, buttons, alerts, and status components from `styles/design-system.css`. Use `.ds-button` variants and `.ds-field` on migrated controls. Keep destructive controls visibly distinct through scoped error-color button or text-link variants. Do not change global StatusBadge styles or the shared design system for this slice.

The booking reading column has a 720px content limit plus the shared gutters. It fills narrow viewports. Use one page heading, a white item summary, readable rental details, and clearly separated terms and action sections. Incoming extensions use a level-two section heading. Summary labels distinguish dates, participants, daily rate, and agreed or proposed total. Keep essential terms and messages fully readable. Preserve the existing image fallback.

The scoped stylesheet owns item-summary image sizing, section rhythm, detail rows, form spacing, responsive date columns, action groups, feedback, empty states, and destructive action states. Use thin borders and white surfaces without nested decorative cards. Any added class names should describe these booking responsibilities. Do not create a general component framework.

At phone widths, dates and actions stack. Long names, terms, errors, and button labels wrap. Do not hide overflow. Text inputs, native dates, selects, and buttons have a 44px minimum target. Checkboxes keep their native compact size inside a comfortably clickable label. Scoped checkbox rules must override the old full-width input and grid-label rules. Either stop importing `handoff.css` from the migrated screen or ensure its legacy select rule cannot override the new scoped field treatment.

## Accessible fields and errors

Keep the current validation rules and messages. Add stable field IDs, label associations, error IDs, invalid state, and focus on the first failed field. Use label text that stays unchanged when an error appears. Error text must not become part of the field's accessible name.

The parent browser check confirmed that missing request dates currently have no invalid state, description association, or error focus. At 320px, the handoff checkbox is 288px wide and its label uses grid layout. These are the baseline symptoms this presentation work must correct.

| Field | Input name and ID | Label ID | Error ID |
| --- | --- | --- | --- |
| Request start | name `startDate`, ID `booking-start-date` | `booking-start-date-label` | `booking-start-date-error` |
| Request return | name `endDate`, ID `booking-end-date` | `booking-end-date-label` | `booking-end-date-error` |
| Message to owner | name `message`, ID `booking-message` | `booking-message-label` | None |
| Extension return | name `newEndDate`, ID `booking-extension-date` | `booking-extension-date-label` | `booking-extension-date-error` |
| Handoff condition | name `condition`, ID `handoff-condition` | `handoff-condition-label` | `handoff-condition-error` |
| Handoff notes | name `notes`, ID `handoff-notes` | `handoff-notes-label` | None |

Associate visible label text with each field. For validation fields, use `aria-invalid` only while invalid and `aria-describedby` only while its error exists. Error elements expose their message as an alert. On rejected submission, focus start date before return date, the extension date, or the condition select as appropriate. Preserve existing clearing behavior when values change. Keep network failure feedback near the relevant form or action. Do not clear entered values after a recoverable failure.

Retain `aria-busy` and existing pending labels and disabled rules. Add the busy attribute to the extension form from its existing `submitting` prop. Do not add new asynchronous handoff behavior or a new confirmation dialog. Cancellation already has a dedicated confirmation page.

## Data and action invariants

- Keep `useBooking(bookingId)` and its return shape `{ booking, loadError, retry, pending, actionError, run }`. Do not change its effects, cleanup guard, keyed page wrappers, request ordering, or mutation behavior.
- Keep `services/bookings.js`, `bookingsApi.js`, cache hydration, formatter names, and API payloads unchanged. The current frontend identity remains `CURRENT_USER_ID`.
- Preserve published cached listings during a recoverable refresh failure. Keep unavailable and self-owned listing guards and real-date query-prefill validation.
- Preserve all date rules, message trimming, rounded total previews, extension costs, agreed rate, retained inputs, and duplicate-submission protection already present.
- Owner confirmation still requires the agreement checkbox. Borrowers can withdraw requested rentals; either participant can cancel confirmed rentals. Active rentals cannot be cancelled. Existing role predicates remain authoritative.
- Preserve derived overdue labels, extension approval and decline behavior, and conditional booking, messaging, report, and review links. Status always has readable words.
- Handoff remains synchronous local state through `confirmPickup` and `confirmReturn`. Keep local-only booking IDs and the cache protections that prevent server refreshes from overwriting local handoff changes. A missing accessory is recordable and does not block confirmation.
- Remove RequestCard's unconditional “Verified NYU” claim. Do not replace it with another verification claim. Show completed-rental counts only when the source supplies them, rather than inventing a zero.

This slice does not add authentication wiring, database persistence, payments, image upload, booking API routes, new rental fields, new validation constraints, or handoff integration. It does not restyle Profile, other journeys, or the shared navigation.

## Verification contract

Run the existing booking API, extension, cancellation, and handoff suites, then frontend lint, build, and the full frontend suite. Compare the full result with the recorded notification-test baseline. Add meaningful tests only if new behavior needs them. Do not write tests that mirror CSS.

Browser-check all six routes at 320, 375, 390, 768, 1024, and 1366px. Include long titles, terms, names, messages, and errors. Check direct links and query dates; invalid date feedback; rounded prices; request-to-summary; owner agreement and confirmation; decline failure and pending state; extension approval and decline; cancellation confirmation and refusal; pickup, return, and completion; no pending requests; failed reads and retry; retained failed-write input; native checkbox keyboard use; and phone navigation clearance.

Record routes, viewports, steps, results, and phone/desktop screenshots with synthetic data. Distinguish browser viewport checks from physical-device checks. State that handoff confirmation is still local. Smoke-check Profile to confirm the legacy stylesheet remains isolated.
