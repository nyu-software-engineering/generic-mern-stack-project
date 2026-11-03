# CareerHive front end

React function components and JSX, built with Vite. See the main [README](../README.md) for project context. Use Node 24 with npm; the current tooling supports `^20.19.0 || ^22.13.0 || >=24`.

## Run and check

Run inside `front-end/`:

```bash
npm install
npm run dev
```

Open the URL Vite prints (normally http://localhost:5173). The app opens Browse Jobs; `#/jobs` lists opportunities and `#/jobs/<id>` opens the selected listing. Links support browser back/forward. Unknown routes and missing listings have a way back to Browse.

Returning from details restores the loaded Browse list without refetching it, including after retrying a detail request. The list is retained for this mounted app session; reload the page to fetch changed demo fixtures. An active request failure, including an abort, shows a retryable error; requests canceled by navigation cannot replace the current view.

```bash
npm test
npm run lint
npm run build
npm run preview
```

Tests use Node's built-in runner, React/Vite, and the development-only jsdom dependency. They cover rendered content, mounted-component navigation/retry/request races, and the real local mock API. The API tests open an ephemeral localhost port. These checks do not verify visual layout, actual browser tabs, external images, or physical scrolling.

## Mock data and integration

The local Vite plugin in `mocks/jobs-api.mjs` serves `mocks/jobs.json` through read-only `GET /api/jobs` and `GET /api/jobs/:id` endpoints in both dev and preview. The six internship records are fictional, use seeded Picsum images, and link to reserved example.com pages. The app identifies them as demo listings. No API keys, Express server, or live AI are required.

The normal build contains the client app, not the mock server. Static hosting of `dist/` needs a service implementing the same endpoints (or an equivalent mock host); `vite preview` supplies the local fixture API for checking the build.

`src/jobs/api.js` owns requests, validation, and record identity checks. `src/jobs/routes.js` owns the two native hash routes. These are scoped implementations for #60/#65, ready to adapt to the agreed shared data (#44/#46) and main routing/layout (#49); those broader teammate tasks are not completed by this change. No profile, tracker, discussion, or global state contract is asserted here.

`BrowseJobs` accepts `jobs`, `status` (`loading`, `error`, or `ready`), `onRetry`, `getJobHref(id)`, and optional controlled `filters`/`onFiltersChange(nextFilters)` props. Every matching job is reachable. #61 adds job-type, sponsorship, and deadline filtering; entry-level fixtures (#62), search/sort (#63), and location choices (#64) remain separate tasks.

App owns `{ jobTypes: [], sponsorsOnly: false, deadlineDays: null }` so selections survive Details and either Back path without refetching or replacing the original jobs. Empty type selection means all types; selected types combine with OR, while different filter categories combine with AND. Sponsorship-only requires true, excluding false and unknown.

The filter bottom sheet updates the result count and selections live. Show N Results, Close, Escape, or a backdrop click closes it and keeps selections. Chips remove individual filters; Clear all resets filters. The sheet uses native dialog focus containment, restores focus/scroll when closed, and keeps its controls scrollable on smaller screens. Zero filtered matches differs from an empty source feed.

Deadline choices are Any time, Within 7 days, and Within 30 days. Windows use UTC calendar dates from today through today plus the selected days, inclusive; expired, missing, and invalid dates do not match an active window. Any time imposes no date restriction. Tests fix the clock so demo fixture expiry does not change expected results. These rules are recorded in UX-DESIGN.md for team review, not claimed as completed shared-contract agreement.

`JobDetails` accepts the selected `job`, `status`, `onRetry`, and optional `onSaveToTracker`, `onOpenAnalysis`, and `onOpenDiscussion` handlers. The last three controls remain disabled until working handlers from #66/#78/#76 are supplied; they do not fake saves, analysis, or posts. The company-site link opens only an HTTPS URL without embedded credentials, in a new tab with `noopener noreferrer`.

Job records use required string `id`, `title`, `company`, and `location`; optional string `term`, `logoUrl`, ISO `deadline`/`postedAt`, `pay`, `workAuthorization`, `matchSummary`, and `applicationUrl`; a 0–100 or null `matchScore`; true/false/null `sponsorsVisa`; and string arrays `description` and `requirements`. Optional `jobType` is a nonempty string when supplied; current choices are `internship` and `entry-level`. Unknown string types stay readable without an active type restriction. Missing values stay unknown. Map these fields in the API adapter if the agreed shared response differs.

See [INTEGRATION.md](./INTEGRATION.md) for the proposed route/entity/callback/state conventions, current versus planned connections, and owner checklist. HTML control IDs are accessibility links, not job/application identifiers.

## Integration findings for the later merge

Reviewed November 2, 2026, against Tony's published `feat/67/tracker-grouped-preview` at `39b109f`. It contains grouped previews, filtering/sorting/expansion, and basic read-only Application Details. Its source was inspected; its branch was not separately run. The following are integration proposals to confirm with the task owners, not completed shared contracts.

| Work | Finding and next step |
| --- | --- |
| Routes/layout #49 — Abubakar | Both branches replace `src/App.jsx`. Combine the routes so Browse/Job Details and Tracker/Application Details remain reachable. Preserve back/forward and selected record identity; avoid nesting Tracker's current `main.app` inside another main layout. |
| Contracts #44 — Abubakar; shared access/state #46 — Myra | Tony imports independent fixtures from `src/data/mockApplications.js`. They have application IDs but no job reference. Agree on an application `jobId` referring to the shared job `id`, consistent dates/fields, and shared mock access/state. Tracker should consume that state rather than a separate fixed array. |
| Save to Tracker #66 — Tony | Supply a working `onSaveToTracker` handler to Job Details. Saving should update the same application state read by Tracker, including the selected stage, optional note, and history. |
| Analysis #78 — David; discussion #76 — Abubakar | Supply the corresponding detail callbacks when those screens work. Disabled entry controls do not complete these tasks. |

Before teammate approval and merge:

- Reconcile the jobs API adapter and routes with #44/#46/#49; keep #60/#65 open while their acceptance work remains.
- Verify Browse → selected Job Details → Save to Tracker → correct stage preview → Application Details → original job, including both Back paths. This combined flow is not implemented yet.
- Retain the Browse cache and canceled/stale-request protections while integrating; rerun `npm test`, `npm run lint`, and `npm run build` after conflict resolution.

The backend schedule remains separate: [Sprint 2](../instructions-2-back-end.md) adds Express JSON routes and frontend requests/forms; [Sprint 3](../instructions-3-database.md) adds MongoDB Atlas through Mongoose. Keep database credentials in the backend's ignored `.env`; the browser calls the backend rather than connecting to MongoDB.

## Browser verification and remaining acceptance

On November 2, 2026, isolated headless Chromium at 393 × 852 verified all six jobs open with the right identity, return links, browser back/forward, no horizontal overflow, and scrolling to the end of each details screen. The company-site control opened the expected URL in a new tab without an opener; the destination was intercepted for the test. Browse/detail screenshots were inspected and no page errors were captured. Firefox startup was separately confirmed manually. These observations do not verify employer websites or the live prototype.

#61 verification on the same date: 33 tests passed, including fixed-clock filter boundaries, malformed/unknown type responses, combined filter/count/chip/reset behavior, and both filtered Back paths. Chromium at 393 × 852 and 360 × 640 verified the native modal, keyboard focus isolation/restoration, Escape/backdrop closing, scroll restoration, live counts, zero results, reset, and retained selections. Screenshots were inspected. Browser chrome can receive Tab focus normally; background page controls remain unavailable while the modal is open. The fixture clock was fixed for those browser scenarios; production uses the actual date.

Publication verification on November 3, 2026: the pulled master baseline passed 21 tests, and the isolated #61 checkpoint passed 33 tests, lint, and build. Fresh Chromium checks at 393 × 852 and 360 × 640 passed for live counts, chips/reset, native-modal focus/scroll behavior, zero matches, and both Back paths; screenshots were inspected without page errors or horizontal overflow. Date-dependent browser scenarios used a fixed November 2 clock. This branch retains the six-record feed; #62–#64 are separate local work. The baseline proposal and integration inventory are included for team review, without claiming shared-contract approval.

- Check the new filter behavior in Firefox and on a physical mobile device; check Picsum failure behavior and keyboard focus across the other screen families.
- Check loading/error/retry/empty/missing-record presentation in a real browser; automated DOM tests already cover the state logic.
- Compare the screens with the live prototype and check a physical mobile device; document any agreed design differences.
- Complete the combined-flow checks above and obtain teammate review.
