# Discovery interface contract for #142

This contract implements the approved Direction A design. It keeps the current React and plain JavaScript stack. Services and route definitions remain unchanged.

## Public interfaces

Keep these existing signatures:

- `Navbar()` reads `currentUser` and `signOut` from `AuthContext`.
- `ListingCard({ listing })` links to `/browse/:id`.
- `SaveListingButton({ listing, compact = false })` and `SavedItemsStatus()` retain their provider contracts.
- `Browse()` owns filters. `ListingResults({ search, category, onClear })` stays private.
- `ItemDetails()`, `ItemDetailsRequest({ id })`, and `ListingDetails({ listing })` keep their current responsibilities.

Add `Icon({ name, size = 20, className = '' })`. Supported names are `search`, `browse`, `requests`, `plus`, `messages`, `profile`, `bell`, `rentals`, `arrowLeft`, and `heart`. It renders inline SVG using `currentColor`, with `aria-hidden="true"` and `focusable="false"`. The surrounding link or button owns its readable name. Do not add an icon dependency.

Do not add a Feedback component. Existing status and alert markup has different recovery actions. Reuse scoped feedback classes instead.

Plain JavaScript shapes remain:

- Listing: `{ id, title, category, description, price, ownerId, rentalTerms }`. Price is numeric. Preserve any additional service fields.
- Navigation entry: `{ label, to, icon }`.
- Browse result: `null | { listings } | { error: string }`.
- Details result: `null | { listing } | { error: ApiError }`.

## Navigation

| Label | Existing route | Placement when signed in |
| --- | --- | --- |
| Browse | `/browse` | Desktop and phone bottom |
| Requests | `/requests-board` | Desktop and phone bottom |
| List an item / List | `/listings/new` | Desktop action / phone bottom |
| Messages | `/inbox` | Desktop and phone bottom |
| Profile | `/profile` | Desktop and phone bottom |
| Notifications | `/notifications` | Desktop and phone header |
| Rentals | `/renter-dashboard` | Desktop and phone header |

Profile already links to My Listings, owner tools, and reputation. Keep those links. Preserve desktop sign out and the existing Profile sign out on phones. Both retain `signOut()` followed by `/`. The brand opens `/browse` when signed in and `/` otherwise. Signed out remains brand only.

Use separate named navigation landmarks for desktop, phone header actions, and phone bottom navigation. CSS hides inactive layouts with `display: none`. Render exactly one phone bottom bar. Remove ReviewNavigation and its call sites rather than retaining another app menu.

Exact destination matches use `aria-current="page"`. Browse details use the Browse destination with `aria-current="location"`. No unrelated destination claims the current page. Selected links combine color with an underline or persistent marker. Links stay links. No menu dialog or new authentication behavior is needed.

## Styles and layout

Add `styles/design-system.css`, imported after `index.css` in `main.jsx`. Define `--ds-*` tokens for the approved palette, Helvetica stack, type sizes, spacing scale, radii, control border, focus ring, widths, and bottom navigation height. Use 768px and 1024px breakpoints. Provide `.ds-page`, `.ds-heading`, `.ds-button`, `.ds-button--primary`, `.ds-field`, `.ds-feedback`, `.ds-feedback--error`, `.ds-status`, and `.ds-icon`.

Use explicit classes on controls. Do not add broad button, input, heading, or card rules. Keep discovery layout under `.ds-discovery` and `.ds-item-details`. Add discovery card styling beneath `.ds-discovery`, preserving shared ListingCard behavior elsewhere. Scope phone bottom clearance through `#root:has(.ds-mobile-nav)` at phone widths, including `env(safe-area-inset-bottom)`.

## Behavior and errors

Preserve trimmed search, category conversion, debounce, remount keys, stale response guards, retries, save pending protection, and known saved state after failure. Preserve all loading, populated, empty, unavailable, and error states. Keep polite result counts, status roles, alert roles, required labels, visible focus, and 44px controls. Date errors connect to relevant fields using `aria-describedby` and `aria-invalid`.

Keep existing local date checks, estimate calculation, owner exclusions, image fallback, cache hydration, report query, and booking URL. `ApiError(message, status, errors)` remains unchanged. No network, provider, payload, enum, or access changes.

## Exact file plan

Add `front-end/src/styles/design-system.css` and `front-end/src/components/Icon.jsx`. Edit `main.jsx`, `components/Navbar.jsx`, `components/Navbar.css`, `components/ListingCard.jsx`, `components/SaveListingButton.jsx`, `pages/browse/Browse.jsx`, `pages/browse/ItemDetails.jsx`, and `pages/browse/browse.css`. Remove ReviewNavigation imports and rendering from `pages/reviews/Reputation.jsx` and `pages/reviews/ReviewParticipant.jsx`. Delete `pages/reviews/ReviewNavigation.jsx` and its navigation rules in `pages/reviews/reviews.css`. All these paths are beneath `front-end/src/`.

No dependencies, TypeScript migration, new data, review redesign, or changes to other journeys are included.
