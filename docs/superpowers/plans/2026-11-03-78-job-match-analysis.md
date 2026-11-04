# Job Match Summary and Analysis (#78) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `executing-plans` after David approves implementation; use checkbox steps and review checkpoints. Milestone A (Tasks 1–2) is approved for independent UI implementation. Milestone B remains unapproved pending the meeting contract. David authorized committing and pushing milestone A on November 3. He creates PRs; milestone B, issue changes and merging remain separately controlled.

**Goal:** Show an honest profile-aware match summary and working full-analysis popup for the selected job, using mock responses and the shared UI baseline.

**Architecture:** Build a controlled match component independently of the profile store. Job Details supplies the selected job; the match component receives a resource and action callbacks. A later integration step connects the agreed shared saved-profile/mock access, updates summary and popup from the same response, and cancels stale work when the job or saved profile changes. Do not create another profile store or change unrelated Browse state.

**Tech Stack:** Existing React function components/JSX, Vite, plain CSS, Node tests, jsdom and real-browser verification. Node 24 is the tested default. No new dependency, Express, database, live AI, scoring algorithm or global state library.

**Product direction confirmed by David — November 3:** Use one shared current demo profile across the system. Every manufactured job's analysis uses that same saved profile; results can vary by job. Save updates the one profile, Cancel preserves it, and profile A/B tests mean saved revisions of the same user. This clarification does not authorize milestone B or a scoring algorithm; align the shared state/access details with Myra first.

## Review summary

| Milestone | David can do independently | What completion means |
| --- | --- | --- |
| A: controlled UI | Popup, summary, supplied success/loading/error/incomplete states, local open/close/retry callbacks and tests | Component behavior verified with supplied fixtures; shared profile integration still absent. |
| B: shared integration | Consume the agreed #46/#59 interface and connect Job Details | Save changes the applicable mock result, Cancel does not; real selected-job flow works. |

**Execution status — November 3:** David approved milestone A; its controlled UI is implemented locally on `feat/78/job-match-analysis` at `/private/tmp/careerhive-worktrees/78`. The final 63-test suite, lint/build, and controlled Chromium/Firefox checks passed, including recovered and still-unavailable close/focus regressions; native evidence is recorded in the README. Independent task/final reviews passed and the local handoff is complete. David subsequently authorized publication of milestone A on November 3; milestone B remains pending and #78 is not complete as a whole.

**Original approval proposal:** Approve milestone A first. Confirm milestone B's profile/mock boundary at the meeting, update the binding details in this plan, and then approve its execution. Finishing A alone does not complete #78. The ordinary app keeps its existing disabled analysis control until a working match provider is connected; component/browser review uses an isolated controlled harness in the interim.

## Global constraints and sources

