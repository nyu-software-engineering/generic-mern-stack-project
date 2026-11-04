# Frontend Sprint Scope and Shared Interface Baseline

**Status:** Proposal for David and the team's review, November 2, 2026. The proposal preceded implementation. David subsequently authorized the bounded shared-style pass in #61; Browse/Details now share the page-title role and the new controls consume shared CSS values. No prototype was changed; wider team adoption is pending. This records assignment requirements separately from suggested team choices; it is not a claim that the team has approved a new design.

## What changes between Sprint 0 and Sprint 1

| Stage | Required deliverable | Visual constraints |
| --- | --- | --- |
| [Sprint 0A](../../../instructions-0a-app-map-wireframes.md) | App map and mobile wireframes covering screens and dynamic states. | Dummy content; gray boxes for images; no photographs, icons, or other graphic elements. Keep repeated controls in matching positions and annotations in UX-DESIGN.md. This did not prohibit UX design: layout, hierarchy, content placement, and interaction design were the work. |
| [Sprint 0B](../../../instructions-0b-prototyping.md) | Clickable mobile prototype built from those wireframes. | Navigation and overlay triggers must work; additional variants may be needed to demonstrate the flows. |
| [Sprint 1](../../../instructions-1-front-end.md) | A working, custom-designed React frontend, with all intended screens and dynamic frontend behavior backed by mock data. | Clean, contemporary finished UI rather than a wireframe. Closely follow the prototype's structure/flows; explain differences at the demo. Use the permitted random-image/mock tools. The Sprint 0 ban on actual images/icons does not become a Sprint 1 UI ban. |

Sprint 1 requires function components and JSX, Vite, setup/run documentation, and no committed secrets. React Context is allowed; Redux/MobX, other build tools, Bootstrap/Material UI, Next.js, and SSR frameworks are prohibited. Tailwind/Shadcn are allowed, but this project already uses plain CSS and needs no additional styling dependency to finish.

## Whole-team frontend scope

The 24 saved wireframes include variants and overlays; they do not require 24 separate routes or 24 duplicated page components. Required screen families and behavior come from the latest agreed MVP and UX-DESIGN.md:

- Welcome, Log In, Sign Up, their visible states, and Profile Setup. Authentication screens may remain nonfunctional under the assignment; real server authentication is not required now.
- Home, common signed-in navigation/menu, summaries, and links to the right records.
- Browse, search, sorts, filters/chips/reset, result counts, and all returned job cards; correct Job Details, Save to Tracker, mock match analysis, discussion/list/topic filtering, and New Post.
- Tracker stage totals/previews/expansion/filter/sort; selected Application Details, stage/history updates, notes, and remove confirmation with related state updates.
- Deadlines and period tabs; profile display/edit/save/cancel, skill/role/location controls, and the agreed Change Photo interaction. Camera/album capture screens are outside the recorded agreed scope; their absence is not permission to leave an agreed visible control pretending to work.
- Loading, failure/retry, empty/no-match, missing-record, form error, and successful action states wherever those flows need them.

Existing deferred prototype states are gaps to explain/design when implementing, not exemptions from Sprint 1's dynamic-functionality rule. Track changes in UX-DESIGN.md in the relevant PR, agree them with the team, and mention them at the stakeholder demo. David's four Browse plans are only one slice of this whole-team scope.

Express routes/integration belong to Sprint 2; MongoDB Atlas/Mongoose persistence belongs to Sprint 3. Neither live AI nor a database is a dependency for Sprint 1.

## Proposed visual baseline

Keep the existing Browse/Details visual direction. These values are a proposal based on current code, not an instructor-prescribed palette or a new branding project.

| Item | Shared value/rule |
| --- | --- |
| Surface and text | White `#ffffff`; main text `#202328`; muted text `#555b64`; border `#d4d7db`; neutral loading surface `#f0f1f2`. |
| Accent | Existing honey surface `#f6edcc` with dark honey text `#634900`; focus/border accent `#7b5900`. Use labels and shapes as well as color to communicate status. |
| Font | Existing system stack: system-ui, -apple-system, Segoe UI, Roboto, sans-serif. Body and form inputs 16px, normal body line-height 1.5. No new remote font dependency. |
| Type hierarchy | Page title 24px/1.25, section heading 18px/1.4, card title 16px/1.35; metadata 14px/1.5, supporting labels 12px/1.5. Use semantic h1/h2/h3 levels; visual roles can be reused regardless of heading level. Long job titles wrap. |
| Spacing | Shared scale 4, 8, 12, 16, 24, 32px. Page gutters 16px, card padding 16px, list gaps 12px, major section gaps 24px. |
| Shape | Square cards, buttons, panels, and stage/history indicators, retaining the team's existing UX convention. Form choice semantics remain standard radio/checkbox behavior; never change a single-choice stage control into multi-select for visual reasons. |
| Controls | One dark primary button, one outlined secondary style, and one underlined text-link style. Minimum 44px interactive height/target; visible focus outline. Inputs/selects share typography, border, padding, labels, and disabled/error treatment. |
| Chips | Use real removable buttons with a clear selected label and accessible Remove label; consistent target size, spacing, wrapping, and removal behavior across Browse/profile/discussion as appropriate to each feature. |
| Images | Use the agreed external mock-image source with stable seeds, fixed reserved dimensions, object-fit, meaningful alt text when informative, and a nonblocking neutral fallback. Do not use broken images as the only indication of identity. |
| Motion | Only simple open/close feedback if needed. No animation package, decorative gradients, new card system, or per-page visual theme. Respect reduced-motion preference if transitions are introduced. |

