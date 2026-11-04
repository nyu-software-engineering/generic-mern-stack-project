# Map library selection

- Owner: Inoo Jung (`ij2298-oss`)
- Date: October 26, 2026
- Issue: [#110 — Choose a map library](https://github.com/agile-students-fall2026/generic-mern-stack-project-later/issues/110)
- Status: Research complete; proposed decision for peer review. Front-end integration is separate.

## Decision

Use **Leaflet 1.9.4** for Later's Sprint 1 maps, integrated into a React function component through refs and effects. Keep selection, filters, preview cards, and navigation in React. Leaflet handles the map surface and markers.

This is an engineering choice based on our current requirements: two-dimensional city maps, category pins, marker selection, and switching between cities. Leaflet supplies the required map primitives without requiring a map API account. It is provider-independent; the basemap service is a separate decision. The official download page lists 1.9.4 as stable and 2.0.0-alpha.1 as a prerelease. Use the stable version for this sprint. [Leaflet downloads](https://leafletjs.com/download.html), [quick start](https://leafletjs.com/examples/quick-start/).

## Alternatives considered

| Option | Fit for Later | Decision |
| --- | --- | --- |
| Leaflet | Supports interactive 2D maps, custom markers, and click events. The application's existing React state can drive filtering and previews. | Select for Sprint 1. |
| MapLibre GL JS | Provides a capable WebGL map renderer with style/source configuration. Suitable if we later need richer vector-map styling or more complex geographic layers. | For the present mock-place scope, the additional configuration has no demonstrated benefit. Reconsider if requirements change. [Documentation](https://maplibre.org/maplibre-gl-js/docs/). |
| Google Maps JavaScript API | Provides maps and access to separately billed Places services. Requires billing to be enabled and an API key or OAuth token. | Account and billing setup are unnecessary for our current mock-coordinate workflow. This does not decide the separate place-extraction spike. [Usage and billing](https://developers.google.com/maps/documentation/javascript/usage-and-billing). |

No performance benchmark was run; this comparison concerns feature fit and setup requirements.

## React integration choice

Start with Leaflet directly, without imposing a React major version on the scaffold owner. The registry reports Leaflet 1.9.4 under the BSD-2-Clause license and no React peer dependency.

React-Leaflet is an optional wrapper, not a different mapping engine. Its published peer requirements were checked with `npm view`:

| Wrapper | React / React DOM | Leaflet |
| --- | --- | --- |
| `react-leaflet@5.0.0` | `^19.0.0` | `^1.9.0` |
| `react-leaflet@4.2.1` | `^18.0.0` | `^1.9.0` |

The repository does not yet contain a front-end `package.json`. We can revisit the wrapper after #108 establishes the React version; it is not required to use Leaflet. [React-Leaflet installation documentation](https://react-leaflet.js.org/docs/start-installation/).

After the scaffold is available, install inside the actual front-end package:

```sh
npm install --save-exact leaflet@1.9.4
```

Import `leaflet/dist/leaflet.css` and give the map container an explicit height. Initialize the map once using a DOM ref, and call `map.remove()` during effect cleanup. Update marker layers and the viewport in separate effects instead of recreating the map on every render. This also needs verification under React Strict Mode. [React effects](https://react.dev/reference/react/useEffect).

## How it supports the assigned screens

| Issue | Planned implementation |
| --- | --- |
| #87 — City header / map-list toggle | Keep city selection and view mode in React. If the map is retained while hidden, call `invalidateSize()` when it becomes visible. |
| #88 — City map and pins | Use `setView()` for the selected city and one marker per valid mock-place coordinate. |
| #89 — Category pins and preview | Use `DivIcon` markers styled by category. Marker clicks set the selected place ID; render the preview as JSX and navigate through the team's router. |
| #90 — Excitement-sorted list | Sort the shared place data by must-go tally in React; the map library does not own votes or list ordering. |
| #91 — Category filter | Compute one filtered place collection for both views. Update the marker layer when the filter changes. |
| #92 — Map tab | Reuse the map component with all accessible cities' places and a React city switcher. Use `fitBounds()` for a non-empty collection or the city center when empty. |

These are implementation plans, not completed screens. Relevant primitives are documented in the [Leaflet API reference](https://leafletjs.com/reference.html).

Coordinate order matters: Leaflet's coordinate arrays use **latitude, longitude**; GeoJSON uses **longitude, latitude**. Validate coordinates at the data boundary rather than placing missing coordinates at `(0, 0)`. Keep places without coordinates accessible through the list.

## Data and handoff

Coordinate with #109 before implementation. The following are data needs, not a replacement for the team's mock-data schema:

- Stable place ID, city ID, display name, category, latitude, and longitude.
- City ID, city name, and center coordinates for the empty-map state.
- Vote data sufficient to derive the must-go tally and group tally used by #90.
- Categories corresponding to Food, Shopping, and Other, with one normalization step if the shared schema uses different casing.

Keep an adapter between shared data and map props so a schema change does not require rewriting each screen. Obtain all example places from the shared mock layer, rather than embedding place records in a map component. Reuse shared cards, category styles, and router paths from their owners.

Map rendering does not perform geocoding or extract places from social links. That remains separate from this selection and from #32.

## Basemap service and demo reliability

For modest interactive development/demo use, start with OSM's standard raster tiles at `https://tile.openstreetmap.org/{z}/{x}/{y}.png`. This endpoint needs no API key, but it is a shared, best-effort service with no availability guarantee.

- Keep visible `© OpenStreetMap contributors` attribution linked to `https://www.openstreetmap.org/copyright`; cards and bottom navigation must not cover it.
- Preserve the browser's normal Referer and HTTP caching behavior.
- Do not bulk-download, prefetch, or offer offline tile downloads. Automated UI tests should use local tile fixtures instead of requesting the public tile service.
- Keep the tile URL and attribution configurable so we can change providers if usage or reliability needs grow.
- If tiles fail, show an understandable error and keep the place list usable; do not present an empty map as an empty collection.

These limits come from the [OSM tile usage policy](https://operations.osmfoundation.org/policies/tiles/). The renderer being open source does not mean unlimited hosted map service is included.

## Validation and remaining work

Completed for this spike:

- Matched the choice against the current issue descriptions for #87–#92.
- Compared the official Leaflet, MapLibre, and Google Maps documentation.
- Checked the stable Leaflet version, package license, and optional React-Leaflet peer requirements using the registry commands below.
- Identified the scaffold (#108), mock data (#109), shared component (#77), and visual theme (#101) integration points.

```sh
npm view leaflet@1.9.4 version license peerDependencies --json
npm view react-leaflet@5.0.0 peerDependencies --json
npm view react-leaflet@4.2.1 peerDependencies --json
```

No application dependency was installed and no working map UI is claimed by this spike. At reviewed commit `36b0670`, `front-end/` contains only `readme.txt`, so app build and integration tests are not yet available.

Before completing #88/#89/#91/#92, verify city switching, category synchronization between views, marker-to-preview-to-detail navigation, empty/invalid-coordinate cases, map resizing after toggles, mobile touch/keyboard access, visible attribution, and Strict Mode mount/unmount cleanup. Keep this issue awaiting the team's normal review/merge process rather than marking the implementation issues complete.
