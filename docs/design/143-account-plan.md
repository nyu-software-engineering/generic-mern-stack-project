# Account and profile implementation plan

## Goal and architecture

Deliver #143 using the [approved NYU design](2026-11-18-nyu-redesign-design.md), [research](../research/143-account-implementation.md), and [interface contract](143-account-interface.md). Use the existing React pages, native controls, shared design tokens, and synchronous account callbacks. Start from master `306fc2a`.

Preserve all provider signatures, route guards, destinations, field names, native constraints, and validation rules. Keep #94 API integration and #139 recovery separate. Do not add pending states to synchronous operations. Keep the existing Profile shared-data boundary. No new dependencies.

Baseline: all 128 frontend tests pass. Browser checks reproduce missing invalid-email associations and focus, missing password autocomplete, no setup h1, and unsupported Profile verification and rental-count copy.

## 1. Shared account layout and Welcome

Files: create `front-end/src/styles/accounts.css`; update `pages/auth/Welcome.jsx` and `welcome.css`.

- [x] Reuse `.ds-page`, `.ds-heading`, `.ds-button`, `.ds-field`, `.ds-feedback`, `.ds-status`, and `.ds-text-link`. Add only the scoped account layouts and field groups described in the interface contract.
- [x] Use the 600px form width, 720px Profile width, and 1184px Welcome width. Use the existing gutters and 44px controls. Wrap long values and stack actions on phones.
- [x] Give Welcome one h1 and a two-column introduction and account-action layout on desktop. Keep its two account destinations. Remove the unused image placeholder styles.
- [x] Run lint and build. Commit `Add shared account layouts`.

## 2. Account forms

Files: update `pages/auth/Login.jsx`, `Signup.jsx`, `VerifyEmail.jsx`, and `SetupProfile.jsx`.

Interfaces: consume the existing no-argument page signatures and synchronous `signIn(email, displayName)`, `verifyEmail()`, and `updateProfile(displayName, campusArea)` callbacks. Produce the same navigation and account state as before.

- [x] Apply the shared form layout, stable labels, help IDs, autocomplete, linked errors, and first-invalid focus. Preserve form values on failure.
- [x] Keep native required, email, password-length, and code-length constraints. Keep the existing NYU suffix, trimmed name and area, and six-digit custom checks.
- [x] Disclose the current demo behavior. Separate resend status from invalid-code errors. Keep the current resend reset and all route guards.
- [x] Run the account accessibility browser checks and lint. Commit sign-in/signup separately from verification/setup.

The regression checks require the invalid login email to satisfy:

```js
assert.equal(await email.getAttribute('aria-invalid'), 'true')
assert((await email.getAttribute('aria-describedby')).includes('login-email-error'))
assert.equal(await email.evaluate(input => document.activeElement === input), true)
```

Also require `autocomplete="current-password"`, exactly one setup h1, and no unsupported “Verified NYU” or fixed completed-rental count in Profile. These checks fail on the baseline and must pass after implementation.

## 3. Profile and legacy styles

Files: update `pages/auth/Profile.jsx`, `profile.css`, and the unused auth block in `front-end/src/index.css`.

- [x] Replace Profile's booking CSS dependency with the scoped account reading layout. Keep its identity fallback, optional area, every existing destination, and sign-out callback.
- [x] Label the simulated email state honestly. Remove fixed rating and rental-count claims. Preserve the demo reputation label and destination.
- [x] Make renter, owner, account, and sign-out controls readable and comfortable on phones. Commit `Restyle Profile`.
- [x] Confirm `rg 'auth-page' front-end/src` has no remaining consumers before removing its legacy global block. Run lint and build. Commit `Remove unused account styles`.

## 4. Verification and delivery

- [x] Run `npm test`, `npm run lint`, and `npm run build` in `front-end`. Expected baseline is 128 passing tests. Run `git diff --check`.
- [x] Check all six views at 320/375/390/768/1024/1366px with long and unbroken names, emails, and areas. Check enlarged text and a short viewport. Record physical-device limits.
- [x] Exercise native validation, each custom failure, signup, demo verification, resend, profile setup, editing, sign-out, same-session reuse, and reload reset. Check every route guard and all Profile links.
- [x] Check Profile shared-data failure and retry. Verify the signed-in phone bar does not obscure final controls.
- [x] Save desktop and phone screenshots and a verification note. Obtain independent source and security reviews. Fix actionable findings and repeat affected checks.
- [ ] Push small commits under the user's identity. Open a PR against master, assign the user, set Sprint 2 and relevant labels, and request Omer and Sherry. Keep #143 open until merge and record the separate recovery dependency.

Results and limits: [143-verification.md](143-verification.md).
