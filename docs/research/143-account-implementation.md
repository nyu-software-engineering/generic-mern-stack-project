# Account and profile implementation research

Source audit: November 20, 2026, at master `306fc2a`. Follow the [approved NYU design](../design/2026-11-18-nyu-redesign-design.md) and [DESIGN.md](../../DESIGN.md). This document records source behavior. It does not claim browser verification.

## Scope and boundaries

#143 covers `Welcome`, `Login`, `Signup`, `VerifyEmail`, `SetupProfile`, and `Profile` under `front-end/src/pages/auth/`. #92 has merged its backend account routes. #94 still owns connecting these frontend pages and `AuthProvider` to that API. #139 owns real password recovery, whose contract is not agreed yet. Do not add a second account store, fake recovery link, backend integration, new password policy, or pretend network states in this styling slice.

## Routes and exact behavior

| Route | Current contract |
| --- | --- |
| `/` | `Welcome()` links to `/signup` and `/login`. No redirect or request. |
| `/login` | `Login()` reads named fields `email` and `password`. Email is trimmed and lowercased. Native required and email validation runs first. The submit handler requires `email.endsWith('@nyu.edu')`, otherwise sets the NYU email message. It calls `signIn(email)` and navigates to `/browse`. Password is required by the input but is not read or checked by the handler. |
| `/signup` | `Signup()` reads `fullName`, `email`, and `password`. It trims the name and trims/lowercases email. Native required, email, and `minLength={8}` password checks run first. The handler rejects a blank trimmed name and a non-NYU email. It calls `signIn(email, fullName)` and navigates to `/verify-email`. Any form change clears its message. Back links to `/`; the alternative links to `/login`. |
| `/verify-email` | `VerifyEmail()` redirects signed-out users to `/signup` with replace. Controlled `code` starts empty and has `maxLength={6}`, numeric input mode, and required. Submit accepts any six digits through `/^\d{6}$/`; invalid input sets the code message. Success calls `verifyEmail()` then opens `/setup-profile`. Changing code clears feedback. Resend clears code and says no verification email is sent. Back links to `/signup`. |
| `/setup-profile` | `SetupProfile()` redirects signed-out users to `/signup` with replace and unverified users to `/verify-email` with replace. It reads named `displayName` and `campusArea`, trims both, and rejects either blank value. Both fields are required and prefilled from the current user. Success calls `updateProfile(displayName, campusArea)` and opens `/browse`. Any form change clears its message. Back links to `/verify-email`, including when editing a profile. |
| `/profile` | `Profile()` redirects signed-out users to `/login` with replace. It shows `displayName || email`, email, optional campus area, and a verification label. Renter links go to `/requests-board` and `/renter-dashboard`. Owner links go to `/listings` and `/owner-dashboard`. Other links are `/users/${CURRENT_USER_ID}/reputation`, `/inbox`, `/community-rules`, `/report`, and `/setup-profile`. Sign out calls `signOut()` then opens `/`. |

Keep field names, callback arguments, destinations, native constraints, and route guards. Do not replace the current email check with a new domain policy during visual work.

## Provider and data contracts

[AuthProvider.jsx](../../front-end/src/context/AuthProvider.jsx) exposes `currentUser`, `signIn(email, displayName='')`, `verifyEmail()`, `updateProfile(displayName, campusArea)`, and `signOut()` through [AuthContext.js](../../front-end/src/context/AuthContext.js). It owns React state only. There are no account API calls, tokens, localStorage writes, promises, pending states, or delivery failures.

`signIn` reuses `profiles[email]` if present. Otherwise it creates `{email, displayName, campusArea:'', emailVerified:false}`. Verification and profile updates replace the current user and its saved profile. Sign out clears only `currentUser`; profiles remain available until reload. Reload clears both states. Preserve these methods and their synchronous signatures.

[main.jsx](../../front-end/src/main.jsx) wraps the app in the provider and StrictMode. [App.jsx](../../front-end/src/App.jsx) places Profile inside the existing `MockData` boundary. Welcome and all four account forms are outside it. Profile can show shared data loading, failure, and retry before it renders its own redirect. Keep that route boundary.

