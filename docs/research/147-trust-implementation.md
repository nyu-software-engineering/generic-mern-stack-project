# Trust screens implementation research for #147

Inspected November 19, 2026. This note covers the six trust routes and their services. It follows [DESIGN.md](../../DESIGN.md) and the [approved design](../design/2026-11-18-nyu-redesign-design.md). This is source research. It does not claim browser verification.

## Existing boundaries

- Five routes sit inside the pathless `MockData` route: notifications, reputation, review, report, and report confirmation. The wrapper owns bootstrap loading, failure, retry, and stale effect cleanup. Community rules sits outside it and loads independently. None of these routes uses `SavedItemsProvider`. Preserve these boundaries and existing route access. Sources: [routes](../../front-end/src/App.jsx), [bootstrap](../../front-end/src/components/MockData.jsx).
- Notifications and reviews read the shared in-memory store. Bootstrap loads it through `GET /api/mock-data`. Review creation only changes that store. Notification read IDs live in a per-user memory Set and browser storage. Neither feature currently sends writes to its own API. Identity remains `CURRENT_USER_ID = 'owner-1'`, separate from account context. Sources: [shared store](../../front-end/src/services/mockDataService.js), [notifications](../../front-end/src/services/notifications.js), [reviews](../../front-end/src/services/reviews.js).
- Reports and rules use the shared `api()` helper. It handles JSON, a 15 second timeout, `ApiError.status`, optional field errors, and network failure status 0. `createReport()` posts JSON to `/api/reports`. `getReport(id)` encodes the ID for `GET /api/reports/:id`. `getCommunityRules()` uses `GET /api/community-rules`. Subject titles and people still come from the local store. Sources: [report service](../../front-end/src/services/reports.js), [transport](../../front-end/src/services/api.js).
- The backend stores reports in its shared process data. It defaults requests without authorization to `owner-1`. The frontend helper does not add an authorization header. Do not present this styling work as account integration or durable report storage. Sources: [report routes](../../back-end/routes/reports.js), [identity middleware](../../back-end/middleware/currentUser.js).

## Contracts to preserve

### Notifications

`getNotifications(userId = CURRENT_USER_ID)` synchronously returns `{id,title,message,to,category,priority,order,isRead}[]`. Ordering is descending priority, then descending numeric order. `markNotificationRead(id,userId)` and `markNotificationUnread(id,userId)` return false for IDs that do not currently exist. `markAllNotificationsRead(userId)` returns the updated list. Read IDs persist under `dormshare-notifications-read:<userId>`. Storage errors fall back to memory. IDs can disappear and later return with their prior read state. Source: [notification service](../../front-end/src/services/notifications.js).

| Event | Recipient and destination |
| --- | --- |
| requested | Owner only, `/bookings/:id` |
| declined | Borrower only, `/bookings/:id` |
| confirmed, active, cancelled | Either participant, `/bookings/:id` |
| overdue active rental | Either participant, `/bookings/:id`, distinct `rental-:id-overdue` ID |
| extension_requested | Either participant, `/bookings/:id/extension` |
| completed | Either participant, review route if they have not reviewed, otherwise booking route |
| approved or declined extension on active rental | Borrower only, extension route, ID includes outcome and requested end date |
| latest incoming message or offer | Conversation participant only, `/inbox?conversation=:id`, ID includes conversation and last message IDs |

Notification overdue generation applies only to `active`, even though the shared `isOverdue()` helper also supports `extension_requested`. Keep this difference. Preserve All and Unread counts, `aria-pressed`, disabled bulk action at zero unread, both empty messages, and detail links that mark the row read before navigation. The page refreshes its snapshot after its own read actions. It does not subscribe to remote activity. Sources: [service](../../front-end/src/services/notifications.js), [page](../../front-end/src/pages/notifications/Notifications.jsx), [date helpers](../../front-end/src/services/bookings.js).

### Reputation and review

- `getReputation(userId)` returns null for unknown users, otherwise `{user,reviews,averageRating}`. Average is null with no reviews and uses overall ratings only. Reviews sort by descending numeric ID. Completed rental count comes from `user.completedRentals ?? 0`, not a new calculation. Only published listings appear in the optional listings section. Own profile detection currently uses strict `userId === CURRENT_USER_ID`. Sources: [service](../../front-end/src/services/reviews.js), [reputation page](../../front-end/src/pages/reviews/Reputation.jsx).
- `getReviewTarget(rental,reviewerId)` allows only completed rental participants and returns the other participant. `getReviewForBooking(bookingId,reviewerId)` enforces one review per reviewer per rental. `getReviewableRentals(userId)` returns eligible, unreviewed rentals in descending ID order. Both lending and borrowing orientations matter. Source: [reviews](../../front-end/src/services/reviews.js).
- `submitReview({bookingId,reviewerId,communicationRating,itemCareRating,overallRating,comment})` is synchronous. Each rating must be an integer from 1 to 5. Comment defaults to empty, is trimmed, and cannot exceed 500 trimmed characters. The page also has native required radios and `maxLength={500}`. Keep values after thrown validation errors. Successful creation navigates to `/users/:otherUserId/reputation`. Already reviewed users see that same destination. Ineligible or missing bookings return to Browse. Sources: [review service](../../front-end/src/services/reviews.js), [review form](../../front-end/src/pages/reviews/ReviewParticipant.jsx).
- Reputation currently says “Verified NYU student” for every record without checking verification data. Do not turn this into a badge or repeat that unsupported claim. A neutral explanation of shared demo activity fits the actual boundary. Source: [reputation page](../../front-end/src/pages/reviews/Reputation.jsx).

