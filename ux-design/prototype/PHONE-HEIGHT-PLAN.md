# Phone-height wireframe plan

Implemented and reviewed locally — October 24, 2026. The user agreed to the iPhone 15 Pro approach, bottom-only padding with preserved layouts, timeline connector cleanup on pages 18–19, and Figma-owned safe-area handling. The user invoked implement, authorizing execution and a local commit on the new branch. Publishing the branch and creating a PR remain outside this implementation request.

## Agreed outcome

Use the documented iPhone 14/15 Pro Figma approach with a consistent 393 × 852 portrait viewport and a stationary device outline. Keep the draw.io source width at 360px and screen PNG width at 362px. Short source screens should cover at least one phone viewport when proportionally displayed; longer pages remain full-height and scroll.

For short screens, **preserve existing content positions and add empty space below**. Do not stretch controls, fonts, cards, or imagery and do not spread the content vertically. The Filters panel is the exception: move its existing group down as a unit to remain bottom-anchored, preserving its children and dimensions. Extend the full-screen background and dimming layer accordingly.

The [product glossary](../../CONTEXT.md) defines tracker previews and expanded Saved; this height change does not change their item counts. Page 24 remains the four-item expanded example.

**Safe areas are handled in Figma.** The assembler reserves any needed notch/status-bar/home-indicator clearance outside the source artwork, within the fixed phone presentation. This branch adds no top inset to the drawings and does not shift all 24 layouts. Any reduced inner viewport height is handled through clipping and scrolling rather than by squeezing the image. This may allow a short screen to scroll slightly when safe-area insets consume part of the viewport.

## Terms used by this plan

- Source screen: the saved draw.io screen rectangle and its full content, including content that will require scrolling.
- PNG export: the individual rendered screen image, including the current outline.
- Phone viewport: the fixed visible content window inside the prototype's phone presentation.
- Device outline: the stationary hardware presentation around the viewport, separate from the scrolling content.

These are explanatory design terms; the product glossary stays focused on CareerHive concepts rather than implementation details.

## Measurements and expected affected pages

The nominal proportional source height is `360 × 852 / 393 ≈ 780.46px` (round up to 781). Because the PNG includes the outline and is 362px wide, validate against the **rendered image**: `ceil(362 × 852 / 393) = 785px` minimum height. The final source height must be calibrated with draw.io's actual renderer; 781 source pixels alone are not proof of a correctly filled phone viewport.

Use one common calibrated minimum for every short screen. Do not change the width to achieve the ratio.

| Saved pages | Current source height | Planned treatment |
| --- | ---: | --- |
| 01–05: Welcome and account forms/error states | 640px | Increase to the calibrated common minimum; preserve content positions. |
| 09–10: Browse Jobs and Filters | 732px | Increase both together; extend dimming coverage and retain the bottom sheet's anchoring. |
| 20: Deadlines | 640px | Increase background height; retain its three deadline rows. |
| 21: My Profile | 760px | Small increase to the same minimum. |
| Other 15 pages | 796–1398px | Keep heights unchanged. Content remains unchanged except for the agreed connector removals on 17–19; preserve all expansion states. |

## Current saved work to protect

The authoritative source has an uncommitted page 17 edit removing timeline connector `wf16-20`. XML and the page 17 PNG have not been synchronized with that edit. Preserve it when making the height changes; do not copy older XML back over the drawing.

The user agreed to remove the matching timeline connectors from the popup backgrounds on pages 18–19 as well: `n_0z8URWjkJg2-_daKVR-19` and `QhCXQMRiosKL6GleSX-A-19`. Preserve the square stage markers, labels, and dates; keep all three pages at their existing heights.

The worktree also has unrelated local `.gitignore` additions for the PR draft/body filenames. Preserve those changes, but do not silently bundle them into a height-only commit.

## Files in scope

- Modify `ux-design/wireframes.drawio`: nine height adjustments, page 10 shade and bottom-sheet anchoring, and connector consistency on pages 17–19.
- Regenerate `ux-design/wireframes.drawio.xml` from that saved drawing.
- Replace affected PNGs only: `wireframes-01-welcome.drawio.png`, `wireframes-02-log-in.drawio.png`, `wireframes-03-log-in-error.drawio.png`, `wireframes-04-sign-up.drawio.png`, `wireframes-05-sign-up-error.drawio.png`, `wireframes-09-browse-jobs.drawio.png`, `wireframes-10-browse-jobs-filters.drawio.png`, `wireframes-17-application-details.drawio.png`, `wireframes-18-application-details-update-stage.drawio.png`, `wireframes-19-application-details-remove.drawio.png`, `wireframes-20-deadlines.drawio.png`, and `wireframes-21-profile.drawio.png`, all under `ux-design/`.
- Update `UX-DESIGN.md` and `ux-design/prototype/HANDOFF.md` with the measurements, exact changed pages, and Figma assembler's safe-area/scroll responsibilities.
- Retain the planning documents `ux-design/prototype/PHONE-HEIGHT-PLAN.md` and `CONTEXT.md`; keep implementation dimensions and technical decisions in this plan rather than the glossary.
- Update the local working notes `/private/tmp/careerhive-wireframe-checklist.md` and `/private/tmp/careerhive-figma-testing-guide.md`, plus the local harness if an additional minimum-height assertion is useful. These remain outside the proposed commit.

