# Later front-end

## Local setup

From this directory, use Node.js 24 LTS and run:

```sh
npm install
npm run dev
```

Open the local URL printed by Vite. The scaffold currently contains placeholder
pages; the city header can be tried directly at `/city/c_nyc` or `/city/c_paris`.

```sh
npm test       # City header interactions/routing and mock-data ranking tests
npm run lint
npm run build
```

## City header (#87)

- The city name, place count, and member avatars are loaded from
  `src/data/mockDataLayer.js`, which derives header data from `demoData.js`. No
  backend is required.
- Clicking the avatars opens `/city/:cityId/members`, the existing route for the
  members screen. That screen is still a placeholder on `master`.
- List/Map buttons update the `view` query parameter, keeping the city and other
  parameters intact. Reloads and browser Back/Forward preserve the selection.
- The map/list content containers are placeholders for #88 (map pins) and #90
  (ranked places). This change implements the header and switching only.
- `CityHeader` takes a `city` object with `id`, `name`,
  `placeCount`, and `members` (`id`, `name`, optional `photoUrl`), plus controlled
  `view` and `onViewChange` props. The UI does not own the mock records.
- Unknown city IDs show a not-found message; failed requests provide a retry.

## Ranked city data (#90, first slice)

`getRankedCityPlaces(cityId)` in `src/data/mockDataLayer.js` joins the shared
saved places, places, and votes. It returns each saved place with `savedPlaceId`
and a `tally` object containing `must-go`, `down`, and `pass` counts from list
members. Results sort by descending must-go count, then alphabetically by name.
Places without votes remain in the list; missing/empty lists return `[]`.
Like city headers, this selector assumes one demo list per city.

This is the data foundation only. The ranked cards and CityPage integration are
still pending, so #90 remains open.

## Vite template notes

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
