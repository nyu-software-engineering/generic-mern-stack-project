# Discovery styling implementation plan

## Goal

Deliver the approved light marketplace through navigation, Browse, and Item Details. Keep service behavior and other journeys intact.

## Architecture and constraints

Use the existing React, Router, Vite, and CSS stack. Add shared design variables and explicit control classes. Reuse current state and services. No dependencies or API changes. The [research](../research/142-discovery-implementation.md) and [interface contract](142-discovery-interface.md) define the boundaries.

Baseline: 127 frontend tests pass. The existing notification test fails at `test/notifications.test.js:202`. Record that separately from checks for this change. The baseline phone view has no shared bottom navigation and uses the previous system font and blue controls.

## 1. Shared styles and navigation

Files: `front-end/src/styles/design-system.css`, `front-end/src/main.jsx`, `front-end/src/components/Icon.jsx`, `front-end/src/components/Navbar.jsx`, and `front-end/src/components/Navbar.css`. Remove the duplicate review navigation component, imports, rendering, and its CSS rules.

- [ ] Confirm the baseline in the browser at 320px: no mobile navigation landmark, old colors and font.
- [ ] Add the approved palette, spacing, typography, focus, surface, and control variables. Import the design system after the existing base styles.

```js
import './index.css'
import './styles/design-system.css'
```

- [ ] Add the decorative inline SVG interface `Icon({ name, size = 20, className = '' })`. Surrounding controls retain their names.
- [ ] Build the desktop links and phone navigation from the interface route table. Use named landmarks, actual links, current-page semantics, keyboard focus, and adequate phone targets.
- [ ] Keep signed-out visibility and sign-out behavior. Reserve bottom space only while the shared phone bar exists.
- [ ] Verify links and active states at 320, 768, and 1366px, including both review routes. Run lint and build. Commit `Add shared marketplace navigation`.

## 2. Browse and listing cards

Files: `front-end/src/pages/browse/Browse.jsx`, `front-end/src/components/ListingCard.jsx`, `front-end/src/components/SaveListingButton.jsx`, and `front-end/src/pages/browse/browse.css`.

- [ ] Apply the shared page heading, filters, field, button, feedback, and status classes.
- [ ] Use one, two, and three catalog columns across the approved sizes. Keep long titles readable and the saved control separate from the title link.
- [ ] Preserve search trimming, debounce, category conversion, result keys, stale guards, retry, reset, item count, and shared saved state.
- [ ] Preserve the existing card and save signatures:

```js
ListingCard({ listing })
SaveListingButton({ listing, compact = false })
```

- [ ] Style loading, empty, failed, saved, unsaved, and pending states. Do not invent listing images or records.
- [ ] Verify real search/category combinations, no results/reset, save propagation, pending protection, failed saves, and list/saved retry with the fixture API.
- [ ] Run `node --test test/publicListings.test.js test/renterDashboard.test.js test/listings.test.js` from `front-end`. Commit `Restyle marketplace browsing`.

## 3. Item details and request entry

Files: `front-end/src/pages/browse/ItemDetails.jsx` and `front-end/src/pages/browse/browse.css`.

- [ ] Arrange item information, existing image fallback, owner, terms, daily rate, and date request form in a readable phone layout and desktop split layout.
- [ ] Keep keyed loading, unavailable/error handling, retries, cache writes, owner exclusions, and report destination.
- [ ] Preserve required, past, equal, and reversed date checks. Connect date errors to their fields. Keep the estimate and query contract:

```js
const query = new URLSearchParams({ start: startDate, end: endDate })
navigate(`/listings/${listing.id}/request?${query.toString()}`)
```

- [ ] Verify valid dates open the existing booking form with the correct values. Check owned, unavailable, failed, and saved-item states at 320px and desktop.
- [ ] Run relevant booking and listing tests, lint, and build. Commit `Restyle item details and rental entry`.

## 4. Verification and review

- [ ] Run the full frontend suite and compare with the recorded baseline. Keep the existing notification failure visible in the result.
- [ ] Verify keyboard focus, long content, empty/error/retry states, 320/375/390/768/1024/1366px layouts, and enlarged-text reflow. Check every route still renders after shared styles change.
- [ ] Record screenshots and the route, viewport, steps, and result. Distinguish viewport emulation from real-device testing.
- [ ] Obtain an independent code review and a security review of the final diff. Resolve actionable findings and repeat affected checks.
- [ ] Open a focused implementation PR. While #153 is unmerged, target its planning branch so the source diff is separate. Retarget to master after #153 merges.