The changed-page list is based on the inspected saved source. Reaudit the latest master at execution time and adjust the list if teammates have already applied some changes; do not overwrite newer work to reproduce this snapshot. App-map artwork, page ordering, new navigation states, and live Figma editing are outside this branch's scope.

## Proposed branch and implementation sequence

Implementation branch: `0a-wireframe-phone-height-david`, created from verified merged master `f5b006217405e582d790132a70c8774c4d31f089` (merge PR #26). The previous feedback branch was reported merged; fetch and verify the latest team `master` and the merge ancestry before choosing the base. Do not create the new branch from stale local `master` or include unrelated old-branch commits by accident.

1. [x] Resolve the layout, connector, and safe-area decisions; the user subsequently requested implementation.
2. [x] Snapshot the saved drawing, XML, exports, untracked planning documents, and worktree deltas. Fetch and verify the latest team master, then create the new feature branch from that verified base. Reapply only the page 17 connector-removal delta and planning documents where needed; never copy the whole older drawing over newer teammate edits. Preserve unrelated local ignore edits outside the branch commit. Resolve conflicts with evidence and ask if intent cannot be determined.
3. [x] Calibrate one short screen in a temporary source copy, using the actual draw.io PNG renderer. Keep output width 362px; choose the smallest common source height whose rendered PNG height is at least 785px. Check the full image fills a 393 × 852 viewport when its width is scaled to 393px.
4. [x] Apply that minimum to the nine short screens. Update full-screen overlay bounds and bottom-sheet anchoring on page 10. Preserve positions and dimensions of all other controls, content, internal IDs, names, and page order.
5. [x] Synchronize XML from the saved source. Preserve the page 17 connector removal and mirror it on pages 18–19, as agreed. This is the only line-only visual change in scope.
6. [x] Export the twelve changed pages (01–05, 09–10, and 17–21) to a temporary directory with correct one-based page indices and embedded diagram data. Verify them before replacing the corresponding repo PNGs. Unchanged source pages do not require unrelated redesign or export churn.
7. [x] Update UX-DESIGN.md and HANDOFF.md with the selected phone viewport, calibrated source minimum, scaling/scrolling instructions, and exact changed-page list. Keep plan/glossary links valid. Update the local checklist and Figma guide as working notes.
8. [x] Run structural/content/export checks, inspect visible PNGs, and compare against the preserved source. Stage only the agreed branch scope. Standards and Spec reviews found no issues. Prepare the authorized local commit with a single-line message following the team style, plus a local PR draft and compare link for later use. Pushing remains unauthorized; never create a PR.

## Measured implementation results

- Renderer calibration: source 781 → PNG 362 × 782 (fails); source 784 → PNG 362 × 784 (fails); source 785 → PNG 362 × 785 (passes). The common source minimum is **785px**.
- All nine resized screen exports measure **362 × 785**; pages 17–19 remain **362 × 796** after connector cleanup.
- Page 10 shade height is 785px. The 456px panel group moves from y=276 to y=329; its bottom remains exactly against the source screen bottom. Child geometry is unchanged.
- Twelve affected exports are refreshed; the other twelve PNG files remain byte-identical to the protected baseline. The source/XML pair is synchronized.
- The unrelated local PR-draft/body `.gitignore` additions are preserved unstaged and excluded from this branch's implementation commit.
- There is no runnable app or dependency manifest yet, so application typechecking and app test suites are not applicable. Verification uses the standard-library wireframe harness, a focused read-only phone-height/layout check, and visual inspection of actual renderer outputs.
- Both verification helpers and staged whitespace checks pass. Standards and Spec reviews report no findings; live Figma acceptance remains with the assembler. The local PR draft is `/private/tmp/careerhive-phone-height-pr-draft.md`, outside Git.

## Figma handoff and acceptance

The Figma assembler retains ownership of device presentation, hotspots, interactions, and live prototype tests. Implementation in draw.io does not certify that those interactions work.

- Create the outer phone viewport using the iPhone 14/15 Pro preset, 393 × 852, and select the matching device presentation. Exact current preset availability still needs confirmation in the team's editable Figma session; the official documentation confirms this preset workflow.
- Set PNG width proportionally to the viewport; retain its full height. Keep matching hotspots in the same scrolling content container.
- Enable Clip content and vertical overflow for long pages. Keep the device exterior outside the scrolling content. Do not fit the full long PNG to the phone height.
- The user chose Figma-owned notch/status-bar/home-indicator clearance. Add any needed presentation insets in Figma, keep source artwork and its hotspots aligned within the resulting inner scrolling container, and inspect the actual device preview. Do not add top padding or reflow the source layouts.
- Test a short account screen, Browse/Filters, Deadlines, Profile, and a long tracker screen. Each image should cover the available viewport without a bottom gap. Content extending beyond the inner viewport, including after safe-area insets, must reach its bottom through scrolling with correctly aligned hotspots. Do not require short forms to avoid scrolling if the safe-area insets reduce their visible height.

## Verification gates

- All source screen widths remain 360px and every wireframe PNG remains 362px wide.
- No source screen or PNG is below the calibrated minimum; longer source heights are unchanged.
- Saved source, XML, and corresponding embedded PNG pages agree across all 24 pages.
- Background/dimming bounds cover their screens; the Filters panel stays bottom-anchored with unchanged child dimensions.
- Existing content positions remain unchanged except for agreed whole-group anchoring movements; no ellipses/rounded controls are introduced.
- Page names/IDs, tracker preview counts, and page 24's expanded Saved content remain unchanged.
- Existing page 17 removal survives synchronization, and the two agreed matching connectors on pages 18–19 are absent. Stage markers and labels are unchanged.
- Local documentation links and `git diff --check` pass. The local harness remains excluded from Git.
- New Figma live-device/scroll/hotspot evidence is recorded separately; no unsupported claim that full Sprint 0 is complete.

## Interview decisions and acceptance ownership

| Decision | Agreed answer |
| --- | --- |
| Phone approach | iPhone 15 Pro / documented iPhone 14/15 Pro preset, 393 × 852 portrait viewport. |
| Source layout | Add empty space below short screens; preserve existing content positions and sizes. |
| Filters overlay | Extend the shade and move the unchanged panel group down to remain bottom-anchored. |
| Timeline consistency | Preserve the user's page 17 removal and remove the matching connectors on pages 18–19. |
| Safe areas | Handle notch/status-bar/home-indicator clearance entirely in Figma; no source top inset/reflow. |
| Long pages and page 24 | Keep their heights and expansion content; use Figma scrolling. |
| Validation ownership | Branch implementer verifies source/XML/PNG assets; the prototype assembler supplies live device/scroll/hotspot evidence. |

No user design decisions remain open for this branch. The calibrated source minimum is confirmed at 785px. The exact current preset/device preview still needs verification in the team's editable Figma session; that is not a reason to guess or alter the agreed source layout.

## Execution checks

Run `python3 .local-harness/verify_wireframes.py` and `git diff --check` after synchronization; both should pass. The local harness now enforces the new minimum; the focused local phone-height check also compares against the protected branch base. Independently inspect every PNG IHDR: width must be 362px and height at least 785px. For each export, verify `height × 393 / 362 >= 852` as the full-phone coverage criterion before any Figma-owned inset is added.

Compare the saved drawing against the protected baseline by stable page/cell IDs. Accept only the nine screen-height changes, page 10 shade height and whole-panel vertical translation, and the three agreed connector removals. Existing square markers, text, cards, page names, widths, and long-page heights must remain unchanged. Visually inspect the affected PNGs for bottom whitespace, panel anchoring, clipping, and correct screen identity.

When an authorized commit/push is requested, stage exact in-scope paths and verify `git diff --cached --check` plus the staged file list. Use a single-line message such as `adjust short wireframes for the phone viewport and remove timeline lines`. Exclude the local harness, agent instructions, temporary notes, and unrelated ignore changes. Never create a PR; prepare a filled description and compare link for the user.

No ADR is needed for the preset choice at this point: it is a reversible presentation decision. Record the chosen dimensions and their rationale here rather than creating an architectural decision document unnecessarily.

## References

- [Figma's documented iPhone 14/15 Pro preset workflow](https://help.figma.com/hc/en-us/articles/16118297069463-Create-a-photo-gallery-prototype)
- [Prototype device settings](https://help.figma.com/hc/en-us/articles/21158597546391-Set-prototype-device-and-background-settings)
- [Prototype scrolling](https://help.figma.com/hc/en-us/articles/360039818734-Prototype-scroll-and-overflow-behavior)
- [Existing UX documentation](../../UX-DESIGN.md)
- [Prototype handoff](./HANDOFF.md)