### Reports and rules

- `resolveReportSubject({rentalId,listingId,conversationId})` returns `{booking,conversation,listing}` from local records. Listing lookup prefers the rental, then conversation, then listing query. Unknown IDs drop out. Display and back-link precedence is rental, conversation, listing, then general. Multiple valid subjects can resolve together. The form submits each resolved rental and conversation ID, while omitting a separate listing ID when either exists. Preserve this behavior. The backend rejects links that disagree. Sources: [resolver](../../front-end/src/services/reports.js), [form](../../front-end/src/pages/reporting/Report.jsx), [backend validation](../../back-end/routes/reports.js).
- Payload stays `{rentalId,listingId,conversationId,reason,description,imageName}`. Reasons are exactly `Damage`, `Missing item`, `Unsafe listing`, `Other`. Description is required after trimming and limited to 2000 characters. File input sends only its first file name, never image bytes. Clear supporting copy should state that limitation. The backend trims strings and validates file name syntax and length. It does not require an image extension. Sources: [shared options](../../shared/options.mjs), [form](../../front-end/src/pages/reporting/Report.jsx), [backend](../../back-end/routes/reports.js).
- Submission disables the existing button and shows `Submitting...` while awaiting the API. Success opens `/report/submitted/:reportId`. Failure preserves uncontrolled form values and file selection, resets pending, and renders an alert. Status 400 has a specific message. Other errors include the service message. Form changes clear the error. Source: [report form](../../front-end/src/pages/reporting/Report.jsx).
- Backend requires rental or conversation participation, checks every supplied reference against one listing, and permits direct reports on published or own listings. Unknown and inaccessible reports both return 404. Created records use `DS-101` style IDs and status `awaiting moderator review`. Source: [backend report routes](../../back-end/routes/reports.js).
- Confirmation keeps keyed `{reportId,attempt}` results plus effect cleanup. It shows loading for new IDs and retries, 404 as not found, other errors with retry, and successful report details. Back destinations are booking, inbox query, listing, then Browse. Its current “Back to transactions” label does not describe every destination, so a contextual label is appropriate. Rules has the same attempt and cleanup pattern, with loading, error/retry, and API rule articles. No rules empty message currently exists. Sources: [confirmation](../../front-end/src/pages/reporting/ReportSubmitted.jsx), [rules](../../front-end/src/pages/reporting/CommunityRules.jsx).

## Proposed presentation contracts and CSS scope

Keep page data and handlers in place. Add no new service interfaces or component library. Reuse `ds-page`, `ds-heading`, `ds-button` and its variants, `ds-field`, `ds-text-link`, `ds-status`, and `ds-feedback` where they fit. Use existing `--ds-*` tokens for widths, color, spacing, corners, and typography. Apply `ds-field` only to select, textarea, and suitable file controls, never to rating radios. Sources: [shared design system](../../front-end/src/styles/design-system.css), [approved migration rules](../design/2026-11-18-nyu-redesign-design.md).

Keep layout selectors under `.notifications-page`, `.review-page`, and `.report-page`. Review CSS has exactly two page consumers. Reporting CSS has three. Notification CSS has one. The old review shell caps width at 390px and sets 14px text and full viewport height. Notifications uses old blue, dark selection colors, small metadata, and `overflow:hidden` on its panel. Reporting inherits generic `.page` and `.rental-card` styles. Replace those uses or override them only beneath a trust page root. Do not change generic `.page`, `.rental-card`, `.listing-card`, or global buttons. `.rental-card` also serves owner dashboard, renter dashboard, and requests board. Sources: [reviews CSS](../../front-end/src/pages/reviews/reviews.css), [reporting CSS](../../front-end/src/pages/reporting/reporting.css), [notifications CSS](../../front-end/src/pages/notifications/notifications.css), [global CSS](../../front-end/src/index.css).

The design system loads after `index.css`, but legacy page classes still override matching layout properties. Avoid retaining conflicting old width, padding, font, and button declarations while adding shared classes. The shared shell already reserves bottom navigation space at root level on phones. Do not add another review navigation bar or duplicate safe-area padding. Sources: [entry point](../../front-end/src/main.jsx), [shared CSS](../../front-end/src/styles/design-system.css), [navigation](../../front-end/src/components/Navbar.jsx).

