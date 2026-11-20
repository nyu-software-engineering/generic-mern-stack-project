# Account and profile interface contract

Use the [approved NYU direction](2026-11-18-nyu-redesign-design.md) and [account research](../research/143-account-implementation.md). The source baseline is master at `306fc2a`. This contract covers #143. Account API integration stays in #94. Password recovery stays in #139.

## Public interfaces and invariants

The six page components keep their existing no-prop signatures: `Welcome()`, `Login()`, `Signup()`, `VerifyEmail()`, `SetupProfile()`, and `Profile()`. Each returns its page markup or its existing route redirect. Each rendered page has one `main` and one `h1`.

`AuthContext` retains `currentUser` and these synchronous callbacks:

| Callback | Arguments | Result and invariant |
| --- | --- | --- |
| `signIn(email, displayName='')` | Normalized email string and optional name string | Returns no value. Selects the existing in-memory profile or creates the current demo profile. |
| `verifyEmail()` | None | Returns no value. Marks the current demo profile's email state confirmed. |
| `updateProfile(displayName, campusArea)` | Two trimmed strings | Returns no value. Updates the current profile without changing the account identity. |
| `signOut()` | None | Returns no value. Clears the current user while retaining profiles until reload. |

The current profile remains `{email, displayName, campusArea, emailVerified}`. No fields, services, provider methods, promises, errors, storage writes, or pending states are added. A reload still clears account state. Profile retains its existing `MockData` route boundary and its shared loading, error, and retry behavior.

## Routes and form contracts

| Page | Inputs and validation | Success and access |
| --- | --- | --- |
| Welcome | No form. Account links retain `/signup` and `/login`. | No redirect or request. |
| Login | Keep `email` and `password`, IDs `loginEmail` and `loginPassword`, native required and email checks, and the existing NYU suffix check. Email remains trimmed and lowercased. | Calls `signIn(email)` and opens `/browse`. Password remains required but unchecked by the demo provider. |
| Signup | Keep `fullName`, `email`, and `password` with their existing IDs. Keep required fields, email input, eight-character password minimum, trimmed name check, and NYU suffix check. | Calls `signIn(email, fullName)` and opens `/verify-email`. Back opens `/`; alternative sign-in opens `/login`. |
| VerifyEmail | Keep the controlled `code` field and ID, required state, numeric input mode, six-character maximum, and exact six-digit custom check. | Signed-out users go to `/signup` with replace. Success calls `verifyEmail()` and opens `/setup-profile`. Back remains `/signup`. Resend clears the code and reports that no email is sent. |
| SetupProfile | Keep `displayName` and `campusArea` with their existing IDs, current defaults, required constraints, and trimmed nonempty checks. | Signed-out users go to `/signup` with replace. Unverified users go to `/verify-email` with replace. Success calls `updateProfile(displayName, campusArea)` and opens `/browse`. Back remains `/verify-email`, including during editing. |
| Profile | No account edit form. Keep conditional campus area and `displayName || email`. | Signed-out users go to `/login` with replace. Every existing renter, owner, account, reputation, edit, and sign-out destination remains unchanged. |

Keep native browser validation enabled. Do not add a stricter email, password, name, code, or campus-area policy. Custom failures retain entered values and focus the first field that failed the existing rule. Login clears its custom email error when that field is edited, without moving focus. Signup and setup retain their existing form-change clearing. Verification feedback changes only with code edits, another submit, or its explicit resend reset.

## Feedback and field accessibility

Use visible labels and the shared `.ds-field` control. Custom failures set `aria-invalid` on the affected field and link to its stable error ID through `aria-describedby`. Error text uses `role="alert"`. Help text has a separate ID and stays linked when an error also exists. Focus moves after custom submission validation, never merely because a user types.

| Field | Custom error ID | Autocomplete |
| --- | --- | --- |
| Login `loginEmail` | `login-email-error` | `username` |
| Login `loginPassword` | Native constraint only | `current-password` |
| Signup `fullName` | `signup-name-error` | `name` |
| Signup `email` | `signup-email-error` | `email` |
| Signup `password` | Native constraint only | `new-password` |
| Verification `code` | `verification-code-error` | `one-time-code` |
| Setup `displayName` | `profile-name-error` | `nickname` |
| Setup `campusArea` | `profile-area-error` | `off` |

Setup can identify both blank trimmed fields while preserving its current combined message. Its first invalid field is display name before campus area. Verification resend feedback uses `role="status"` and never marks the code invalid. Invalid-code feedback remains an alert. Resend's explicit reset removes the old invalid-code state along with its value.

## Presentation contract

Use `.ds-page.ds-account` as the shared journey scope in `styles/accounts.css`, imported by each page with `../../styles/accounts.css`. Forms add `.ds-account--form` for the existing 600px form width token. Profile adds `.ds-account--profile` for the 720px reading width. Welcome can use the 1184px page width. Shared 16/24/32px gutters, white surfaces, gray canvas, Helvetica stack, NYU violet actions, 28/32px headings, 44px controls, and visible focus come from `design-system.css`.

Welcome has a useful desktop two-column layout: a clear borrowing and lending introduction on the left, account actions on the right. At phone widths it becomes one reading sequence with full-width actions. Keep one `h1` before the account action section heading. Do not add invented activity, verification claims, statistics, stock images, or new destinations.

The forms share a focused heading, honest demo notice, field groups, errors, and clear primary action. Links remain links. Profile uses a readable identity surface followed by renter, owner, and account sections. Keep actions comfortable to tap, with text labels and a distinct sign-out control. Long names, email addresses, areas, notices, and action text wrap without page overflow.

Reuse `.ds-heading`, `.ds-button`, its primary and secondary variants, `.ds-field`, `.ds-feedback`, `.ds-status`, and `.ds-text-link`. Shared structure uses `.ds-account-surface`, `.ds-account-form`, `.ds-account-field`, `.ds-account-help`, `.ds-account-error`, and `.ds-account-actions`, scoped under `.ds-account`. Keep unique Welcome and Profile layout rules scoped in their existing stylesheets only where needed. Profile no longer relies on `booking.css`. The legacy global `.auth-page` rules can be removed only when a source search confirms that all consumers migrated. No global booking, listing, navigation, or unrelated control rules change.

## Honest demo content

Login and signup disclose simulated account access and loss of account changes on reload. Login also states that the demo does not check passwords. Verification explains that no email is sent and any six digits complete the demo. Its heading describes demo verification instead of telling the student to check an inbox.

Profile labels email state as simulated, such as “Demo email confirmed” or “Demo email not confirmed.” Remove fixed rental and rating claims because they do not describe this account. Retain “View demo reputation” and its current demo identity destination. Setup asks for a general campus area and gives a useful example. It makes no guarantee about a private address or phone number that it does not collect.

## Verification boundary

Check all six views at 320, 375, 390, 768, 1024, and 1366px with long and unbroken profile data. Verify keyboard focus, field associations, native constraints, custom failures, resend status, redirects, signup through setup, login, profile editing, sign-out, and same-session profile reuse. Check Profile data failure and retry. Verify signed-in phone navigation clearance and a short viewport. Save phone and desktop evidence. Browser viewport checks do not establish physical keyboard or screen-reader support. Physical device and final whole-app zoom checks remain in #148.

This slice changes presentation, field feedback, and inaccurate demo wording. It does not add authentication, email delivery, account persistence, API integration, password recovery, new route guards, or a second account store.