[Navbar.jsx](../../front-end/src/components/Navbar.jsx) reads the same provider. It shows the compact phone header and one bottom bar whenever `currentUser` exists, including verification and setup. It hides both signed-in navigation groups after sign out. Preserve navigation destinations and bottom clearance.

## Copy and evidence limits

The current frontend does not authenticate passwords or deliver verification emails. Login and signup should disclose that account access is simulated and account data resets on reload. Verification should explain that any six-digit code completes this demo. Its current heading “Check your NYU inbox” conflicts with its own resend notice. Use a heading and action text that match the simulated behavior while retaining the callback.

Profile's “Verified NYU” label does not prove university identity. Its “Not rated yet · 0 completed rentals” is fixed copy, not data for the current account. Remove unsupported counts and label the simulated email state honestly. Retain the existing “View demo reputation” destination, which uses the shared `owner-1` identity rather than the account email. Setup asks only for campus area, so explain the level of detail needed instead of claiming privacy guarantees about an address or phone number the form does not collect.

## Existing CSS and reusable styles

- `index.css:244` onward defines broad `.auth-page` Tailwind rules. These force a narrow white frame, blue buttons and links, small typography, and a full viewport minimum height beneath the global header. Use a new scoped journey class instead of extending those global selectors.
- [welcome.css](../../front-end/src/pages/auth/welcome.css) caps Welcome at 390px and uses separate black buttons and blue focus. It also contains an unused image placeholder rule. Replace its page layout and controls with shared tokens.
- Profile imports both `booking/booking.css` and `profile.css`. It uses legacy `.booking-page`, `.booking-card`, `.booking-actions`, `.booking-btn`, and `.booking-note`. Its red sign-out link has no comfortable target height. Move Profile to its own scoped journey styles so booking CSS no longer supplies its visual contract.
- [design-system.css](../../front-end/src/styles/design-system.css) provides `.ds-page`, `.ds-heading`, `.ds-button` with primary and secondary variants, `.ds-field`, `.ds-feedback` with error variant, `.ds-status`, and `.ds-text-link`. It also defines color, font, 600px form width, 720px reading width, 1184px page width, 16/24/32px gutters, 44px controls, visible violet focus, and the signed-in phone navigation allowance.

Use those primitives and one scoped account stylesheet for form surfaces, readable supporting copy, field groups, account actions, and profile sections. Keep a useful wide Welcome layout and a focused form column. Stack actions and wrap long names and emails on phones. Avoid changing global listing, booking, navigation, or provider styles.

## Validation presentation

Keep native required, email, and password-length checks. Associate each custom error with the field that caused it using stable IDs, `aria-describedby`, and `aria-invalid`. Focus the first invalid field after custom validation. Invalid input must retain values. Existing controls support `autoComplete`: `name`, `email` or `username`, `current-password`, `new-password`, `one-time-code`, and `nickname` where appropriate. Campus area should not request a full postal address.

Resend is demo feedback, so distinguish its status notice from invalid-code errors. There is no real pending state to simulate. Style the shared disabled primitive for future integration without introducing artificial delays or promises.

## Verification handoff

The frontend has service tests under `front-end/test/`, but no dedicated account DOM or provider tests. The backend account tests cover the separate API and cannot establish frontend account behavior. Run the full frontend suite, lint, and build after the changes.

Browser checks should cover all six views at 320, 375, 390, 768, 1024, and 1366px. Use long and unbroken names, email addresses, and campus text. Check enlarged text, form labels, autocomplete, focus outlines, 44px actions, and signed-in bottom navigation clearance. A short viewport can check reduced space but does not prove physical keyboard support.

Exercise signed-out verification/setup/profile redirects; required and malformed email constraints; non-NYU errors; whitespace name/area errors; the eight-character signup password constraint; invalid and valid demo codes; resend clearing the code; signup through setup; login to Browse; prefilled profile editing; sign out; and signing in again to the same in-memory profile. Record the current reload behavior rather than promising persistence. Test Profile's shared data failure and retry separately. Save desktop and phone screenshots using synthetic accounts. Physical devices and the final cross-app zoom pass stay under #148.
