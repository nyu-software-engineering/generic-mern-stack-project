# DormShare design direction

Direction A, the light campus marketplace, and the [written design specification](docs/design/2026-11-18-nyu-redesign-design.md) were approved by the owner on November 18, 2026.

## Visual identity

- White and light gray surfaces with dark gray text.
- NYU Violet `#57068C` for primary actions, links, and selected navigation.
- Deep Violet `#330662` for action hover and pressed states.
- Light Violet 2 `#EEE6F3` for selected surfaces.
- Ultra Violet `#8900E1` used sparingly.
- DormShare's own name and wordmark.

Official values and their usage sources are in the [brand research](docs/research/nyu-brand-guidelines.md). Exact spacing, breakpoints, control sizes, and layout rules are DormShare choices.

## Typography

Use `Helvetica, Arial, sans-serif` for the first implementation. This is the project's available fallback, not a claim that it is NYU's official website font stack. NYU Perstare is the current primary brand font. Switch the shared family token only after the project has the required website font access.

Use one family for interface text. Default body text is 16px with a 1.5 line height. Smaller 14px text is for labels and metadata. Keep paragraphs readable and avoid truncating essential terms or error messages.

## Layout and navigation

Use a shared page width and gutters, with narrower form and reading layouts where useful. Desktop Browse uses three listing columns. Phone Browse uses one column with flexible item summaries. Filters stack when they cannot fit.

Use one consistent phone bottom navigation: Browse, Requests, List, Messages, Profile. Keep Rentals and Notifications easy to reach in the compact header. Signed-out navigation follows the existing account state. Preserve current route access behavior while the separate authentication work proceeds.

## Controls and feedback

Share button, field, status, alert, loading, and empty-state patterns. Keep native controls where they work. Use text labels and visible keyboard focus. Preserve pending, disabled, error, and successful states and the services that provide them.

## Migration

Start with #142: shared foundation, Browse, and Item Details. Then move through #143 to #147 by journey. The route inventory is the coverage checklist. #148 owns the final mobile and cross-app checks.

Use small commits and separate PRs. Extract patterns when a migrated screen needs them. Do not introduce a component library or rewrite API services as part of the visual work.
