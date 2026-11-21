# DormShare backend

## Run locally

From `back-end/`:

```sh
npm install
```

If you already have `.env`, keep it and add `MOCKAROO_API_KEY` using the team's
private key. Preserve your existing values, including `MONGODB_URI`.

For first-time setup, copy the template without overwriting an existing file:

```sh
cp -n .env.example .env
```

Set `MOCKAROO_API_KEY` in the new `.env` using the team's private key. Then run:

```sh
npm run dev
```

The server uses `http://127.0.0.1:3001`. Restart it after changing `.env`.
MongoDB is not required for the Sprint 2 mock API.

- `GET /api/health` returns `{ "status": "ok" }` without loading data.
- `GET /api/mock-data` returns the shared users, listings, rentals, conversations,
  reviews, item requests, and Quick Borrow requests. The frontend loads it on startup.
- Failed data loads return safe JSON errors. A missing key returns 503. An
  upstream failure or invalid response returns 502. A later request can retry.

Backend data stays in memory and resets when the server restarts.

## Add feature routes

Mount feature routers in `app.js` before the final API 404 handler. Use the same
store in every router:

```js
const data = await request.app.locals.mockDataStore.load();
const rentals = data.rentals.filter(
  (rental) => rental.ownerId === request.currentUserId,
);
response.json(rentals);
```

The first load fetches and validates Mockaroo data. Concurrent loads share one
request. Later loads return the same mutable object, so changes are visible to
other routes. Do not create separate copies of listings or rentals.

Keep existing field names and ID types. User IDs are strings. Listing and rental
IDs are numbers. Bookings use the `rentals` array and its `borrowerId`, `ownerId`,
`listingId`, `terms`, and `extensionRequest` fields. A missing optional
`quickBorrowRequests` collection becomes an empty array.

`currentUser` sets `request.currentUserId` to `owner-1`. It ignores identity
headers. This is the placeholder for #92, not a login system.

Validation and option values live in `../shared/`. The frontend imports the same
rules through its existing service and option paths.

## Renter dashboard and saved items

These routes use the server's current user and the shared mock listings and
rentals. Saved items are stored in memory per user and reset on server restart.

| Method | Path | Response |
| --- | --- | --- |
| GET | `/api/rentals/mine` | Rentals for the current borrower, with a `listingTitle` field |
| GET | `/api/saved-items` | The current user's saved listings that are still published |
| POST | `/api/saved-items` | The saved listing, with 201 for a new save or 200 if already saved |
| DELETE | `/api/saved-items` | 204, including when there is no matching save |

POST and DELETE accept a JSON body such as `{ "listingId": 5 }`. Invalid IDs
return 400. POST returns 404 for missing or unpublished listings and 403 for
the current user's own listings. DELETE can remove a save even if the listing
is unavailable. Frontend integration remains in #120.

## Owner listing routes

`routes/ownerListings.js` handles #106 under `/api/listings`:

| Method | Path | Response |
| --- | --- | --- |
| GET | `/api/listings/mine` | Current owner's listings in every status |
| POST | `/api/listings` | Created draft listing, status 201 |
| PUT | `/api/listings/:id` | Updated listing |
| PATCH | `/api/listings/:id/status` | Listing with updated status |

POST and PUT require `title`, `category`, `description`, `price`, and
`rentalTerms`. Text fields must not be blank. Category must match the shared
options. Price must be a finite number of zero or more. Strings such as `"5"`
are not accepted as prices. PUT replaces all five editable fields.

The server assigns IDs, owner IDs, placeholder images, and the initial draft
status. POST and PUT ignore other submitted fields. PATCH changes only status
and accepts `draft`, `published`, or `paused`.

Edits and status changes return 404 for a missing listing and 403 for another
owner's listing. Invalid details or status values return 400 without changing
the records. Successful changes remain in the shared store until restart.

Frontend integration remains in #108.

## Owner dashboard route

`GET /api/owner/dashboard` handles #110 and returns:

```js
{
  summary: { totalRentals, activeRentals, recordedIncome },
  rentals: [{ ...rental, listingTitle, borrowerName }]
}
```

Only rentals owned by `request.currentUserId` appear in the response. Rentals
where that user is only the borrower do not count. The summary covers all of the
owner's rentals, even when filters narrow the rows. `activeRentals` includes
`active` and `extension_requested`, since the item is still on loan.
`recordedIncome` sums completed rental prices and rounds to cents.

Optional query parameters:

