# Frontend connections and identity contract

Historical inventory from November 2, 2026: at that checkpoint only Browse/Job Details and the read-only jobs API were implemented on David's branch. The original proposals below do not claim team agreement. The November 4 match/session contract at the end describes the current integration.

November 3, #78 milestone A: `JobMatch` is a controlled summary/native-popup component, optionally composed by `JobDetails` through `matchResource`, `onMatchRetry`, and `onCompleteProfile`. At that checkpoint App had no match provider and kept analysis disabled. The shared controller and saved-profile integration are now implemented as described in the November 4 contract below; teammate acceptance remains required.

## Single demo profile — product direction, November 3

David confirmed one shared current demo profile for Sprint 1. Profile display/edit, Home recommendations and every job's match analysis must refer to the same saved frontend profile. Initialize it from the agreed mock-data source and share its state through #46; do not create separate per-page or per-job profiles or a demo account switcher.

Save in #59 updates that same profile and its consumers; Cancel discards the draft. Test labels profile A/B mean before/after saved snapshots of this one user, not different users. Job-specific mock responses can differ because job requirements differ, but they must all correspond to the current saved snapshot. No real backend, database or live model is required. This product direction does not specify a scoring algorithm or approve a new profile schema; the saved-profile export, response mapping, completeness and refresh/reset behavior still need alignment with #44/#46/#59.

## Controlled match boundary (#78 milestone A)

The ready UI resource is `{ status: 'ready', data: { jobId, score, summary, fitExplanation, missingSkills, keyQualifications } }`. The selected job supplies `id`, `title`, and `company`. The presentation refuses `data.jobId !== job.id`; `score` is a finite 0–100 number or null, and collections contain plain strings. Loading/error/incomplete-profile resources hide all previous match content, including in an already open dialog. Non-ready resources may carry a plain-text `message`. Missing callbacks do not create recovery/navigation controls.

`JobMatch` accepts `onRetry` and `onCompleteProfile`; `JobDetails` maps `onMatchRetry` to the former and passes the latter through. The caller binds job identity and navigation. Same-job resource changes keep an open dialog visible with current content; changed job identity or unmount closes it and restores the previous overflow/focus when possible. This local state is independent of routes, fetching, and profile ownership. No-resource JobDetails callers retain the legacy `onOpenAnalysis` behavior.

This presentation boundary stays independent of the server endpoint and profile schema. The November 4 controller now binds job and saved-profile request identity, cancels/ignores stale requests and supplies Retry/Complete profile actions. Its mounted integration tests complement the component-only prop tests. The remaining route/screen ownership checklist below still requires teammate acceptance where those features are not implemented.

## Identity: data IDs are different from HTML IDs

| Item | Rule and connection |
| --- | --- |
| Job | Keep the existing nonempty string `job.id` stable across Browse, Home recommendations, Job Details, saved applications, discussions, deadlines, and match responses. Existing example: `brightspace-software-intern`. Do not derive identity from a card index, title, or company. |
| Application | Have its own stable `application.id`, plus `application.jobId === job.id`. Stage, note, and history belong to the application, not to a second copy of the job. Tony's current application fixtures have their own numeric IDs but no jobId; agree the adapter/string-ID migration with him rather than renaming published records without coordination. |
| Profile | One shared current profile, with a stable profile ID if records need it. Home recommendations and match responses use the same profile; saving edits updates consumers, cancel does not. |
| Discussion/post | Relate the discussion/post to `jobId`; give each post its own stable ID. Topic selection, anonymity, and creation time are fields, not parts of a button ID. |
| Match response | Identify the job and profile/revision it describes so stale analysis cannot appear for another selected job or an older saved profile. A live model is unnecessary in Sprint 1. |
| React list key | Use the entity's stable ID. An application's key is its application ID; a job card uses the job ID. |
| Page | Use a route/component name; do not invent stored page IDs or one separate route for every loading/error/overlay variant. |
| Button/field | Actions use props/callbacks bound to the selected entity. HTML IDs associate labels/headings/errors with controls; use unique component-local IDs for repeated controls. Business state must not depend on DOM IDs. Prefer role/name-based browser tests; add a test identifier only when semantic selection is insufficient. |

IDs need uniqueness within the relevant entity collection; they do not need one global numbering scheme shared by buttons, jobs, pages, and applications. Keep existing job IDs unchanged while contracts are aligned.

## Route inventory for #49

Use one route builder/parser convention. Current native hash routes are `#/jobs` and `#/jobs/<encoded-job-id>`; getJobHref and parseJobRoute own them. The following additional paths are proposals to confirm with the routing owner:

| Screen | Proposed path/context | Connection |
| --- | --- | --- |
| Welcome/account | `#/welcome`, `#/login`, `#/signup` | Account forms lead to the agreed Home/Profile Setup flow. |
| Profile Setup | `#/profile/setup` | Save the same profile later shown in My Profile. |
| Home | `#/home` | Recommendation links carry job IDs; stage tiles carry the selected stage; deadlines carry application IDs. |
| Browse | `#/jobs` (implemented) | Keep selections when returning from details. Reload/reset semantics must be explicit. |
| Job Details | `#/jobs/:jobId` (implemented) | Load the requested ID; missing records have a way back. |
| Job discussion | `#/jobs/:jobId/discussion` | Preserve job identity when opening/closing discussion or New Post. |
| Tracker | `#/tracker` | Accept an optional stage preset from Home through the agreed routing API; do not invent a second tracker store. |
| Application Details | `#/applications/:applicationId` | Resolve the application first, then its jobId; link back to that job and Tracker. |
| Deadlines | `#/deadlines` | Read application/job state and open the selected application. |
| Profile/edit | `#/profile`, `#/profile/edit` | Save/cancel updates or restores the same profile. |

