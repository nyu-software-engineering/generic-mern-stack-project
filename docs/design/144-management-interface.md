# Listings and dashboard interface contract

Approved scope: #144 under the [light marketplace design](2026-11-18-nyu-redesign-design.md). Research: [current contracts](../research/144-management-implementation.md). Base is `cb1c882`, the #154 source branch.

## Components and data

Keep `MyListings({ initialFormOpen = false })`, `CreateListing()`, `OwnerDashboard()`, `RenterDashboard()`, and private `RentalActivity()` responsibilities. Keep every service and provider signature unchanged. Do not move fetching into new components.

Listing fields remain `{ id, ownerId, title, category, description, price, rentalTerms, status }`. Prices are numeric and can be zero. Owner results remain `{ summary: { totalRentals, activeRentals, recordedIncome }, rentals }`. Rows include listing title and borrower name. Renter rows retain listing title, dates, total, status, and booking ID.

Reuse the existing `StatusBadge({ status })` in the two dashboards. Do not change its global CSS. A scoped `.ds-management .status-badge` rule can refine its spacing and focus remains on interactive elements. Listing states keep explicit words in their own scoped pills.

## Scoped layout

Add `front-end/src/styles/management.css`, imported by the three page components. It defines `.ds-management` page heading/actions, `.ds-management-filters` with visible labels, `.ds-management-section`, `.ds-management-list`, `.ds-management-row`, `.ds-management-actions`, `.ds-management-meta`, `.ds-management-empty`, and `.ds-management-summary`. Reuse existing `.ds-*` tokens and control/feedback classes. Desktop summary is three simple cells in one surface, phone summary stacks. Rental rows stack on phones and retain all actions.

Keep listing-specific styles in `pages/listings/listings.css`, imported by MyListings. Its form, preview, item image, listing row, error, and status classes start with `.ds-listing-`. Forms remain inline, not modal. Desktop can use two columns for short fields with full-width description and terms. Phone fields stack. Preserve full readable terms and long names.

## Validation feedback

Add a plain helper `validateListingForm(form)` in `pages/listings/listingForm.js`. Input fields are strings. Output is a plain object with optional `title`, `category`, `description`, `price`, and `rentalTerms` messages. It reproduces the existing client checks: nonblank trimmed text, chosen category, nonblank finite nonnegative price. No new length, category membership, or price rules.

MyListings keeps a field-error object. On invalid save, set errors and focus the first invalid input. Associate each message through `aria-describedby` and `aria-invalid`. Clear a field's message when it changes, and clear all field errors on new/edit/cancel and successful save. The existing form rules, payload preparation, mutation ref, disabled logic, cache updates, and API error message remain unchanged. The helper throws no errors. Network failures remain `ApiError` from the unchanged service.

## Source ownership

- `styles/management.css`: shared scoped layout, implemented before page migrations.
- `pages/listings/MyListings.jsx`, `listings.css`, `listingForm.js`, `test/listingForm.test.js`: listing management and feedback.
- `pages/ownerDashboard/OwnerDashboard.jsx`: owner presentation only.
- `pages/renterDashboard/RenterDashboard.jsx`: renter and saved-item presentation only.
- Existing shared components, base styles, routes, providers, APIs, and backend files stay unchanged.

## Checks and boundaries

Keep owner totals from the server even when rows are filtered. Keep owner request ordering guards and retry reset. Keep renter overdue derivation, separate saved errors, per-item pending, and booking links. Do not add fake metrics, real image upload, data persistence, or auth behavior.

Test validation with real boundary inputs. Existing service tests cover the unchanged APIs. Browser checks cover the form, preview and status transitions, empty/error/pending states, all four routes at six sizes, long content, keyboard, saved state, totals, and direct links. No unit tests that mirror CSS.
