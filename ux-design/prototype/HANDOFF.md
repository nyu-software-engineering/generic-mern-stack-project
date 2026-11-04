# CareerHive prototype handoff

Updated October 24, 2026 for the teammate assembling the updated draw.io screens in Figma.

## What is ready, and what you own

The saved drawing has **24 tabs/screens**, with matching individual PNGs and XML. Local source/export checks pass. The next owner handles Figma image replacement, frame names, hotspots, navigation, phone presentation, scrolling, and the acceptance checks below. The live Figma file has not been refreshed or tested in this pass. This is an asset handoff, not full Sprint 0 signoff.

- Editable source: [`../wireframes.drawio`](../wireframes.drawio).
- Matching XML copy: [`../wireframes.drawio.xml`](../wireframes.drawio.xml).
- Screen PNGs: `../wireframes-<current-tab-name>.drawio.png` (linked individually below).
- [App-map source](../app-map.drawio.xml) and [PNG](../app-map.drawio.png).
- [Screen behavior and design rationale](../../UX-DESIGN.md).
- [Figma editor](https://www.figma.com/design/R4lliiZKlfzQkVtCScmLcN/CareerHive-Prototype) — requires edit access.
- [Prototype viewing link](https://www.figma.com/proto/R4lliiZKlfzQkVtCScmLcN/CareerHive-Prototype?node-id=75-3&starting-point-node-id=75-3) — refreshed October 26 on the "Prototype (Oct 26)" page.

Use the descriptive screen name to match old and new assets. **Old page 5 was Profile Setup; new page 5 is Sign Up Error.** Replacing pictures by number alone will put the wrong screens into the prototype. These are draw.io tabs and prototype states; no new main app-navigation section has been added.

## October 24 height update — import these refreshed images

The phone-height branch is `0a-wireframe-phone-height-david`. It retains the same 24 page/file names and the existing navigation map below. Replace the updated image fills by descriptive name and recheck Filters-panel hotspots after its bottom-anchor movement.

| Refreshed page | Change |
| --- | --- |
| 01 Welcome; 02 Log In; 03 Log In Error; 04 Sign Up; 05 Sign Up Error | Source height 640 → 785px; content positions and sizes preserved. |
| 09 Browse Jobs; 10 Browse Jobs Filters | Source height 732 → 785px. Filters shade expands; its 456px panel moves from y=276 to y=329, retaining child geometry. |
| 17 Application Details; 18 Update Stage; 19 Remove confirmation | Timeline connector removed in each state; square markers/text and the 796px source height remain unchanged. |
| 20 Deadlines | Source height 640 → 785px; all three deadline rows remain unchanged. |
| 21 My Profile | Source height 760 → 785px; all content positions remain unchanged. |

Other screen heights and assets are unchanged. Page 24 remains the four-item **expanded Saved** example. The source width remains 360px and PNG width 362px. Renderer calibration verified a 785px source produces a 362 × 785 image; the prior 784px test failed the viewport coverage check. All final screen exports must be at least 785px tall.

Use an iPhone 14/15 Pro **393 × 852** outer frame for every prototype state. At that width, a 362 × 785 PNG scales to about 852.22px high. Handle notch/status-bar/home-indicator spacing in Figma without shifting the source artwork. Any necessary inner viewport inset reduces the visible content area; retain proportional image height and scroll as needed. The source-height floor and minimum image size are asset checks, not proof that the live prototype or device settings have been tested.

## Changes included

- Replaced rounded corners and circular selection/history indicators with square shapes, including elements behind overlay shades. Selection still means one stage at a time; the filled square marks the chosen stage.
- Simplified visual design with grayscale fills, plain typography, labeled gray image placeholders, consistent headers/margins, and repeated tracker cards measuring 328 × 72px with 8px gaps.
- Standardized My Tracker to **up to two real items per nonempty stage**, not arbitrary preview lengths. Interview shows one because only one exists; Applied, Preparing, Saved, and Rejected each show two. Empty Offer groups and Home's zero-count Offer tile are hidden. Offer remains selectable for future applications.
- Accurate expansion links: Applied shows “Show 4 more”, Saved “Show 2 more”, Rejected “Show 1 more”; no link when nothing remains. The expanded Saved state is implemented; the other expanded states are deferred.
- Home still shows **three upcoming deadlines, two recommendations, and stage totals** (Saved 4 / Preparing 2 / Applied 6 / Interview 1 / Rejected 3). The two-per-stage rule describes the tracker, not a two-row limit everywhere.
- Aligned repeated job/company examples, Profile/Edit Profile role selections, default Saved selection, and example deadlines using October 21, 2026 as the reference date. This Week has its three matching deadlines.
- Added **05 Sign Up Error**, **23 Edit Profile — Change Photo**, and **24 Tracker — Saved Expanded**. Edit Profile remains 22. Expanded Saved was temporarily 22, then 23 during editing; its final name is 24.
- Regenerated all 24 wireframe PNGs and the app map using draw.io. Source screens are 360px wide; screen PNGs are 362px including the outline. Heights vary intentionally. New Post's invisible group bounds were tightened to its existing children; no visible controls moved in that bounds fix, and its export no longer has extra right-hand whitespace.
- The main `.drawio` now contains the actual editable screens rather than the old generic template. Keep the XML synchronized from this saved source after future edits. The Log In Error export shows the actual error screen rather than the former Welcome mismatch.

## Complete tab/file rename map

“Previous” refers to the committed 21-screen version before these new states. Each current-name link opens the exact PNG to import. Use these same descriptive names for Figma frames.

| Previous tab | Current tab / PNG | Figma action |
| --- | --- | --- |
| `01-welcome` | [`01-welcome`](../wireframes-01-welcome.drawio.png) | Replace existing screen image; check hotspots |
| `02-log-in` | [`02-log-in`](../wireframes-02-log-in.drawio.png) | Replace existing screen image; check hotspots |
| `03-log-in-error` | [`03-log-in-error`](../wireframes-03-log-in-error.drawio.png) | Replace existing screen image; check hotspots |
| `04-sign-up` | [`04-sign-up`](../wireframes-04-sign-up.drawio.png) | Replace existing screen image; check hotspots |
| `New state` | [`05-sign-up-error`](../wireframes-05-sign-up-error.drawio.png) | Add state frame and wire interactions |
| `05-profile-setup` | [`06-profile-setup`](../wireframes-06-profile-setup.drawio.png) | Replace existing screen image; check hotspots |
| `06-home` | [`07-home`](../wireframes-07-home.drawio.png) | Replace existing screen image; check hotspots |
| `07-home-menu` | [`08-home-menu`](../wireframes-08-home-menu.drawio.png) | Replace existing screen image; check hotspots |
| `08-browse-jobs` | [`09-browse-jobs`](../wireframes-09-browse-jobs.drawio.png) | Replace existing screen image; check hotspots |
| `09-browse-jobs-filters` | [`10-browse-jobs-filters`](../wireframes-10-browse-jobs-filters.drawio.png) | Replace existing screen image; check hotspots |
| `10-job-details` | [`11-job-details`](../wireframes-11-job-details.drawio.png) | Replace existing screen image; check hotspots |
| `11-job-details-save-to-tracker` | [`12-job-details-save-to-tracker`](../wireframes-12-job-details-save-to-tracker.drawio.png) | Replace existing screen image; check hotspots |
| `12-job-details-ai-match` | [`13-job-details-ai-match`](../wireframes-13-job-details-ai-match.drawio.png) | Replace existing screen image; check hotspots |
| `13-job-discussion` | [`14-job-discussion`](../wireframes-14-job-discussion.drawio.png) | Replace existing screen image; check hotspots |
| `14-job-discussion-new-post` | [`15-job-discussion-new-post`](../wireframes-15-job-discussion-new-post.drawio.png) | Replace existing screen image; check hotspots |
| `15-tracker` | [`16-tracker`](../wireframes-16-tracker.drawio.png) | Replace existing screen image; check hotspots |
| `16-application-details` | [`17-application-details`](../wireframes-17-application-details.drawio.png) | Replace existing screen image; check hotspots |
| `17-application-details-update-stage` | [`18-application-details-update-stage`](../wireframes-18-application-details-update-stage.drawio.png) | Replace existing screen image; check hotspots |
| `18-application-details-remove` | [`19-application-details-remove`](../wireframes-19-application-details-remove.drawio.png) | Replace existing screen image; check hotspots |
| `19-deadlines` | [`20-deadlines`](../wireframes-20-deadlines.drawio.png) | Replace existing screen image; check hotspots |
| `20-profile` | [`21-profile`](../wireframes-21-profile.drawio.png) | Replace existing screen image; check hotspots |
| `21-edit-profile` | [`22-edit-profile`](../wireframes-22-edit-profile.drawio.png) | Replace existing screen image; check hotspots |
| `New state` | [`23-edit-profile-change-photo`](../wireframes-23-edit-profile-change-photo.drawio.png) | Add state frame and wire interactions |
| `New state` | [`24-tracker-saved-expanded`](../wireframes-24-tracker-saved-expanded.drawio.png) | Add state frame and wire interactions |

## New or changed navigation to assemble

The destinations below are the intended wiring, not claims that they already work. A PNG is a flat image: add or reposition hotspot layers on top of it.

| Starting screen | Control | Destination / expected behavior |
| --- | --- | --- |
| 04 Sign Up | Create Account | Include both a successful example → 06 Profile Setup and an error example → 05 Sign Up Error. Explain the chosen demo path; actual input validation is not implemented. |
| 05 Sign Up Error | Create Account retry | Corrected-input demo → 06 Profile Setup; keep an error retry available if demonstrating failure. |
| 05 Sign Up Error | Log in / Back | Log in → 02 Log In; Back → prior signup/welcome context. |
| 22 Edit Profile | Change photo | 23 Edit Profile — Change Photo. |
| 23 Change Photo | Close / Cancel | Return to 22 Edit Profile without applying a change. |
| 23 Change Photo | Update | Return to 22 for the limited photo-choice demonstration; Save Changes on 22 commits the overall profile in the intended app flow. No actual photo upload or changed-photo result is implemented here. |
| 23 Change Photo | Take Photo Now / Choose from Album | Visible source choices only. Camera, album, and selected-photo preview flows were explicitly excluded; do not invent destinations or claim these are tested uploads. This remains an exception to a literal all-controls-interactive requirement unless accepted by the instructor. |
| 16 My Tracker | Saved: Show 2 more | 24 Tracker — Saved Expanded. |
| 24 Saved Expanded | Show less | 16 My Tracker. Keep the Saved section at a sensible scroll position. |
| 16 / 24 | Applied: Show 4 more; Rejected: Show 1 more | Corresponding expanded examples are not supplied. Deferred design work; don't route to the Saved example. |
| 07 Home | Nonempty stage summary tiles | My Tracker filtered to the chosen stage. The filtered-result variants are still deferred; totals should remain true totals. |

### Existing navigation to retain and retest

- Welcome → Log In / Sign Up; login error → retry → Home; Profile Setup → Save and Continue or Skip for now → Home.
- Menu → Home, Browse Jobs, My Tracker, Deadlines, My Profile; logout → Welcome. Close/outside-dismiss must return to the screen where the menu opened, not always Home.
- Home recommendations and Browse cards → matching Job Details; Home deadline rows → matching Application Details; See all → Deadlines or Browse, and View tracker → My Tracker.
- Browse Filters → panel; Clear all / Show Results must show the appropriate result state when that deferred design is supplied. Search, sort, and filter tags also need working states.
- Job Details → Save to Tracker / AI Match / Discussion / external company application URL. Close/Cancel returns to the correct parent. Saving should eventually show “In Tracker: Saved”; closing the dialog alone is not proof of saving.
- Job Discussion → New Post → Topic/anonymous choices → posted discussion result. The new-post result and open topic selector are deferred.
- Tracker cards → matching Application Details; Application Details → Update Stage / Remove / Save Notes / original listing. Updated-stage/history, removal, and saved-note results are deferred.
- Deadlines tabs → This Week / This Month / All; rows → the matching application's details. Only the This Week example is currently drawn.
- My Profile → Edit Profile; Edit Profile → Cancel or Save Changes → My Profile. Saved changes need to be reflected when those result variants are supplied.

Only one Job Details/Application Details content example is supplied for the software job. When wiring other cards, use that screen as a layout template and make the destination content match the clicked job; a Data Analyst card should not silently become the software job. These content variants are prototype assembly work, not new app sections.

## Refreshing the pictures without losing connections

For an existing screen, select its image layer and replace the image fill in the Fill section. Retain the frame and existing hotspot layers. For a new state, duplicate a suitable frame and replace its image; inspect and correct copied hotspots. Match names with the table above. Renaming PNG files does not automatically rename frames or fix connections.

Place new images with Shift–Command–K on Mac or drag them onto the canvas. Keep the image behind the hotspots. Correct any retained crop settings, and resize proportionally; do not squeeze a tall image to the phone's height. See [Figma's image instructions](https://help.figma.com/hc/en-us/articles/360040028034-Add-images-and-videos-to-designs).

The supplied modal PNGs include the entire dimmed background. A simple assembly uses Navigate to for the full popup-state screen and returns to the parent on Close/Cancel. Don't add another dimming backdrop. A true Open overlay/Close overlay implementation needs an isolated dialog frame rather than layering the complete dimmed screenshot over itself.

## Phone exterior versus scrollable screen

**You can draw the phone exterior in draw.io. It is static artwork; scrolling is set up in Figma.** Do not export a bezel plus a long page as one image for scrolling, because the bezel will move with that image.

Recommended prototype structure:

```text
Fixed phone presentation / device exterior
  Fixed-size content viewport (Clip content + Vertical overflow)
    Full-height screen PNG + matching hotspot layers (scroll together)
```

Use the agreed iPhone 14/15 Pro portrait viewport, 393 × 852, throughout. Scale every 362px-wide PNG proportionally to the viewport width and leave its full height extending below the viewport. Keep the phone exterior outside the scrolling content. The current screenshots' varying heights are allowed by Part 0A; prototype viewport dimensions should stay consistent.

The simplest choice is to let Figma present the device exterior. If custom artwork is wanted, draw it separately in draw.io and import it as a separate fixed presentation layer. For static phone-framed submission images, a separate presentation export is possible, but preserve the existing screen-only assets for the prototype. If framing changes submission export dimensions, standardize the whole set together. Keep UI controls square and check any device-shell treatment against the professor's no-rounded-edges feedback.

Set the viewport's Prototype → Scroll behavior → Overflow to Vertical and enable Clip content. Content must exceed the viewport height. Keep hotspots in the same scrolling container as their controls. A header embedded in one full-page PNG cannot independently stay fixed without separating its artwork. The Figma assembler handles camera-notch/status-bar/home-indicator clearance using presentation spacing, with the source layouts preserved. [Figma scrolling reference](https://help.figma.com/hc/en-us/articles/360039818734-Prototype-scroll-and-overflow-behavior), [course Figma notes](https://knowledge.kitchen/content/courses/software-engineering/figma-essentials/).

## Requirements status and outstanding decisions

| Requirement | Current evidence / remaining work |
| --- | --- |
| Professor: same sizing, simpler square UI, consistent previews | Source width, export width, square shapes, tracker card spacing, preview counts, and hidden empty Offer group verified locally. Home's three-deadline preview is documented separately. |
| Professor: phone exterior, smooth navigation, consistent mobile viewport | Done October 26: 393 × 852 frames in the iPhone 16 device frame, vertical scrolling, fixed status-bar inset, and 122 hotspots rebuilt from the drawio coordinates and checked in play mode. |
| Professor: explain design choices | Rationale recorded in UX-DESIGN.md and above. |
| 0A: mobile layout, consistent placement, individual PNGs and source, descriptions, app hierarchy | Local checks pass; all 24 PNGs match source/XML. App-map hierarchy and source/export were checked. |
| 0A: no decorative images/icons, clear links | Grayscale placeholders/plain text retained. Review remaining menu/picker symbols against the strict no-icons instruction. Browse Sort on 09–10 is plain text without underline/box and needs a clearer control treatment. |
| 0A: every dynamic state diagrammed | Incomplete: selectors, visible action results, additional expansion/filter/tab/search states, and empty-data behavior are deferred. Deferral is not assignment completion. |
| 0B: all navigation and overlays functional; believable core flow; public prototype | Pending Figma refresh, full walkthrough, and signed-out/public-link test. Camera/album actions are a stated scope exception. |
| 0C: project setup | Separate team work: CONTRIBUTING.md remains a placeholder; README needs project history/contribution and UX links. Roles, communications, collaborator setup, required labels, and boards are not certified by this handoff. |
| 0D: sprint planning | Separate evidence review needed for story/task/spike coverage, Sprint labels, task-to-story links, board views, and estimation decisions. No completion claim. |

Deferred design queue: open pickers/selectors; after-save job button/stage; updated application stage/history; posted/removed/saved-note/profile results; filter apply/clear and search/topic/empty-result states; This Month/All deadlines; other tracker expansions; Browse continuation beyond the four examples. Review whether New York filtering intentionally includes Brooklyn/Jersey City and whether full-time recommendations are intended for the internships-only sample profile.

## Acceptance checklist for the next owner

- [ ] Replace existing images by descriptive name, add the three new states, and check all renamed frame references.
- [ ] Reposition hotspots after list/layout changes; no clicks land on an old control position.
- [ ] Wire Sign Up Error, Change Photo return controls, and Saved expansion/collapse as above.
- [ ] Keep the same phone viewport and verify scrolling to each page's bottom, including hotspot alignment after scrolling.
- [ ] Verify Welcome → login error/retry → Home and signup error/retry → Profile Setup → Home.
- [ ] Walk through Browse → job → Save dialog → Tracker → application → Update/Remove → Deadlines, recording deferred result gaps instead of claiming those mutations work.
- [ ] Test My Profile → Edit Profile → Change Photo → Close/Cancel/Update; record excluded camera/album behavior.
- [ ] Test every menu destination, correct return screen, Back, Close, Cancel, outside-dismiss where documented, external links, and logout.
- [ ] Decide remaining manual designs and professor-rule exceptions with the team; update the outstanding queue rather than silently dropping controls.
- [ ] Publish Anyone with the link / Can view where permitted; test the prototype viewing link signed out and update UX-DESIGN.md with actual verification evidence.

## Review/delivery boundary

Local assets are ready for teammate review. This does **not** mean all professor feedback or Sprint 0A–0D requirements are finished. Keep any review PR a Draft until its intended scope is agreed; do not describe it as final submission approval.

This height update belongs to feature branch `0a-wireframe-phone-height-david`; the earlier feedback cleanup is already merged into master. The next owner should use this branch when receiving the updated files and match screens using the table above. The user creates any PR themselves; no PR is created by the agent.

Branch naming follows the team’s assignment-topic-author convention. Future commit messages must be one short line with no body.