- `search`: Trimmed, case-insensitive text matching the listing title, borrower
  name, or borrower ID. Blank text has no effect.
- `status`: `all` by default, or one exact value from the shared rental statuses.
  Search and status filters apply together.

Unknown, repeated, or bracketed parameters and invalid statuses return 400 with
`{ "error": "Invalid dashboard filters." }` before loading data.

Rows preserve their stored order and all rental fields. Missing listings display
`Listing unavailable`; missing users display their borrower ID. Fallback labels
do not count as names when searching. The route does not change shared records.
Frontend integration remains in #112.

## Public listing routes

- `GET /api/listings` returns published listings in their stored order. The
  optional `search` matches title and description with a case-insensitive
  substring search. The optional `category` accepts an exact shared category.
  Omit either filter or pass an empty value to leave it unset. Repeated
  `search` or `category` parameters and invalid categories return 400.
- `GET /api/listings/:id` returns a published listing. Unknown, draft, and
  paused listings return 404.

The owner router is mounted first so `/api/listings/mine` continues to return
the current owner's listings in every status. Both routers use the same store.
Frontend integration remains in #117.


## Reporting routes

`routes/reports.js` handles #118 under `/api/reports` and `/api/community-rules`.
Reports are stored in `data.reports` in the shared store, which starts empty, so
they are lost on restart.

| Method | Path | Response |
| --- | --- | --- |
| POST | `/api/reports` | Created report with status `awaiting moderator review`, status 201 |
| GET | `/api/reports/:id` | One report, for the user who filed it only |
| GET | `/api/community-rules` | `[{ id, title, body }]`, the three community rules |

POST accepts a JSON body such as
`{ "reason": "Damage", "description": "Cracked screen.", "rentalId": 101 }`.

- `reason` must be one of `reportReasons` in the shared options: `Damage`,
  `Missing item`, `Unsafe listing`, or `Other`.