Presentation-only interface choices:

- Page header: one visible h1, brief copy, and an accurate back link. A review form currently has no h1 in its eligible state.
- Rating controls: retain each native fieldset, legend, radio name, and numeric value. Increase clickable label area and add visible radio focus. Associate the optional comment counter and error with the field where useful.
- Notification controls: retain real buttons and links. Give the filter container a meaningful group role if keeping its accessible label. Keep the visible Unread text. Add contextual accessible names for repeated details and read controls.
- Report feedback: retain alert and status roles, announce pending through `aria-busy`, and explain the 2000 character limit and filename-only attachment. Use text to describe review status.
- Loading, not found, error, and empty branches need the same page width and heading system as populated screens. Rules and report cards currently jump from h1 to h3. Fix heading order as part of the markup migration.

These are source-level accessibility gaps, not measured browser failures. Check focus clipping, touch targets, long names, long comments, filename overflow, keyboard radio selection, and text zoom in the browser. Sources: [notifications](../../front-end/src/pages/notifications/Notifications.jsx), [reputation](../../front-end/src/pages/reviews/Reputation.jsx), [review](../../front-end/src/pages/reviews/ReviewParticipant.jsx), [report](../../front-end/src/pages/reporting/Report.jsx), [confirmation](../../front-end/src/pages/reporting/ReportSubmitted.jsx), [rules](../../front-end/src/pages/reporting/CommunityRules.jsx).

## Six-route coverage checklist

| Route | Required cases |
| --- | --- |
| `/notifications` | All, Unread, individual read and unread, bulk read and disabled bulk, details navigation, empty All and empty Unread, long messages, refreshed page with persisted read state |
| `/users/:userId/reputation` | Own profile and other profile, missing user, average and no average, reviews and none, own eligible rentals and none, published listings toggle and empty listings |
| `/bookings/:bookingId/review` | Eligible owner and borrower, completed booking, nonparticipant or incomplete or missing booking, already reviewed, all three ratings required, comment empty and 500 characters, validation alert, success destination |
| `/report` | General, `?rentalId=:id`, `?conversationId=:id`, `?listingId=:id`, unknown IDs, mixed valid and invalid IDs, conflicting valid rental and conversation, required reason and description, whitespace description, 2000 character limit, optional filename, pending, 400 and network error, preserved values, success destination and contextual back links |
| `/report/submitted/:reportId` | Loading, actual saved report, general and each linked subject, missing or inaccessible 404, other error and retry, route ID change and stale response suppression |
| `/community-rules` | Independent direct load, ordered API content, loading, network error and retry, empty result, report entry link |

All paths above come from [App.jsx](../../front-end/src/App.jsx). Incoming report links come from [item details](../../front-end/src/pages/browse/ItemDetails.jsx), [booking details](../../front-end/src/pages/booking/BookingDetails.jsx), and [conversation](../../front-end/src/pages/chat/Conversation.jsx). Review links also come from [handoff](../../front-end/src/pages/handoff/PickupReturn.jsx), notifications, reputation, and [Profile](../../front-end/src/pages/auth/Profile.jsx). Preserve exact query keys and destinations.

Use the approved 320, 375, 390, 768, 1024, and 1366px widths. Record routes, steps, and screenshots. Test enlarged text and keyboard navigation. Run relevant service tests, full frontend tests, lint, and build after implementation. Existing tests cover service behavior but do not verify rendered layouts. Sources: [frontend scripts](../../front-end/package.json), [notification tests](../../front-end/test/notifications.test.js), [review tests](../../front-end/test/reviews.test.js), [report tests](../../front-end/test/reports.test.js).

## Confirmed notification test failure

`node --test test/notifications.test.js` fails alone at line 202 with `true !== false`. This is not cross-file pollution. The [fixture](../../front-end/test/fixtures.js) gives active rental 104 an end date of `2026-11-07`. After that date, its first notification is already `rental-104-overdue`. The bulk read step at line 143 marks that ID read. Regression 1 then moves 104 into 2099, reads `rental-104-active`, and moves it into 2000. The old overdue ID returns. The read Set correctly still contains it. Source: [test sequence](../../front-end/test/notifications.test.js), [read Set and generated IDs](../../front-end/src/services/notifications.js).

A read-only diagnostic reproduced the exact initial and final ID as `rental-104-overdue`, with final `isRead:true`. Executing the complete test from an in-memory module with only this setup line added made it pass, 1 test out of 1:

```js
t.mock.timers.enable({ apis: ['Date'], now: new Date('2026-11-06T12:00:00Z') })
```

Place this at the start of the existing test, before the first notification generation. The fixed date precedes the fixture due date and remains between the regression's 2000 and 2099 dates. Node restores test mocks after the test. This preserves the ID distinction, read persistence, bulk action assertions, and extension regressions. It avoids weakening the assertion or resetting service state. It also avoids a future date setup that eventually expires. No tracked test or service file was changed during this investigation.