- [#78](https://github.com/agile-students-fall2026/generic-mern-stack-project-careerhive/issues/78) requires the selected job/current profile response, summary and full explanation, missing skills, qualifications, AI notice, return to the same job, incomplete/error states, and saved-profile propagation.
- [#59](https://github.com/agile-students-fall2026/generic-mern-stack-project-careerhive/issues/59), owned by Myra, supplies committed profile edits, Cancel behavior, and navigation persistence. #46 supplies shared mock access/state; Abubakar's #44 coordinates response shapes and #49 coordinates navigation/layout.
- Follow [CONTRIBUTING](../../../CONTRIBUTING.md), [frontend assignment](../../../instructions-1-front-end.md), [UX design](../../../UX-DESIGN.md#finding-jobs), and the [baseline proposal](./2026-11-02-frontend-baseline.md).
- The saved AI analysis drawing is `ux-design/wireframes-13-job-details-ai-match.drawio.png`: centered square popup, Close, score, fit reasons, missing-skill chips, qualifications, AI notice and Got It. This plan preserves that content hierarchy; it does not copy the phone bezel or fixed drawing height into the web app.
- Reuse existing CSS variables, 16px body text, 24px page titles, 18px section headings, 4/8/12/16/24/32px spacing, square corners, 44px targets, visible focus and a centered maximum-width layout. Wider team adoption remains proposed rather than assumed approved.
- Use native `dialog.showModal()` and the proven focus/overflow cleanup pattern in `JobFilters.jsx`. Analysis is a centered popup with independently scrollable content. Do not refactor Filters or introduce a general modal framework for this task.
- Preserve source job IDs, job request validation, Browse caching/filter/query/sort state and both Back paths. An analysis overlay is not a new stored page ID or route.
- Use `feat/78/job-match-analysis` in an isolated worktree after approval. Refresh master then; if #86 is not merged, explicitly carry its #61 baseline prerequisite or wait for it. Do not pull #62–#64's cumulative uncommitted work into this branch.
- Keep AGENTS.md, `.local-harness/`, generated browser evidence and unrelated `.gitignore` changes out of Git. No course infrastructure edits. Commit/push needs separate authorization; David creates PRs.

## UI behavior proposed for review

1. A supplied ready response drives both the Job Details summary and full analysis. The popup includes the selected title/company to keep its identity clear.
2. Close, Got It and Escape dismiss the popup, restore focus to See full analysis when still mounted, and preserve the underlying job and scroll position. Backdrop clicks leave this popup open; no form changes or implicit navigation occur.
3. The popup fits 393 × 852 and 360 × 640 with 16px outer clearance where space permits; header/close and footer/Got It stay reachable while long content scrolls. Larger text and a wide desktop must not clip content or create horizontal scrolling.
4. A score of 0 is displayed as 0%; an unknown score is “Match not available.” No progress animation or fabricated percentage.
5. Use “Why it could be a good fit,” “Skills you may be missing,” and “Key qualifications.” Empty supplied lists use truthful fallback copy such as “No missing skills listed,” not a claim that the user meets every requirement.
6. Proposed notice: “AI-generated summary. Check the full listing before applying.” The existing Demo context and documentation must clearly explain that Sprint 1 match responses are fixtures, not live model output.
7. Loading shows a visible status without an older score. Errors show an alert and a working Retry action when supplied. An incomplete profile explains that profile information is needed; Complete profile appears only with a working navigation callback. The final integrated flow must provide that callback.
8. No modal appears for a job that has been left. A late result from a previous job or saved profile cannot replace the current summary/analysis.

## Internal response proposal — confirm before milestone B

This is a small **component boundary**, not a unilateral replacement for Myra's schema or a new required backend endpoint. Adapt agreed shared responses into it in one place. Profile IDs/revision fields are not mandated here; agree how the shared saved snapshot changes on Save.

```js
const readyResource = {
  status: 'ready',
  data: {
    jobId: 'brightspace-software-intern',
    score: 92,
    summary: 'Your demo profile matches the listed JavaScript skills.',
    fitExplanation: ['Your project experience matches the role.'],
    missingSkills: ['Docker'],
    keyQualifications: ['Degree in progress', 'Git and REST API basics'],
  },
}

const loadingResource = { status: 'loading' }
const errorResource = { status: 'error', message: 'Match analysis could not be loaded.' }
const incompleteResource = { status: 'incomplete-profile', message: 'Complete your profile to view a match analysis.' }
```

- Ready `data.jobId` must equal the selected job ID; `score` is a finite number from 0 through 100 or null. Text is plain text; the three detail collections are arrays of strings. React renders text without HTML injection.
- A non-ready resource has no renderable previous match data. API validation happens at the adapter; presentation also refuses a mismatched job ID instead of rendering another record's result.
- At the shared access boundary, propose `getMatch(jobId, savedProfile, { signal })`, returning `{ status: 'ready', data }` or `{ status: 'incomplete-profile', message }` and rejecting transport/invalid-response failures. The controller adds loading/error states. The adapter maps the actual shared shape; no new endpoint, profile schema or profile-completeness algorithm is chosen before owner agreement.
- The controller associates a result with the exact job/saved-profile request context. A change in the committed snapshot invalidates the prior result and cancels/ignores its request. Do not key matching only by job ID. No speculative cache is needed.
- Fixture test scenarios represent saved revisions A and B of the same demo user explicitly. They are not different accounts, a new profile editor, persistent store, similarity calculation or a claim that every profile edit changes every job's score.

## Files and responsibilities

| File | Milestone | Responsibility |
| --- | --- | --- |
| Create `front-end/src/pages/JobMatch.jsx` | A | Controlled summary plus native analysis dialog and local open state; no fetching/profile ownership. Small private content/dialog functions may remain in this module. |
| Create `front-end/src/pages/JobMatch.css` | A | Centered popup, responsive scrolling and content roles using shared values. |
| Modify `front-end/src/pages/JobDetails.jsx` | A | Optional `matchResource`, `onMatchRetry`, `onCompleteProfile` props; render JobMatch when a resource is supplied. Preserve existing behavior when omitted until B is connected. |
| Create `front-end/tests/job-match.test.mjs` | A | Rendering and mounted controlled interaction cases using the existing Vite/jsdom approach. |
| Create `front-end/src/jobs/match.js` | B | Thin validated adapter to the agreed mock access; reuse an existing equivalent if #46 supplies one. |
| Modify `front-end/src/App.jsx` | B | Selected-job/saved-profile resource lifecycle, retry, active-request cancellation and callback binding; preserve existing jobs lifecycle. |
| Modify `front-end/src/main.jsx` only if required by the agreed shared provider | B | Mount the agreed provider once. Do not invent a local replacement profile store. |
| Modify `front-end/tests/job-details.test.mjs` and `jobs-flow.test.mjs` | A/B | Optional-prop compatibility, integrated summary/modal identity, navigation, request races and Save/Cancel propagation. |
| Create `front-end/tests/job-match-service.test.mjs` | B | Response validation and real agreed mock-access cases. |
| Modify `front-end/README.md`, `front-end/INTEGRATION.md`, `UX-DESIGN.md` | A/B | Actual component contracts, milestone completion, mock/reset behavior, accepted prototype differences and remaining acceptance. |

Do not add mock service files or rewrite Myra's store before confirming her published implementation. If #46 already provides matches/fixtures, extend that agreed path with its owner rather than building a second service.

## Milestone A — independent implementation after approval

### Task 1: Controlled match presentation and response states

**Consumes:** selected `job` and the resource defined above. **Produces:** `JobMatch({ job, resource, onRetry, onCompleteProfile })`; only local popup-open state is owned here. JobDetails maps `onMatchRetry` to `onRetry`.

- [x] Establish the isolated branch/baseline, inspect current nearest instructions, and run its existing full tests before editing. Do not mistake a baseline failure for a #78 regression.
- [x] Add supplied-data fixtures inside tests, using the resource examples above. Read them in component tests through the existing Vite SSR loader; test fixtures are not production UI literals.
- [x] Add failing assertions for ready/0/null scores, selected title/company, loading/error/incomplete presentation, empty collections, and job-ID mismatch.
- [x] Run `node --test tests/job-match.test.mjs`; require a failure caused by the absent component/behavior, not a broken test import/setup.
- [x] Build the summary/content component with explicit ready/non-ready rendering and React-escaped text. Do not copy `job.matchScore` over a newer supplied resource.
- [x] Rerun the focused file. Inspect visible content, role/name selectors and callback availability; never assert whole React/DOM objects that can produce enormous failure output.

Concrete ready/null assertions for the test module:

```js
const props = {
  job: { id: 'brightspace-software-intern', title: 'Software Engineering Intern', company: 'Brightspace Labs' },
  resource: readyResource,
}
const html = renderToStaticMarkup(createElement(JobMatch, props))
assert.match(html, /92% match/)
assert.match(html, /See full analysis/)
assert.match(renderToStaticMarkup(createElement(JobMatch, {
  ...props, resource: { ...readyResource, data: { ...readyResource.data, score: 0 } },
})), /0% match/)
assert.match(renderToStaticMarkup(createElement(JobMatch, {
  ...props, resource: { ...readyResource, data: { ...readyResource.data, score: null } },
})), /Match not available/)
```

Use `createElement`/`renderToStaticMarkup` from the same libraries as `tests/job-details.test.mjs`, and load JobMatch with `server.ssrLoadModule('/src/pages/JobMatch.jsx')`. These static checks do not verify the initially closed modal's native behavior; Task 2 covers it mounted and in a browser.

### Task 2: Native popup and Job Details composition

**Consumes:** Task 1 resource/component and existing native-dialog lifecycle. **Produces:** working local open/close, callback interactions and optional JobDetails composition; no shared-profile claim.

- [x] Add mounted failing tests that open See full analysis and inspect the named AI Match Analysis dialog. Assert the full ready content, AI notice, selected identity and empty-list fallbacks.
- [x] Add one-case-per-interaction checks for Close, Got It, native cancel/Escape event, unmount while open, supplied Retry, and supplied Complete profile. Verify exactly the expected callback fires without changing the selected job.
- [x] Implement native showModal/close lifecycle, unique heading IDs, previous-focus/overflow restoration, resource-driven content, Close and Got It buttons. Escape calls the same close path; backdrop clicks leave it open. Reuse this lifecycle inside the dialog component, with `dialogRef = useRef(null)` and React's `useEffect`/`useRef` imports:

```jsx
useEffect(() => {
  const dialog = dialogRef.current
  const previousFocus = document.activeElement
  const previousOverflow = document.body.style.overflow
  dialog.showModal()
  document.body.style.overflow = 'hidden'
  return () => {
    dialog.close()
    document.body.style.overflow = previousOverflow
    if (previousFocus?.isConnected) previousFocus.focus({ preventScroll: true })
  }
}, [])
```

The dialog is mounted only while open. Its native cancel handler prevents default and invokes the same local close callback; unmount performs the cleanup above. Real-browser tests must verify focus/scroll rather than relying on jsdom's stubbed modal methods.
- [x] Apply centered square layout and existing type/button/focus values. Use a constrained flex layout with a scrollable body, a visible header and reachable footer; include safe-area clearance where appropriate.
- [x] Add optional JobDetails props without changing the old no-resource behavior. The match block's intended composition is:

```jsx
<JobMatch
  job={job}
  resource={matchResource}
  onRetry={onMatchRetry}
  onCompleteProfile={onCompleteProfile}
/>
```

- [x] Run `node --test tests/job-match.test.mjs tests/job-details.test.mjs`. Confirm earlier metadata/link and disabled unrelated-action tests still pass.
- [x] Check the controlled JobDetails composition in a local browser harness with ready/loading/error/incomplete inputs. Keep the harness outside committed routes/source; label its evidence as component-only. No regular-app analysis activation is claimed in A.
- [x] Update README/UX notes to record A's actual scope and prototype choices.
- [ ] Present the complete diff and browser evidence for David's checkpoint review before B; do not automatically commit/push.

**November 3 implementation checkpoint:** Controlled UI, optional JobDetails composition, DOM tests, and contract/UX notes are implemented. Same-job resource transitions keep an open popup mounted and replace its contents; selected-job changes close it. Parent supplied the fresh 33-test prerequisite baseline. Native browser review and David's checkpoint review remain separate; no milestone B code, commits, or pushes are included.

**A review gate:** summary and popup agree for supplied resources, every visible local action works, native modal cleanup is verified, and Myra-dependent integration is explicitly still absent.

## Meeting gate before milestone B

Record these actual decisions in this plan before B code is written:

- [ ] Myra's saved-profile branch/module export and fields; identify what changes reactively after Save and what stays unchanged on Cancel.
- [ ] The agreed mock match-access export or endpoint, response example, and fixture ownership under #44/#46.
- [ ] The agreed incomplete-profile result and working completion navigation callback under #49; no guessed route or completeness algorithm.
- [ ] A pair of supported saved-profile fixture scenarios whose applicable match response differs, plus reload/reset behavior.

Use the separately saved local meeting notes during review; they are not part of the feature commit. Record the publishable contract in `front-end/INTEGRATION.md` when agreed, with actual shared module paths and examples.

## Milestone B — connect the agreed shared implementation

### Task 3: Adapter, saved-profile lifecycle and complete user flow

**Consumes:** approved meeting decisions, selected job and committed profile snapshot. **Produces:** a profile-aware resource passed to the same JobMatch UI; no second profile data store.

- [ ] Update this task's binding/import details to the actual shared module paths before execution. The proposed internal `getMatch(jobId, savedProfile, { signal })` remains the adaptation boundary unless the meeting agrees a simpler equivalent.
- [ ] Add failing adapter cases for ready/incomplete, zero/null, mismatched job, malformed/out-of-range score, malformed text collections, unavailable response and transport failure. Unknown score is valid; wrong identity is not.
- [ ] Add mounted failing flows: job A/profile A, job B, failed request then Retry, saved profile A→B, draft edit then Cancel, and a late job/profile A response arriving after B. Assert matching identity/content and that canceled/stale results never replace current state.
- [ ] Bind the agreed mock loader and validate at that boundary. Map shared response names once, and preserve existing job data validation and jobs API errors.
- [ ] Bind the shared saved profile and selected job in App. Store match resources separately from Browse/detail jobs resources. On request-context changes, render loading immediately, cancel the old request on cleanup and ignore late settlement. Active failures expose Retry; an active abort must not leave a permanent loading state.
- [ ] Pass one resource to JobDetails so summary and popup share it. Bind Complete profile through the agreed #49 navigation; preserve the selected job's return context. Do not touch Save/Discussion handlers or their owners' stores.
- [ ] Demonstrate supported profile A→B Save propagation and Cancel isolation using the actual shared state, not only a rerendered component prop. The full app now has a working See full analysis path; absence of this wiring means B is unfinished.
- [ ] Run the focused new tests, then `npm test`, `npm run lint`, `npm run build`. Check any old test expectations affected by additional match requests precisely rather than weakening assertions.
- [ ] Update operating/integration/UX docs with actual module fields, reset behavior, prototype differences and remaining checks. Present the final feature diff. Commit and push only when separately authorized; suggested one-line message: `add job match analysis`.

## Browser and acceptance checklist

Check milestone A in its controlled harness and repeat the complete integrated flow after B. Never substitute A evidence for B acceptance.

- [x] At 393 × 852 and 360 × 640: open, Close/Got It/Escape, focus containment/restoration, background scroll lock, long-analysis scroll, readable wrapped chips, visible footer and no horizontal overflow. Also check larger text and a wider viewport.
- [x] Ready score, zero score, unknown score, empty lists, loading, failure/retry and incomplete-profile recovery; inspect screenshots and page errors.
- [ ] Open two jobs; summary/analysis and return context stay correct. Navigate away while loading/open; no stale dialog or result remains. Check both existing Back paths still restore Browse selections/cache.
- [ ] With Myra: Save changes an applicable mocked match; Cancel preserves the saved match. Summary/full content agree, and the result still identifies the chosen job.
- [x] Run from repo root: `git status --short`, `python3 .local-harness/verify_wireframes.py`, and `git diff --check`. In an external worktree, invoke the existing helper with `--root <worktree>` without copying it into a commit. No drawing change is planned.
- [ ] Obtain teammate review and shared-contract acceptance. Physical-device/live-Figma checks are separate from automated DOM and headless-browser evidence.

## Requirement coverage and completion labels

| #78 requirement | Plan coverage | Completion boundary |
| --- | --- | --- |
| Load selected job/current profile response | Task 3 adapter/controller | B, shared access verified |
| Summary, explanation, missing skills, qualifications and notice | Tasks 1–2 | A for supplied responses; B for live shared flow |
| Same-job close and incomplete/error states | Task 2 + Task 3 recovery binding | A local actions; B navigation/data recovery |
| Saved profile changes affect applicable presentation | Task 3 joint Save/Cancel flow | B, actual #59 integration |

Use “Related to #78” while B or acceptance is unfinished. A's component verification is useful reviewable work, not whole-issue completion.

**Rough focused effort:** A about 2–4 hours; B about 1.5–3 hours if the shared interfaces are available, plus teammate review/integration waiting. These are planning estimates, not a promise to meet tonight's cutoff. Reassess scope/capacity with the team if the interface is still unavailable.
