# Cross-app mobile audit plan

## Scope and baseline

Audit #148 against master `306fc2a` and a temporary combined version at `c94a69e`, which includes pending #157 at `c6e3d9d` and #163 at `2454678`. Keep those PR changes out of this branch. Follow the [research](../research/148-mobile-audit.md), [shared shell contract](148-mobile-interface.md), and approved NYU design.

The combined baseline has 131 passing frontend tests. Its 35 route and query views pass 210 layout checks at 320/375/390/768/1024/1366px. All 35 also fit at real Chromium tab zoom 4, starting at 1280px. Current master has six long-name Profile overflow results, one at each width; #163 already fixes them.

The confirmed new audit finding is focused controls hidden by the fixed phone navigation. Root bottom padding does not reserve the browser's focus-scroll area, and wrapped labels make the 320px bar taller than its declared height. Reproduce with native Tab through Quick Borrow, listing creation, report, chat, booking request, and participant review.

## 1. Preserve the reproduction

- [x] Add a standalone browser regression at `front-end/test/browser/mobile-focus.mjs` using the real Vite app, Express routes, and the existing synthetic test fixture. Load an installed Playwright module through `PLAYWRIGHT_MODULE`, without adding a project dependency.
- [x] Traverse native Tab and Shift+Tab until focus leaves the main content. Cover the six affected views at 320 and 390px widths with a 500px height, plus the short 320 by 203px case.
- [x] Assert no focused control is fully hidden by the bar. Record any partial native textarea visibility separately. Check the entry line while typing several lines and verify that final controls can scroll clear.
- [x] Run the check on the baseline and retain a failing result. Add exact run instructions beside it. Include the regression with its shared CSS fix in one focused commit.

## 2. Fix the shared scroll area

File: `front-end/src/styles/design-system.css`. Keep component signatures, routes, APIs, provider state, native controls, and dialog behavior unchanged.

- [x] Set `--ds-nav-height` to the measured 5.5rem candidate so wrapped phone labels fit the shared reserve.
- [x] Inside the existing phone media query, add document scroll padding only when the phone bar exists:

```css
html:has(.ds-mobile-nav) {
  scroll-padding-block-end: calc(var(--ds-nav-height) + env(safe-area-inset-bottom, 0px) + var(--ds-space-4));
}
```

- [x] Use the existing root bottom-padding calculation and navigation rules with the same height token. Do not add page spacers, global focus handlers, or a second scroll container.
- [x] Run the native focus regression, frontend tests, lint, and build. Check signed-out and desktop behavior. Commit `Keep mobile keyboard focus above navigation`.

## 3. Verify the complete journeys

- [x] Apply this branch's shared CSS change to the disposable combined checkout. Repeat the six-width and full-page 400% zoom checks. Record actual zoom, viewport, and document bounds.
- [x] Check touch and keyboard flows for discovery/save, listing creation/edit/preview/status, dashboard filters, request/summary/extension/cancellation, local handoff, messaging/offers, requests, Quick Borrow, notifications, ratings, rules, and reporting. Include representative validation, loading, failure/retry, empty, and retained-value states.
- [x] Verify offer focus containment, internal scrolling, final actions, Escape, and focus return after the document scroll change. Check native date/time, radios, and enlarged text.
- [ ] Inspect the user's physical iPhone Safari evidence. Record visible results without treating screenshots as proof of unshown interactions. Confirm offer date picker, Quick Borrow, and landscape behavior where available.
- [x] Save a route checklist, a finding log with reproduction steps, screenshots, and the remaining limits. Keep final merged-version verification pending while #157 and #163 remain open.
- [x] Obtain independent source and security reviews. Fix actionable findings and repeat affected checks.
- [x] Open a focused PR against master under the user's identity, assigned to the user in Sprint 2. Request Sherry and Omer. Update #148 with verified progress and remaining checks; do not close it while final merge/device checks remain.

Results: [148-verification.md](148-verification.md), [route checklist](148-route-checklist.md), and [counts](148-checks.json). Device confirmations and the final merged-master check remain pending.

Implementation: [#164](https://github.com/agile-students-fall2026/generic-mern-stack-project-dormshare/pull/164), against master. Assigned to hassanraza04 in Sprint 2, with reviews requested from Sherry and Omer. #148 remains open for the recorded final checks.
