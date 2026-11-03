# Browse Filter Panel (#61) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `executing-plans` to implement this plan task-by-task after David approves it. Use checkbox steps for tracking. David authorized local #61 implementation on November 2. David authorized committing/pushing #61 on November 3; the user creates the PR.

**Publication scope — November 3:** #60/#65 foundation merged through PR #84. This branch publishes the saved #61-only checkpoint, plus this plan and the proposed baseline. Fresh 33-test/lint/build and Chromium checks passed on November 3. #62–#64 stay separate; no team-wide contract approval is claimed.

**Goal:** Make the designed Browse filter sheet, result count, chips, and reset behavior work with the existing jobs feed.

**Architecture:** Keep the original fetched jobs in App and derive filtered results without mutating that array. App owns the filter selections so leaving Browse for Job Details does not discard them; the sheet owns only its open/closed state. A small pure filtering module supports this task and later #62–#64 without adding a global store.

**Tech Stack:** Existing React function components/JSX, Vite, CSS, Node tests, React/Vite/jsdom. No new dependency.

## Global constraints

- Follow the [proposed shared visual/structural baseline](./2026-11-02-frontend-baseline.md) after David/team review. Reuse its shell, typography, spacing, controls, state, and overlay rules; coordinate global shell adoption through #49.

- David approved local #61 implementation on November 2. Shared contract/global-layout team agreement remains pending; commit/push for #61 authorized November 3; issue/board changes remain separately controlled.
- Follow CONTRIBUTING.md: `<type>/<issue-number>/<short-description>`; short single-line commits only when authorized; teammate review before merge. David creates PRs.
- Use Node 24; run commands inside `front-end/` unless noted otherwise.
- Use the current mock API. Keep future server records outside UI components; do not add Express, MongoDB, live AI, Redux, or another UI framework.
- Preserve `.gitignore` edits, course infrastructure, existing jobs, API validation, and cancellation/cache behavior.
- Sources: [issue #61](https://github.com/agile-students-fall2026/generic-mern-stack-project-careerhive/issues/61), [UX design](../../../UX-DESIGN.md#finding-jobs), saved drawing pages `09-browse-jobs` and `10-browse-jobs-filters`.

## Proposed behavior for David's review

- Start with no active filters, showing all returned records. The existing six records already have `jobType: "internship"`.
- Job type uses checkboxes: Internship and Full-time entry-level. Proposed values are `internship` and `entry-level`. Empty selection means both/all types; selected types combine with OR.
- Sponsorship is the designed checkbox: only records with `sponsorsVisa === true` pass when enabled. False and unknown remain distinct; unknown is not sponsorship.
- Deadline uses a native select: Any time, Within 7 days, Within 30 days. These exact extra choices are proposed because the saved drawing shows only Any time.
- A deadline window includes today through today plus N days, inclusive, using UTC calendar dates to match existing date presentation. Expired, missing, and invalid dates fail an active window; Any time imposes no deadline restriction.
- Different filter categories combine with AND. Selections take effect immediately; the Show N Results button closes the sheet. Backdrop, close button, and Escape also close it without undoing selections. This live behavior avoids a second draft/apply state and needs review.
- Show one removable chip per selected type, plus sponsorship/deadline chips. Clear all resets filters. After #63, it will leave search and sorting alone; clearing a search field is a separate action.
- Distinguish an empty source feed from zero filtered matches. Zero matches shows a count of 0 and a reset action, without fabricated jobs.
- Do not build location controls in #61 or show a nonfunctional location input; #64 adds them. Record the temporary design difference in the frontend README.

These are local feature choices to confirm through #44/#46 before merge, not assertions of an existing team-wide data contract.

## Files and interfaces

| File | Responsibility |
| --- | --- |
| Modify `front-end/src/index.css`, `front-end/src/pages/BrowseJobs.css`, and `front-end/src/pages/JobDetails.css` | Add the small reviewed shared style values and page-title role; retain each page's content layout. |
| Modify `front-end/src/App.jsx` | Own `browseFilters`; pass selections and updates to Browse without changing request effects. |
| Modify `front-end/src/pages/BrowseJobs.jsx` | Derive visible jobs, count, chips, filter trigger, and distinct empty states. Retain existing loading/error behavior and card links. |
| Create `front-end/src/pages/JobFilters.jsx` and `JobFilters.css` | Accessible bottom sheet and its controls, using the existing visual style. |
| Create `front-end/src/jobs/browse.js` | Pure `filterJobs(jobs, filters, todayISO)` helper. |
| Modify `front-end/src/jobs/api.js` | Validate optional `jobType` when present; missing/null stays unknown for older response shapes. |
| Create `front-end/tests/browse-options.test.mjs` | Pure filter boundary/combination tests. |
| Modify `front-end/tests/jobs-flow.test.mjs`, `browse-jobs.test.mjs`, `jobs-service.test.mjs` | Interaction, navigation persistence, static presentation, and malformed job-type regression coverage. |
| Modify `front-end/README.md` | Document controls, provisional fields, reset behavior, and remaining integration. |
| Modify `UX-DESIGN.md` when an agreed design change is implemented | Record approved prototype differences; explain them at the demo. The README remains the operating guide. |

Proposed initial filter shape:

```js
{ jobTypes: [], sponsorsOnly: false, deadlineDays: null }
```

`filterJobs(jobs, filters, todayISO)` returns a new array in input order and never mutates the records. `todayISO` is a `YYYY-MM-DD` date; tests supply it explicitly. Missing/unrecognized job types remain visible with no type selection but do not match an explicit supported type. Validate a supplied type as a nonempty string, preserving unknown strings from future shared responses. Reject non-string/blank values; do not reject the whole feed merely because a valid string is outside the two current filter options.

Browse's existing props stay valid. Add optional `filters` and `onFiltersChange(nextFilters)` props, defaulting to the unfiltered state for static consumers. `JobFilters` receives `filters`, `onFiltersChange`, `resultCount`, and `onClose`; its controls update immutable selections.

## Execution steps after approval

### Task 1: Establish the base and test the filtering rules

- [x] Confirm the latest Browse implementation is present before editing. Proposed branch: `feat/61/browse-filter-panel`, created from refreshed master.
- [x] If #60/#65 have not merged, bring `origin/feat/60/browse-jobs` into the new issue branch and label the local handoff as dependent work; its PR diff includes that dependency until master receives it. Do not reset or rewrite the published parent branch. Creating merge commits still requires commit authorization.
- [x] After baseline approval, apply the bounded shared-style step to current Browse/Details and the new sheet: shared values, page-title size, spacing, field/button/chip rules. Coordinate the final global header/shell with #49; do not recreate it in every page. Inspect before/after screenshots.
- [x] Add pure tests with today fixed at `2026-11-02`: no filters; type OR; category AND; true/false/null sponsorship; deadlines on November 1, 2, 9, and 10; missing/invalid dates (including impossible rollover dates such as 2026-02-31); zero results; unchanged input order and data.
- [x] First run `node --test tests/browse-options.test.mjs`; confirm failure because the filtering helper is absent.
- [x] Implement the helper: apply the selected type predicate, strict sponsorship predicate, and inclusive date-range predicate. Treat date-only values as UTC calendar dates; reject malformed window dates rather than allowing Date rollover.
- [x] Extend optional job-type validation and test an unknown string type that stays loadable, rejected object/blank types, and legacy records with no type.
- [x] Rerun the focused tests and confirm each expected list of job IDs. The current six internship fixtures must still load through the real mock API.

Concrete first regression assertion to include in the focused tests:

```js
const jobs = [
  { id: 'a', jobType: 'internship', sponsorsVisa: true, deadline: '2026-11-09' },
  { id: 'b', jobType: 'internship', sponsorsVisa: null, deadline: '2026-11-09' },
  { id: 'c', jobType: 'entry-level', sponsorsVisa: true, deadline: '2026-11-10' },
]
assert.deepEqual(filterJobs(jobs, {
  jobTypes: ['internship'], sponsorsOnly: true, deadlineDays: 7,
}, '2026-11-02').map(job => job.id), ['a'])
```

### Task 2: Connect the sheet, chips, and preserved selections

- [x] Freeze the DOM test clock at November 2, 2026 and restore it after each scenario; use a controlled browser clock for deadline-boundary checks. Do not make tests depend on the wall clock or on fixtures still being in the future.
- [x] Add mounted tests: open sheet; choose a filter; see updated count; close via results button; remove one chip; Clear all; reopen; zero-match reset; Details → both Back paths retains selections and the loaded list.
- [x] Confirm the new tests fail for missing controls/behavior before implementing them.
- [x] Add the App-owned state and immutable update callback. Derive the list and count from source jobs during rendering; never replace the fetched resource with filtered data.
- [x] Build a native `dialog` styled as a bottom sheet: labelled heading, close button, fieldsets/legends, real checkboxes/select, Escape/backdrop handling, initial focus, return focus, and background scroll locking. Provide minimal test-only dialog method stubs if jsdom lacks them; verify actual focus behavior in Chromium rather than trusting those stubs.
- [x] Render live chips, count, and reset behavior. Keep controls out of the loading/error branches and preserve the source-empty message separately from no matches.
- [x] Ensure Show N Results remains usable for zero results and closes the sheet; no unreachable controls at 393 × 852.
- [x] Pass the new flow tests, all existing return-navigation tests, and the pure tests.

### Task 3: Verify and prepare handoff

- [x] Run `npm test`, `npm run lint`, `npm run build`; all must exit 0. Existing 21 tests must remain passing alongside the new tests.
- [x] In Chromium at 393 × 852 and 360 × 640, check sheet scroll, backdrop/Escape, focus containment/restoration, chip removal, zero results, correct detail identity, and both Back paths. Inspect screenshots.
- [x] Record agreed changes to initial selections, live filtering/close semantics, deadline choices, and title/style roles in UX-DESIGN.md. Update the README with the actual behavior and unresolved shared-field alignment. Run root `git diff --check` and `python3 .local-harness/verify_wireframes.py`.
- [x] Prepare the diff and verification handoff for David. No commit/push made; suggested single-line message: `add browse filters and applied chips`.

## Estimate and completion gate

**3.5–6.5 focused hours**, including the bounded baseline pass (0.5–1.5 hours), tests, and mobile sheet/focus checks. Review waiting and shared integration are additional.

Each #61 checklist item maps to Tasks 1–3 above. This task can be built without another teammate's screen, but completion for merge still requires the shared field/API agreement and review. Missing UX result states in the older prototype are not permission to omit working frontend behavior.

## Local implementation result — November 2, 2026

Implemented on `feat/61/browse-filter-panel`, based on pushed Browse prerequisite `0ab0629` via a fast-forward from refreshed master; no new commit or push. The original 21 tests passed first. New filtering/type tests failed for missing behavior, and five new mounted scenarios failed because Filters was absent; all 33 tests now pass. Lint/build passed. Mobile Chromium checks and screenshot inspection covered both viewport sizes, native focus/scroll behavior, Escape/backdrop, counts/chips/reset, and both Back paths. Native focus may move to browser chrome; underlying page controls remain inert.

The global identity/route/callback/state inventory is in `front-end/INTEGRATION.md` and is explicitly proposed for #44/#46/#49 owners. README and UX-DESIGN notes record the actual scope and temporary location omission. Remaining: Firefox/physical-device verification, wider shared-contract/layout adoption, and teammate review. These are not marked complete by the local checks.

- [ ] Verify the new filters in Firefox and on a physical device.
- [ ] Confirm shared data/route/design choices with the owners before merge.
- [ ] Commit/push only when David authorizes publication.