Filters, Save to Tracker, match analysis, update-stage/remove confirmations, and photo dialogs normally remain state owned by their parent view, preserving its record/context. Do not add these proposed routes to David's two-route parser as part of #61. Encode/decode ID segments exactly once; verify direct links, missing IDs, browser Back/Forward, and parent-page return behavior during integration.

## Data and action conventions to agree in #44/#46

- Keep frontend records behind the mock access boundary. `GET /api/jobs` currently returns an array; `GET /api/jobs/:id` returns the matching record or JSON 404. That API is read-only; application/profile/post writes still require the shared frontend mock/state implementation.
- Existing job fields and optional values are documented in [README](./README.md#mock-data-and-integration). Proposed type options are `internship` and `entry-level`; unknown nonempty string types remain readable even when they do not match a chosen option.
- Sponsorship is true/false/null. A zero match score is real; null means unknown. Do not convert unknown values into false/zero.
- Use ISO calendar dates for deadline/posting-date fields and an agreed ISO timestamp convention for action history/posts. Use one reviewed timezone/calendar rule; date-only labels must not shift by one day when rendered. Tests control time for date-dependent cases.
- Preserve the stage vocabulary Saved, Preparing, Applied, Interview, Offer, Rejected. Stage changes are single-choice and add a dated history entry; totals/deadlines read the same application state.
- Callback contracts carry entity IDs and values, not DOM elements. The parent binds selected identity. For example, Save uses a job ID and selected stage/note; stage/notes/removal use application IDs; New Post uses a job ID. The current optional JobDetails click callbacks need that binding when #66/#76/#78 are integrated.
- #61's implemented boundary will be `filters` plus `onFiltersChange(nextFilters)`, with `{ jobTypes: [], sponsorsOnly: false, deadlineDays: null }`. It stores no derived result array. #63 adds query/sort separately; #64 extends filters with locations. Clear all resets filter selections; search and sort have separate controls.
- Keep loaded jobs separate from derived filters. Route changes cancel stale requests; failures expose retry. Define what survives navigation and what resets on reload. Do not create unrelated per-page copies of mutable applications/profile/posts.

## Shared structure and visual rules

One app shell/header/main landmark belongs to #49. Pages supply their content and one page title; avoid nested main.app containers or a new CareerHive header per page. Use the same system font, white/charcoal/honey palette, type roles, spacing, button/field/chip styles, modal focus/scroll rules, and state presentation. Existing Browse/Details supply the starting style; global menu/layout integration is still pending.

Source proposal: [shared baseline](../docs/superpowers/plans/2026-11-02-frontend-baseline.md). These are reusable values and a small set of shared roles, not a requirement for a large component library. Approved prototype changes belong in UX-DESIGN.md and the demo explanation.

## Owners and acceptance checklist

| Owner/task | Alignment needed |
| --- | --- |
| Abubakar #44/#49 | Confirm response shapes and routes, shell/header, navigation presets, and direct/back navigation. |
| Myra #46/#59 | Provide common mock access/state, profile save/cancel, and consumer update behavior. |
| Tony #66–#72 | Link applications to job IDs; wire save/stage/notes/removal to shared state and correct detail routes. |
| Abubakar #76/#77 | Keep discussion/post creation tied to the selected job and shared topic/post data. |
| David #60–#65/#78 | Preserve job identity, combine Browse controls, connect detail callbacks, and render match data for the selected job/profile. |

- [ ] Confirm the contract with the owners in the shared team workflow; record differences rather than treating this proposal as already agreed.
- [ ] Trace Browse → Job Details → Save → Tracker → Application Details → original job, including all Back paths and no duplicate save.
- [ ] Change stage/note/remove and verify Tracker, Home totals, and Deadlines agree without reload.
- [ ] Save/cancel profile edits and verify Profile/Home/match response behavior uses the right revision.
- [ ] Create/filter a discussion post and verify it stays with the correct job.
- [ ] Inspect common shell/styles and long/error/empty/overlay states across all integrated screen families; run tests/lint/build and mobile browser checks after conflict resolution.

This checklist is broader than #61; implementing its filter panel does not complete these owners' tasks.

## November 4 match/session integration contract

`useAppState` is now imported from `src/data/useAppState.js`; the provider remains the default export of `AppState.jsx`. Keep one provider above routes. `matchFor(jobId, { signal })` is bound to the current saved profile and returns a controlled resource; the App controller also rejects obsolete job/profile/retry completions. `getMatch(jobId, profile, { signal })` posts `{ profile }` to `/api/matches/:jobId` and validates job/profile/revision plus all analysis fields. The local Vite host implements that POST with deterministic skill weights from `mocks/matches.json`. All nine demo listings have explicit match fixtures. Unknown job IDs remain errors; the host does not fabricate a fallback match.

Profile Save creates a new revision; Cancel leaves saved state unchanged. Log Out resets the shared profile/applications/posts and App-owned Browse controls/cache, then navigates Welcome. Mock account registration still lasts until server restart. Menu receives `onClose` and `onLogOut`; its native dialog owns modal/scroll/focus cleanup, while App owns the logout reset. Home, Discussions, Save to Tracker and pending teammate PR integrations remain separate work.
