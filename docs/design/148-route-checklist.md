# Mobile route checklist

Rechecked November 20, 2026 against merged master `9e83b384f9003967cf7e255e748d5dae47c8eff0`, after #157, #163, and #164 merged. Every result below passed again. See the [final merged-app verification](148-merged-verification.md).

Each normal-width pass checks horizontal document bounds, one main landmark, the expected loaded heading, and field label presence. Full-page zoom uses the actual Chromium tab zoom. Text enlargement changes only the root font. Journey interactions are recorded in [148-verification.md](148-verification.md).

| Route or child view | 320/375/390/768/1024/1366px | 400% tab zoom | 200% root text at 320/390px |
| --- | --- | --- | --- |
| `/` | Pass | Pass | Pass |
| `/login` | Pass | Pass | Pass |
| `/signup` | Pass | Pass | Pass |
| `/verify-email` | Pass | Pass | Pass |
| `/setup-profile` | Pass | Pass | Pass |
| `/profile` | Pass | Pass | Pass |
| `/browse` | Pass | Pass | Pass |
| `/browse/2` | Pass | Pass | Pass |
| `/listings` | Pass | Pass | Pass |
| `/listings/new` | Pass | Pass | Pass |
| `/owner-dashboard` | Pass | Pass | Pass |
| `/renter-dashboard` | Pass | Pass | Pass |
| `/listings/2/request` | Pass | Pass | Pass |
| `/booking-requests` | Pass | Pass | Pass |
| `/bookings/201` | Pass | Pass | Pass |
| `/bookings/202/extension` | Pass | Pass | Pass |
| `/bookings/201/cancel` | Pass | Pass | Pass |
| `/handoff/201` | Pass | Pass | Pass |
| `/inbox` | Pass | Pass | Pass |
| `/requests` | Pass | Pass | Pass |
| `/requests-board` | Pass | Pass | Pass |
| `/quick-borrow` | Pass | Pass | Pass |
| `/notifications` | Pass | Pass | Pass |
| `/users/owner-1/reputation` | Pass | Pass | Pass |
| `/bookings/113/review` | Pass | Pass | Pass |
| `/community-rules` | Pass | Pass | Pass |
| `/report` | Pass | Pass | Pass |
| `/report/submitted/DS-101` | Pass | Pass | Pass |
| `/inbox?conversation=1` | Pass | Pass | Pass |
| `/requests?new` | Pass | Pass | Pass |
| `/requests?request=1` | Pass | Pass | Pass |
| `/requests?request=2` | Pass | Pass | Pass |
| `/bookings/105/extension` | Pass | Pass | Pass |
| `/handoff/104` | Pass | Pass | Pass |
| `/handoff/106` | Pass | Pass | Pass |

All 28 explicit routes are represented. The remaining seven entries cover conversation, request, extension-role, and handoff-role views. Bare `/requests` correctly redirects to the board.

These are Chromium results. They do not establish every state of each route, physical keyboard behavior, or screen-reader conformance. See the separate completed iPhone Safari observations and coverage limits in the final verification note.
