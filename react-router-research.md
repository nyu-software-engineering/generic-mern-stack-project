# React Router and Navigation — Research (Spike #57)

Sources: React Router documentation (current release line: v8, with v7 still maintained), the repo's UX-DESIGN.md and ux-design/ wireframes (21 screens), and the Sprint 1 issue set (#29–#52).

## Recommendation in one paragraph

Use **React Router in Declarative mode** — `BrowserRouter` + `Routes`/`Route` in App.jsx, installed as the single `react-router` package. Define **16 page routes** matching the wireframe screens, treat the 5 dialogs/overlays/success states as in-page component state (not routes), and structure shared navigation as **one layout route for signed-in screens with the bottom tab bar from the design (People / Events / Connect / Profile)**, rendered via a Layout component with `<Outlet />`. Auth and onboarding screens sit outside that layout with no tab bar.

## Library, version, and mode

- **Install:** `npm install react-router`. Since v7, `react-router-dom` is no longer a separate package — everything imports from `react-router`.
- **Version:** v8.5.0 (the current v8 release; v7 is also still maintained). The Declarative-mode API used in this document (`BrowserRouter`, `Routes`, `Route`, `Outlet`, `Link`, `NavLink`, `useNavigate`, `useParams`, `Navigate`) is identical on v7 and v8, so the routing approach below does not change with either. **Minimum versions for v8, confirmed against the official React Router v8 upgrade guide: Node 22.22+, React and React DOM 19.2.7+, and Vite 7+** (the Vite minimum is a Framework-mode requirement; our Declarative mode doesn't use the Vite plugin, but a fresh `npm create vite@latest` scaffold satisfies all three baselines anyway). If the scaffold ever has to pin older versions, install v7 instead.
- **Mode: Declarative.** React Router offers three modes. Framework mode (the Remix-style Vite plugin, SSR/prerendering) is **not allowed** for this course (no SSR) and is unnecessary here. Data mode (`createBrowserRouter` with loaders/actions) is built for server data; Sprint 1 runs entirely on mock data and React state, so it adds machinery we don't need. Declarative mode is the v6-style component routing the whole team already knows.

## The routes (16)

Grounding: one route per full screen in UX-DESIGN.md. Component names and owners are the Sprint 1 task issues.

| Route | Screen (wireframe) | Component | Owner (issue) |
|---|---|---|---|
| `/` | 01 Welcome | Welcome.jsx | Alpartun (#41) |
| `/login` | 03 Log In | Login.jsx | Alpartun (#42) |
| `/register` | 02 Sign Up | Register.jsx | Alpartun (#42) |
| `/select-interests` | 04 Interests onboarding | SelectInterests.jsx | Alpartun (#43) |
| `/setup-profile` | 05 Setup profile | SetupProfile.jsx | Alpartun (#44) |
| `/discover` | 06 Discover people | DiscoverPeople.jsx | Elize (#29) |
| `/people/:personId` | 07 Person profile | PersonDetails.jsx | Elize (#30) |
| `/events` | 08 Events feed | Explore.jsx | Elize (#31) |
| `/events/new` | 12 Create event | CreateEvent.jsx | Maurice (#37) |
| `/events/:eventId` | 09 Event details | EventDetails.jsx | Maurice (#35) |
| `/events/:eventId/edit` | 21 Edit event | EditEvent.jsx | Alp (#39) |
| `/events/:eventId/manage` | 18 Event management | EventManagement.jsx | Maurice (#38) |
| `/my-events` | 14 My events | MyEvents.jsx | Maurice (#38) |
| `/connections` | 13 Connections | Connections.jsx | Alpartun (#47) |
| `/profile` | 15 My profile | Profile.jsx | Alp (#45) |
| `/profile/edit` | 16 Edit profile | EditProfile.jsx | Alp (#46) |
| `*` | — (catch-all) | NotFound or redirect to `/` | Elize (#49) |

Notes:
- React Router ranks static segments above dynamic ones, so `/events/new` correctly wins over `/events/:eventId` regardless of declaration order.
- Param names to agree on as a team: `:personId` and `:eventId`, read with `useParams()`.
- `/events/:eventId/manage` is the host's Event Management screen (attendee list, Edit event / Cancel event actions), with its own component, **EventManagement.jsx**. It is the entry point to Alp's #39 (edit) and #40 (cancel confirmation). (Decided: it is its own route and component, not a view inside MyEvents — consistent with the App.jsx skeleton below.)

## Not routes: dialogs, overlays, and success states (5)

These wireframes are states of a parent screen, not pages. Building them as component state (shown/hidden) matches the prototype and avoids fake URLs:

- **10 Join event confirmation** — dialog over Event Details (Maurice, #36).
- **11 Event joined** — success state after confirming RSVP; its buttons navigate to `/my-events` or `/events` (Maurice, #36).
- **17 Filters overlay** — overlay over Discover People / Events feed (Alp, #34). Filter selections live in the page's React state. (Optional later: mirror search/filter in URL search params so a filtered view is shareable — not needed for Sprint 1.)
- **19 Cancel event confirmation** — dialog over Event Management (Alp, #40).
- **20 Leave event confirmation** — dialog over Event Details / My Events (Maurice, #36).

## Shared navigation structure

UX-DESIGN.md states the pattern: *"Signed-in screens consistently show the bottom navigation options for People, Events, Connect, and Profile."* Implement it as a **layout route**:

- **Layout group A — no tab bar:** `/`, `/login`, `/register`, `/select-interests`, `/setup-profile` (entry + onboarding; the design shows no bottom nav here).
- **Layout group B — main layout (Layout.jsx, Elize #50):** all other routes nested under one parent route whose element is the Layout. Layout renders the bottom tab bar (Navbar.jsx) plus `<Outlet />` for the current page, so the bar is written once and every signed-in screen gets it.
  - Tabs: **People → `/discover`**, **Events → `/events`**, **Connect → `/connections`**, **Profile → `/profile`**. Use `NavLink` so the active tab gets its active styling automatically.
  - My Events is not a tab in the design; it is reached from Profile ("My events"), from the Event Joined success state, and after publishing an event.
- **No auth guard in Sprint 1 (decided):** Sprint 1 has no real back-end auth, and the professor allows nonfunctional authentication for Sprint 1 — so we **skip `ProtectedRoute`**: every screen is directly reachable, which also makes testing easier. A mock guard (signed-in state in Context, redirecting group B to `/`) can be added later when real auth lands; it is deliberately not built now.

## Navigation patterns (how screens move)

- **Tabs and in-content links:** `<Link>` / `<NavLink>` (person card → `/people/:personId`; event card → `/events/:eventId`; "View profile", "Create event" button → `/events/new`; Profile's "Edit profile" → `/profile/edit`).
- **After actions, use `useNavigate()`:** log in → `/discover`; register → `/select-interests` → (Next) `/setup-profile` → (Finish setup) `/discover`; publish event → `/my-events`; RSVP confirmed → joined state → `/my-events`; save profile edit → `/profile`; save event edit → back to the event/manage view.
- **Back behavior:** detail screens' back arrows use `navigate(-1)` so users return to whichever list they came from (Discover vs. My Events), instead of a hard-coded parent. **Fallback:** `navigate(-1)` only works when there is an in-app history entry. If a user lands directly on a detail screen (deep link, refresh, shared link), there may be nothing in-app to go back to and the browser can leave the app entirely. Guard the back action: when an in-app history entry exists, `navigate(-1)`; otherwise navigate to the screen's default parent (event details/manage → `/events` or `/my-events`, person profile → `/discover`).

## App.jsx skeleton (for Elize's #49)

```jsx
import { BrowserRouter, Routes, Route } from 'react-router'
// ...page imports...

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Group A: entry + onboarding, no tab bar */}
        <Route path="/" element={<Welcome />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/select-interests" element={<SelectInterests />} />
        <Route path="/setup-profile" element={<SetupProfile />} />

        {/* Group B: signed-in screens inside the shared Layout */}
        <Route element={<Layout />}>
          <Route path="/discover" element={<DiscoverPeople />} />
          <Route path="/people/:personId" element={<PersonDetails />} />
          <Route path="/events" element={<Explore />} />
          <Route path="/events/new" element={<CreateEvent />} />
          <Route path="/events/:eventId" element={<EventDetails />} />
          <Route path="/events/:eventId/edit" element={<EditEvent />} />
          <Route path="/events/:eventId/manage" element={<EventManagement />} />
          <Route path="/my-events" element={<MyEvents />} />
          <Route path="/connections" element={<Connections />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/profile/edit" element={<EditProfile />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  )
}
```

Layout.jsx renders `<Navbar />` (bottom tab bar) + `<Outlet />`. main.jsx stays as the Vite default (renders `<App />`); the router lives entirely in App.jsx, matching #49's scope.

## Open questions for the team

1. **Signed-in landing:** should `/` redirect a signed-in user to `/discover`, or always show Welcome?
2. **Search/filters in the URL:** keep in page state for Sprint 1 (recommended), or use search params from the start?

(Decided since the first draft, per team review: Event Management is its own route with its own EventManagement.jsx component, and Sprint 1 skips ProtectedRoute — all screens are directly reachable for testing.)

## Handoff

- Elize: #49 implements App.jsx from the route table; #50 builds Layout.jsx + Navbar.jsx (bottom tabs) to the structure above.
- Everyone: build pages against the agreed param names (`:personId`, `:eventId`) and the post-action navigation flows, so integration (#52, Maurice) is wiring, not redesign.
