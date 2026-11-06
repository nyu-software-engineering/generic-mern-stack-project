# Later front-end

## Local setup

From this directory, use Node.js 24 LTS and run:

```sh
npm install
npm run dev
```

Open the local URL printed by Vite. Try the saved places at `/city/c_paris`,
the city map at `/city/c_paris?view=map`, or the combined map at `/map`.

```sh
npm test       # City header, map/filter routing and mock-data ranking tests
npm run lint
npm run build
```

## City header (#87)

- The city name, place count, and member avatars are loaded from
  `src/data/mockDataLayer.js`, which derives header data from `demoData.js`. No
  backend is required.
- Clicking the avatars opens `/city/:cityId/members`, the existing route for the
  members screen.
- List/Map buttons update the `view` query parameter, keeping the city and other
  parameters intact. Reloads and browser Back/Forward preserve the selection.
- Map and List render the same saved places and retain the selected category
  when switching views.
- `CityHeader` takes a `city` object with `id`, `name`,
  `placeCount`, and `members` (`id`, `name`, optional `photoUrl`), plus controlled
  `view` and `onViewChange` props. The UI does not own the mock records.
- Unknown city IDs show a not-found message; failed requests provide a retry.

## Ranked city data (#90)

`getRankedCityPlaces(cityId)` in `src/data/mockDataLayer.js` joins the shared
saved places, places, and votes. It returns each saved place with `savedPlaceId`
and a `tally` object containing `must-go`, `down`, and `pass` counts from list
members. Results sort by descending must-go count, then alphabetically by name.
Places without votes remain in the list; missing/empty lists return `[]`.
Like city headers, this selector assumes one demo list per city.

`RankedCityList` renders these results in CityPage. Category filtering preserves
their ranking order.

## Maps and category filters (#88, #89, #91, #92)

- `PlaceMap` uses Leaflet 1.9.4 to show the shared saved-place coordinates,
  fitting the visible pins into view. Category colors match the filter chips.
  Click a pin (or focus it and press Enter) to open a preview with votes and a
  link to the existing place detail route.
- CityPage uses `view=map` and `category=food` query parameters. MapTab uses
  `city=c_paris` and the same category parameter. Reload and browser navigation
  preserve those choices; invalid categories fall back to All.
- MapTab includes joined city lists only. The default demo user starts with
  Paris. Accept the New York invitation at `/invites`, then use the Map tab to
  try All cities and the city switcher. Demo changes reset on page reload.
- All place, city, category and vote records come through `mockDataLayer.js`;
  no backend, API key, geocoding or separate place fixtures are required.
- Empty filters can be reset. Places without valid coordinates keep a detail
  link, and tile failures show a retry while pins remain interactive.

The map background downloads public OpenStreetMap raster tiles, so it needs an
internet connection. Attribution remains visible on the map. This is for the
course demo; review the [tile usage policy](https://operations.osmfoundation.org/policies/tiles/)
and choose an appropriate provider before a wider deployment. A provider can
be configured with Vite's `VITE_MAP_TILE_URL` and `VITE_MAP_ATTRIBUTION` variables
(both are public browser configuration, not secrets).

`Maps.test.jsx` covers marker previews and detail navigation, shared map/list
filters, city switching, pending invitations, missing coordinates, empty states
and retry behavior using real Leaflet DOM in JSDOM. Tests do not download tiles.

## Vite template notes

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
