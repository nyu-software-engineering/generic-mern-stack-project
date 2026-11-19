# Trust interface design for #147

Design only, November 19, 2026. Based on the [approved direction](2026-11-18-nyu-redesign-design.md), [DESIGN.md](../../DESIGN.md), and [implementation research](../research/147-trust-implementation.md). Routes, service contracts, and data behavior stay intact.

## Layout and ownership

Use `ds-page ds-trust` for all six page roots, including loading, missing, and error branches. `.ds-trust` sets a reading width of 720px within the shared gutters. Keep the existing white global header and single phone bottom navigation. Trust screens add no second navigation bar or safe-area spacer.

Reuse `ds-heading`, `ds-button`, `ds-button--primary`, `ds-button--secondary`, `ds-field`, `ds-text-link`, `ds-status`, `ds-feedback`, and `ds-feedback--error`. Use the existing shared tokens. Page headings use the shared 28px phone and 32px desktop scale. Body text stays 16px. Metadata uses 14px. Content uses white surfaces, restrained borders, and violet actions and selected states.

Add shared reading layout and surfaces in `styles/trust.css`. Keep journey-specific layout CSS in the existing three page stylesheets. Scope all new rules under `.ds-trust`. Notification selectors serve Notifications only. Review selectors serve Reputation and ReviewParticipant only. Report selectors serve Report, ReportSubmitted, and CommunityRules only. Replace reporting's generic `rental-card` use with scoped trust markup. Do not modify global `.page`, `.rental-card`, `.listing-card`, or all-control selectors.

## Retained component interfaces

All six components retain their default export and take no props. No new service or shared state interface is required.

| Component signature | Route and source of state |
| --- | --- |
| `Notifications()` | `/notifications`; synchronous notification service, local All or Unread filter |
| `Reputation()` | `/users/:userId/reputation`; `useParams().userId`, synchronous reputation and listing selectors, local listings toggle |
| `ReviewParticipant()` | `/bookings/:bookingId/review`; `useParams().bookingId`, synchronous eligibility and duplicate selectors, controlled ratings and comment |
| `Report()` | `/report`; `useSearchParams()` subject IDs, local error and pending state, existing uncontrolled form |
| `ReportSubmitted()` | `/report/submitted/:reportId`; `useParams().reportId`, existing keyed async result and retry attempt |
| `CommunityRules()` | `/community-rules`; existing async result and retry attempt |

Keep all current hooks, API functions, payloads, cache updates, and identity boundaries. Preserve MockData route placement. CommunityRules continues to load outside MockData. Preserve cleanup and result keys in both API readers. Notifications and reviews gain no artificial loading, pending, or server-delivery states.

## Screen contracts

Notifications has one h1, short explanatory copy, and a Browse back link. Keep All and Unread buttons with counts and `aria-pressed`. Give their container a named group role. Keep the bulk button disabled at zero unread. A notification row retains its title, message, category, visible Unread cue, details link, and read toggle. Repeated controls get names that include the notification title. Details still marks the notification read before navigation. Preserve both empty messages and service ordering. Optional polite feedback can report the current result or unread count without claiming delivery.

Reputation has one h1 with the student's name. Show the current average or “Not rated yet”, reviews received, and the existing published-listings toggle. Keep `aria-expanded` and connect the toggle to its section. Show eligible review links only on the current demo user's own profile. Preserve the service's eligibility and list order. Remove unconditional “Verified NYU student”. Show a completed rental count only when `user.completedRentals` is present. Do not substitute zero for a missing count. Unknown users get a clear heading and Browse link.

ReviewParticipant has a visible “Review participant” h1. Keep the completed rental context and other participant name. Keep all three native fieldsets and legends: Communication, Item condition / care, and Overall experience. Each retains five required radio choices with numeric values 1 through 5 and its existing group name. Labels provide at least 44px clickable height. Radios keep native keyboard behavior and visible focus. Do not apply full-width field styles to radios. Preserve the optional 500-character textarea and controlled count. Associate help and relevant validation feedback with the comment. Service errors retain current input values. Success still opens the other participant's reputation. Preserve missing or ineligible, already submitted, and eligible branches.

Report has one h1 and a subject summary only when a subject resolves. Preserve the exact `reason`, `description`, and `image` input names and stable visible labels. Keep native required fields, reason options, `maxLength={2000}`, file `accept="image/*"`, and the existing form submission handler. Description help explains the limit. A whitespace-only description shows the existing manual validation error, links it to the description, marks that field invalid, and moves focus to it. Keep server errors as form alerts and preserve all field values and file selection after failure. Show pending through the existing disabled button and `aria-busy`. File help says: “Only the file name is saved. The image is not uploaded.” Send the same `imageName` payload, with no upload implementation.

ReportSubmitted uses the same reading shell for loading, not found, failure/retry, and success. Keep status and alert semantics, a clear h1, report ID, resolved related subject, and text status. It continues to ignore stale results. CommunityRules has one h1, rule sections with h2 headings, loading status, error/retry, and report link. An empty rules result can explain that no rules are available. Rule content still comes from the API.

## Subject and link rules

Preserve query keys `rentalId`, `conversationId`, and `listingId`. Keep local resolver behavior. Known rental and conversation IDs are sent through unchanged. Direct listing IDs are sent only when neither of those subjects exists. Unknown local IDs drop out. The backend still validates participation and matching references.

| Resolved context | Form back link | Confirmation back link |
| --- | --- | --- |
| Rental | `/bookings/:id`, “Back to rental” | Same |
| Conversation | `/inbox?conversation=:id`, “Back to conversation” | Same |
| Listing | `/browse/:id`, “Back to listing” | Same |
| General or unresolved | `/community-rules`, “Back to community rules” | `/browse`, “Back to Browse” |

Rental takes precedence over conversation, then listing. Preserve both known IDs if the resolver returns both a rental and conversation. Conflicting references remain a backend validation error. Preserve report success navigation to `/report/submitted/:reportId`, notification-provided destinations, and review success navigation.

## Verification contract

Run frontend notification, review, and report service tests, the full frontend suite, lint, and build. The existing notification test needs only a fixed test clock at `2026-11-06T12:00:00Z` before its first read. The [research note](../research/147-trust-implementation.md) records the isolated failure and successful in-memory verification. No service fix is needed.

Browser checks cover all six routes at 320, 375, 390, 768, 1024, and 1366px. Record steps and screenshots. Check keyboard navigation, visible focus, native radio arrow keys, enlarged text, long names and descriptions, control wrapping, filename overflow, and bottom navigation clearance.

- Notifications: All and Unread, both empty cases, read toggles, bulk disabled and enabled, persisted read state after refresh, correct detail destinations.
- Reputation: own and other user, missing user, empty and populated reviews, optional rental count absent and present, listing toggle empty and populated, eligible review links.
- Review: eligible owner and borrower, incomplete and missing booking, nonparticipant, already submitted, required rating groups, optional comment and length boundary, local error and preserved values, success link.
- Report: general, rental, conversation, listing, unknown IDs, mixed known and unknown IDs, conflicting known references, all back links, native validation, whitespace-only description focus, pending, 400 and network error, retained values and selected file, filename-only payload, success confirmation.
- Confirmation: direct saved-report link, each related subject and general fallback, loading, 404, other error and retry, rapid report ID change with stale result ignored.
- Rules: independent direct load, API content, loading, error and retry, empty response, report link.

No new unit tests should merely assert CSS or mirror markup. Use browser evidence for layout and accessibility behavior. Preserve existing service tests as the behavior boundary.