- `description` must be non-blank text of at most 2,000 characters after
  trimming. `imageName` is optional text and defaults to an empty string. It must
  be a plain file name of at most 255 characters, with no `/`, `\`, `<`, `>` or
  control characters.
- `rentalId`, `conversationId` and `listingId` are optional. Each must be text or
  a whole number, and `null` or an empty string means "not given". Any other
  type, such as an object, array or boolean, returns 400.
- A rental is attached only if the current user is its owner or borrower. A
  conversation is attached only if the current user is a participant. Unknown
  records and other people's records both return 400, so ids can't be probed.
- The listing is taken from the attached rental or conversation. A `listingId`
  sent on its own must be published or belong to the current user. When more
  than one of `rentalId`, `conversationId` and `listingId` is sent, they must all
  be about the same listing, or the request returns 400.
- Invalid details return 400 `Invalid report details.` without creating a report.

The server assigns the report ID (`DS-101`, `DS-102`, ...), reporter, status and
creation time. Other submitted fields are ignored.

GET `/api/reports/:id` returns 404 for an unknown ID and for another user's
report, using the same response for both. Frontend integration remains in #121.

## Booking routes

`routes/bookings.js` handles #91 under `/api/bookings`. Bookings are stored in
the shared `rentals` array, so other routes such as `/api/rentals/mine` and the
owner dashboard see them immediately.

| Method | Path | Response |
| --- | --- | --- |
| POST | `/api/bookings` | Created booking with status `requested`, status 201 |
| GET | `/api/bookings/requests` | Requested bookings waiting on the current owner |
| GET | `/api/bookings/:id` | One booking, for its owner or borrower only |
| PATCH | `/api/bookings/:id/status` | Booking with status `confirmed` or `declined` |

POST accepts a JSON body such as
`{ "listingId": 2, "startDate": "2026-12-01", "endDate": "2026-12-04", "message": "Hi!" }`.

- `listingId` must be a positive integer for a published listing. Missing,
  draft, and paused listings return 404. Booking your own listing returns 400.
- `startDate` and `endDate` must be real calendar dates in `YYYY-MM-DD` form,
  with `endDate` after `startDate`. The total is `days × pricePerDay`, rounded to
  cents, where `days` is `endDate − startDate`.
- `startDate` cannot be in the past. The frontend should block dates before the
  viewer's local today. The server cannot see the viewer's time zone, so it
  accepts any date that is today somewhere (from UTC−12) and returns 400 for
  dates that are already past everywhere.
- `message` is optional text and defaults to an empty string. Other types
  return 400.
- A total too large to store returns 400 without changing the rentals.

The server assigns the ID, owner, borrower, status, price terms, total, and
creation date. Other submitted fields are ignored.

GET `/:id` returns 403 for bookings the current user is not part of. PATCH
`/:id/status` accepts `{ "status": "confirmed" }` or `{ "status": "declined" }`,
returns 403 for anyone but the owner, and 409 if the booking was already
answered. Unknown booking IDs return 404. Frontend integration remains in #93.


## Extension and cancellation routes

The same router handles #95 and #99. Unknown booking IDs return 404.

| Method | Path | Response |
| --- | --- | --- |
| GET | `/api/bookings/extension-requests` | Pending extensions waiting on the current owner |
| POST | `/api/bookings/:id/extensions` | Booking with status `extension_requested`, status 201 |
| PATCH | `/api/bookings/:id/extensions` | Booking back to `active`, with the extension approved or declined |
| POST | `/api/bookings/:id/cancel` | Booking with status `cancelled` |

POST `/:id/extensions` accepts `{ "newEndDate": "2026-12-10" }`. Only the
borrower can ask (403 otherwise), and only for an `active` booking (409
otherwise, including while another extension is pending). `newEndDate` must be
a real calendar date after the current `endDate` and not already past, using
the same "today" rule as booking. The booking gets
`extensionRequest: { newEndDate, status: "pending" }`.

PATCH `/:id/extensions` accepts `{ "approve": true }` or `{ "approve": false }`.
Only the owner can answer (403), and only a pending request (409). Either way the
booking returns to `active`, and `extensionRequest.status` becomes `approved` or
`declined`. Approving moves `endDate` to `newEndDate` and adds
`days × daily rate` to `totalPrice`. The daily rate is the agreed
`terms.pricePerDay`; if that is missing or not a valid amount, it falls back to
the listing's current price, like the frontend `dailyRate()`. If neither is
usable, approving returns 409 without changing the booking (declining still
works). A total too large to store returns 400 without changing the booking.

POST `/:id/cancel` takes no body. Before pickup, the borrower can withdraw a
`requested` booking, and either person can cancel a `confirmed` one. Owners
decline requests with PATCH `/:id/status` instead, so the owner cancelling a
`requested` booking returns 409. Active, completed, declined, and cancelled
bookings return 409. People outside the booking get 403.

Frontend integration remains in #97 and #100.

## Conversation routes

`routes/conversations.js` handles #102 under `/api/conversations`:

| Method | Path | Response |
| --- | --- | --- |
| GET | `/api/conversations` | Current user's conversations, newest message first |
| GET | `/api/conversations/:id` | One conversation with all its messages |
| POST | `/api/conversations/:id/messages` | Created text message, status 201 |
| POST | `/api/conversations/:id/offers` | Created pending offer, status 201 |
| POST | `/api/conversations/:id/offers/:messageId/accept` | `{ offer, booking }` with a confirmed booking, status 201 |
| POST | `/api/conversations/:id/offers/:messageId/decline` | Declined offer |

POST accepts `{ "text": "..." }`. The text is trimmed and must not be empty;
otherwise the route returns 400. The server sets the message `id`, `senderId`,
`type`, and `sentAt`, and ignores those fields in the body. Message IDs are
unique across all conversations.

Unknown conversations return 404. Conversations the current user is not part of
return 403. Messages stay in the shared store until restart.

Offers accept `{ "totalPrice": 18, "startDate": "2026-12-01", "endDate": "2026-12-04" }`.
`totalPrice` must be a number of 0 or more and is rounded to cents. Dates follow
the booking rules: real `YYYY-MM-DD` dates, `endDate` after `startDate`, and no
start date in the past. Invalid offers return 400. A new offer marks any pending
offer in the conversation as `countered`.

Only the other participant can accept or decline a pending offer. Your own offer
returns 403, an unknown or text message ID returns 404, and an offer that is no
longer pending returns 409. Accepting adds a `confirmed` booking to the shared
`rentals` array with the same fields as `POST /api/bookings`, using the offer's
dates and total. The borrower is the participant who does not own the listing.
Accepting returns 409 if the offer's dates have passed or the listing is no
longer published.


## Handoff routes (#113)

`routes/handoff.js` handles pickup and return under `/api/handoff`:

| Method | Path | Response |
| --- | --- | --- |
| GET | `/api/handoff/:rentalId` | The rental, with `pickupCheck` and `returnCheck` once they exist |
| POST | `/api/handoff/:rentalId/pickup` | Rental with status `active` and a `pickupCheck` |
| POST | `/api/handoff/:rentalId/return` | Rental with status `completed` and a `returnCheck` |

The rental has the same fields as `POST /api/bookings`. Pickup adds `pickupCheck`
and return adds `returnCheck`, each shaped like this:

```json
{
  "condition": "Minor wear",
  "accessoriesComplete": true,
  "notes": "Small scratch.",
  "confirmedBy": "owner-1",
  "confirmedAt": "2026-11-20T15:00:00.000Z"
}
```

POST accepts `{ "condition": "As described", "accessoriesComplete": true, "notes": "..." }`.
`condition` is required and must be `As described`, `Minor wear`, or `Damaged`.
`accessoriesComplete` must be true or false and defaults to false. `notes` must be
text, is trimmed, and defaults to an empty string. The server sets `confirmedBy`
and `confirmedAt`. Invalid bodies return 400.

Only the borrower can confirm pickup, and only for a `confirmed` rental. Only the
owner can confirm the return, and only for an `active` rental. The wrong person
gets 403 and any other status gets 409, so confirming twice returns 409. Unknown
rental IDs return 404, and people outside the rental get 403 on every route,
including GET. Checks run in this order: rental (404, 403), body (400), role (403),
status (409). Changes stay in the shared store until restart.


## Reviews and reputation routes (#96)

`routes/reviews.js` uses the existing shared mock-data store.

| Method | Endpoint | Purpose |
| --- | --- | --- |
| GET | `/api/users/:id/reputation` | Public user reputation |
| GET | `/api/bookings/:id/review` | Current user's review for a booking |
| POST | `/api/reviews` | Create a review for a completed booking |

### Reputation

Returns `{ user, reviews, averageRating }`.

Reviews are sorted by descending ID. `averageRating` is the mean of
`overallRating`, or `null` when no reviews exist. Unknown users return 404.

Public profiles expose only ID, display name and optional completed rental count.
Newly registered accounts use the public name "DormShare student" rather than
exposing private registration or profile details.

### Booking review

Returns the current user's review, or JSON `null` if none exists.

Only booking participants may access this endpoint. Unknown bookings return
404 and other users receive 403.

### Submit review

POST accepts:

```json
{
  "bookingId": 101,
  "communicationRating": 5,
  "itemCareRating": 4,
  "overallRating": 5,
  "comment": "Great exchange."
}
```

The booking must be completed, and the current user must be its owner or
borrower. Each participant may submit one review per booking.

Ratings must be integers from 1 to 5. Comments are optional and limited to
500 characters after trimming. The server assigns the review ID, reviewer,
reviewed participant and creation date.

Invalid input returns 400, unknown bookings 404, nonparticipants 403,
and incomplete bookings or duplicate reviews 409.

Reviews remain in the shared in-memory store until the backend restarts.
The existing no-token demo identity fallback remains unchanged.

Frontend integration belongs to Issue #98.

## Account and sign-in routes (#92)

| Method | Endpoint | Purpose |
| --- | --- | --- |
| POST | `/api/auth/signup` | Create an NYU account |
| POST | `/api/auth/verify` | Verify a six-digit demo code |
| POST | `/api/auth/login` | Sign in with email and password |
| GET | `/api/users/me` | Get the signed-in profile |
| PUT | `/api/users/me` | Update display name and campus area |


Signup accepts `{ fullName, email, password }` and returns `{ user, demoCode }`
with status 201. Duplicate emails return 409.

Verification accepts `{ email, code }` and returns `{ user }`.
Login accepts `{ email, password }` and returns `{ user, token }`.
Unverified accounts cannot log in (403); invalid credentials return 401.


Protected requests use `Authorization: Bearer <token>`.
Profile updates accept `{ "displayName": "Student", "campusArea": "Washington Square" }`.

Authentication is simulated for Sprint 2. Verification codes are returned in
signup responses rather than emailed. Accounts and sessions reset on restart.
Existing non-account routes retain the `owner-1` fallback without a token.
This is not production authentication.


## Tests

```sh
npm test
npm run test:coverage
```

Use Mocha and Chai. `createApp({ store })` and
`createMockDataStore({ apiKey, fetchImpl })` allow isolated tests without a real
Mockaroo key. `test/fixtures.js` supplies related example records.

`startTestServer(app)` in `test/helpers/server.js` starts a loopback server on an
available port. It returns `baseUrl` and an async `close()` function. Call
`close()` from the suite's cleanup hook.

The coverage script includes `app.js` and all route files under `routes/`.
