# Leverage front-end: visual style

Every screen uses the same colors, type and components so the app looks like one product.

## Rules

- **Square corners only.** Never use `rounded-*` classes. `index.css` forces `border-radius: 0` on everything (professor's Sprint 0 feedback).
- **Colors:** only use our tokens: `ink` (main text), `muted` (secondary text), `line` (borders), `canvas` (page background), `surface` (cards, inputs), `accent` (main buttons, highlights), `accent-soft` (light highlight background), `positive` (good), `negative` (bad). Example: `text-muted`, `border-line`, `bg-accent`. Don't use Tailwind's default palette (`gray-500`, `blue-600`, ...).
- **Font:** Inter, loaded in `index.html`.
- **Type scale:** screen title `ScreenTitle` (text-2xl semibold), section label `SectionTitle` (text-xs uppercase), body text-base, secondary text text-sm text-muted.
- **Rent changes:** `PercentChange` shows increases in red and decreases in green, because for a renter rising rent is bad news.

## Shared components (`src/components/ui/`)

| Component | Use it for | Example |
|---|---|---|
| `ScreenTitle` | The title at the top of every screen | `<ScreenTitle title="Followed areas" subtitle="..." />` |
| `SectionTitle` | Small label above a group of content | `<SectionTitle>Popular areas</SectionTitle>` |
| `Button` | Every button. `variant` is `primary` (default), `secondary` or `ghost`. Pass `to` to navigate or `onClick` for actions | `<Button to="/check">Check an apartment</Button>` |
| `Card` | Every boxed item. Pass `to` to make it a link | `<Card to="/followed-areas">...</Card>` |
| `TextField` | Every labeled text input | `<TextField label="Email" id="email" type="email" value={email} onChange={...} />` |
| `Toggle` | On/off switches | `<Toggle checked={on} onChange={setOn} label="Share income" />` |
| `PercentChange` | A rent change percentage | `<PercentChange value={4.8} />` |

Screen padding and the top bar come from the layout, so screens don't add their own outer padding.