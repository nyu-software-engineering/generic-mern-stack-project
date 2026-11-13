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
  reviews, item requests, and Quick Borrow requests for #89.
- Failed data loads return safe JSON errors. A missing key returns 503. An
  upstream failure or invalid response returns 502. A later request can retry.

The current frontend still uses its existing Mockaroo proxy until #89 switches it.
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

The existing coverage script still includes only `app.js`. #90 will extend it.
To measure the new backend modules before that change lands, run:

```sh
npm exec -- c8 --all --include app.js --include 'routes/**' --include 'middleware/**' --include 'services/**' --reporter=text mocha 'test/**/*.test.js'
```
