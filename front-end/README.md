# DormShare Front-End

React front-end for DormShare, built with [Vite](https://vite.dev/). It currently runs on mock data; the Express back-end is integrated in Sprint 2.

## Prerequisites

- Node.js v20.19 or newer (check with `node -v`)
- npm

## Setup and run

```bash
cd front-end
npm install
npm run dev
```

Open <http://localhost:5173>. A page reading "Front-end health check: OK" means you good.

## Owner listings

Run Express alongside Vite using the [root setup instructions](../README.md#development-setup).
My Listings loads from `GET /api/listings/mine`. The shared listing service uses
POST to create drafts, PUT to edit details, and PATCH to publish or pause items.
The `/listings/new` page opens the same form.

The page shows loading and retry states. Failed writes keep form values and the
previous listing status. Controls are disabled while saving to prevent duplicate
requests. Successful responses update the shared client cache so existing Browse
and booking readers see the changes. Listing images use the local placeholder.
Backend changes stay in memory until Express restarts.
Reloading My Listings replaces the current owner's cached records with the full
API response, including an empty response, while preserving other owners' items.

`npm test` includes listing integration tests against a local Express server.
Install dependencies in both `front-end` and `back-end` before running them.

### Shared API cache pattern

For features whose existing readers still use the shared client cache:

- Use `cacheListing(record)` after a successful write or for each record in a
  filtered API result. A filtered result should not remove unreturned records.
- Use `cacheOwnerListings(records)` for the full `/listings/mine` response. It
  replaces the current owner's records, including an empty result, and preserves
  unrelated owners' items.
- Update the cache only for a successful, current request. Failed or superseded
  requests must leave it unchanged. Both helpers clone records to protect the cache.

Follow the same pattern as other feature APIs replace their local data operations.

## Password recovery

Choose **Forgot password?** on the sign-in page. Request a code using the
registered NYU email, then enter that email and the eight-digit emailed code.
After verification, enter **New password** and **Confirm new password**.
Return to normal sign-in after a successful reset.

The code expires after 15 minutes. Five wrong attempts exhaust it. The password
step expires five minutes after verification. Request a new code if either
step expires or the page reloads. The app keeps recovery secrets only in memory.

Recovery requires the backend's [Brevo configuration](../back-end/README.md#password-recovery-139).
It works with a local app and needs no deployed reset URL. Request and code
pages are public and do not depend on shared mock-data loading.
See the [recovery test guide](../docs/testing/139-account-recovery.md) for
repeatable checks with synthetic data and no inbox.

## Scripts

| Command           | What it does                            |
| ----------------- | --------------------------------------- |
| `npm run dev`     | Start the dev server with hot reloading |
| `npm run build`   | Create a production build in `dist/`    |
| `npm run preview` | Serve the production build locally      |
| `npm run lint`    | Check the code with ESLint              |

## Structure

```text
front-end/
├── public/          
├── src/
│   ├── components/  # reusable UI pieces
│   ├── pages/       # one component per screen
│   ├── assets/      # images and other files
│   ├── App.jsx      # root component
│   ├── main.jsx     # entry point
│   └── index.css    # global styles - we could use tailwind
├── index.html
├── package.json
├── vite.config.js
└── README.md
```

## Owner dashboard

The owner dashboard uses `GET /api/owner/dashboard` through the shared API helper.
Search and status filters are sent to the backend. Summary totals cover all of
the owner's rentals and stay unchanged by filters. Active rentals include items
awaiting an extension decision. Recorded income includes completed rentals only.

The page shows loading and retry states. It preserves selected filters on errors
and ignores older responses after filters change. The last loaded summary stays
visible while results refresh, and stale rental rows are hidden.

Dashboard integration tests run against a local Express server, so install both
frontend and backend dependencies before running `npm test`.
