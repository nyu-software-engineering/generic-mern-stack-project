# Worn front-end

React app built with Vite, Tailwind CSS, and React Router.

## Run locally

Requires Node.js 20 or newer.

```bash
cd front-end
npm install
npm run dev
```

Open the URL Vite prints (usually http://localhost:5173).

## Other scripts

- `npm run build`: production build into `dist/`
- `npm run preview`: serve the production build
- `npm run lint`: lint with oxlint

## Folder structure

```
src/
  components/   reusable UI components (Button, Card, ...)
  context/      React Context providers for shared state
  data/         mock data used until the back-end exists
  layouts/      route layouts (app shell with tab bar)
  pages/        one component per screen
  services/     functions the screens call to read and change data
  utils/        pure helper functions (cost-per-wear math, formatting)
```