Use shared CSS variables and a small set of reusable classes in the existing stylesheet organization. Extract a shared React component only when there is a repeated interface/behavior to share; do not build a component framework for four tasks. Do not copy the same button/field/overlay rules into each page.

## Proposed structural baseline

- **One app shell:** the #49 owner coordinates the common container, signed-in header/menu, navigation, and route identity. Pages render their content inside it, rather than each declaring another `main.app` or another CareerHive header. Account screens share the container/type/spacing rules but do not show signed-in controls.
- **One main landmark and page title:** site brand is header content; the current page or selected job is the h1. Page sections have consistent heading and spacing roles.
- **Mobile first:** acceptance target 393 × 852; also check 360px width, larger text, long content, and a wider browser. Keep the current centered max-width 430px container unless the team agrees another layout. Content scrolls naturally; never fix a page's height to the screenshot or hide results to imitate four example cards.
- **Real safe areas:** use the browser viewport and safe-area insets where needed. Do not reproduce Figma's artificial 54px status-bar area or phone bezel inside the web page.
- **One overlay pattern:** Filters is the designed bottom sheet. New sheet/dialog work should reuse the same spacing, heading/close/action arrangement, backdrop, focus containment/restoration, Escape rules, background scroll handling, and independently scrollable content. Match other overlays' intended position/form factor rather than converting all popups to bottom sheets. Backdrop dismissal must be specified per flow; destructive forms must not silently lose entered data.
- **Lists and details:** keep source records in shared access/state, derive visible lists, and pass stable IDs through routes. Store application identity separately from job identity. A detail view never shows a stale previous record during loading/error.
- **Filters and selection:** job type/location choices use consistent checkbox rows inside the filter sheet; a single deadline/sort uses a labelled native select. Selected categories combine according to the reviewed plans, not different page-specific rules.
- **Shared states:** consistent placement and typography for loading, error/retry, empty/no-match, disabled actions, and form errors. Announce meaningful result/error updates accessibly without moving focus on every keystroke. A successful empty feed is different from a filter producing no matches.

Consistency means the same shared elements and behavior across pages; it does not mean forcing forms, dashboards, and long job descriptions into identical content layouts.

## Existing differences to resolve through implementation/review

- Browse's current title is 1.65rem while Job Details uses 1.45rem. Apply one shared page-title role when the baseline is approved.
- Tony's inspected Tracker branch owns a `main.app` and a CareerHive h1, and its controls are not styled through the current Browse/Details rules. Adapt those at shared-layout integration; do not overwrite his branch or create duplicate shells.
- The current demo header is not the finished signed-in menu/header from #49. Do not describe it as the final global navigation.
- The saved prototype has selector/result states still deferred. Record the reviewed live-filter behavior, initial selections, deadline options, location control changes, and other intentional differences in UX-DESIGN.md.
- Do not call all pages visually aligned until the integrated pages have been inspected together; the baseline document alone does not fix them.

## Adoption and acceptance before the deadline

1. David reviews the proposal; share the common rules with the #49/#44/#46 owners and the team through the existing team workflow. This document does not send any messages or record their agreement.
2. Add a small baseline step to #61: shared CSS values/roles, matching Browse and existing Details titles, then build the new filter controls from those same rules. This is a bounded consistency change, not a redesign of teammates' unfinished features.
3. Apply the same rules in #62–#64. Coordinate other screen adoption with their existing owners and #49; it is not automatically included in David's Browse estimates.
4. Each UI review checks normal, loading/error/empty, long content, selected/disabled, and overlay-open states at 393 × 852. Check 360px wrapping, keyboard focus/return, readable contrast, and clickable targets as part of the browser review.
5. Inspect an integrated screenshot set: Home, Browse, Job Details, Tracker, Application Details, Deadlines, Profile, an account form, and representative overlays. Compare shell position, titles, gutters, card/action styles, images, and state presentation. Run the critical cross-page flows and the repository checks.
6. Record what was actually checked, remaining differences, and owner actions. Explain prototype differences at the demo; do not mark an issue done solely because CSS or tests pass.

**Effort impact:** roughly 0.5–1.5 additional focused hours for David's small shared-style pass and plan reconciliation. Whole-team page adoption/review may take longer and needs each owner's participation. The previous Browse-only estimate becomes approximately 10–17 hours including its integration/testing reserve, plus Product Owner coordination; this is not an estimate for finishing the entire team's frontend.
