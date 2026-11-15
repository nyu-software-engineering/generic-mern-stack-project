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
