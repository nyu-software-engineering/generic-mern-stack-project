# Doin — Front-End

The Doin mobile web app front-end: React + Vite, React Router for navigation, Tailwind CSS for styling.

## Prerequisites

- Node.js 22.22 or newer (React Router 8.5 requires Node 22.22+, React 19.2.7+, Vite 7+)
- npm

## Setup

From this directory (front-end/):

    npm install

## Run locally

    npm run dev

Then open the local URL Vite prints (default http://localhost:5173).

## Build for production

    npm run build

## Notes

- All components are functional components written in JSX.
- Routing uses React Router (installed; routes are wired up in src/App.jsx as screens are built).
- Styling uses Tailwind CSS v4 through the Vite plugin (configured in vite.config.js; src/index.css imports Tailwind).
