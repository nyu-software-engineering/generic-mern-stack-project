# Mobile shell interface contract for #148

Design only, November 20, 2026. This contract follows the [approved NYU direction](2026-11-18-nyu-redesign-design.md) and [mobile audit research](../research/148-mobile-audit.md). It covers the confirmed bottom-navigation focus defect on the temporary combined checkout at `c94a69e17fa211f60328d91fdef9e97405251e2f`. It does not claim a completed fix or completed browser coverage.

## Confirmed failure

Native Tab navigation can scroll a focused page control behind the fixed `.ds-mobile-nav`. At 390 by 500px, Quick Borrow's `neededBy` field occupied y=451.59 through 499.59 while the bar started at y=427.81. The field was fully covered. The same check found covered controls on listing creation, reporting, conversation detail, booking request, and participant review.

At 320px wide, wrapped navigation labels made the bar 87.375px tall. The shared `--ds-nav-height` token represented only 72px at the default font size. The existing root bottom padding therefore underestimated the overlay. Bottom padding also does not tell the browser which part of the scroll viewport the fixed bar covers.

The reproduction data is `/private/tmp/dormshare-148-focus-results.json`. The initial screenshot is `/private/tmp/dormshare-148-focus-before.jpg`. These are local investigation artifacts. Durable verification evidence must identify its checkout and viewport.

## Shared CSS ownership

Keep the fix in [design-system.css](../../front-end/src/styles/design-system.css) and, only if needed for the height contract, [Navbar.css](../../front-end/src/components/Navbar.css). The existing shared shell owns both the navigation size and the page clearance. Individual pages must not add compensating spacers or focus handlers.

| Interface | Contract |
| --- | --- |
| `--ds-nav-height` | The mobile navigation border-box height before the bottom safe-area inset. Use a scalable value that fits the existing five labels when they wrap at 320px. `5.5rem` is the initial candidate for browser verification. |
| `.ds-mobile-nav` | Retain the fixed bar, five equal columns, existing labels, icons, active states, and focus styles. Its rendered height must fit within the shared height plus the bottom safe-area inset at each verified text size. Keep labels visible and targets at least 44px tall. |
| `#root:has(.ds-mobile-nav)` | Reserve at least the full rendered bar height, including the bottom safe-area inset, in the document flow. Use the same height contract as the bar. |
| `html:has(.ds-mobile-nav)` | Define bottom scroll padding on the document scroll container. It must account for the bar height, bottom safe-area inset, and at least 8px of clear space for the existing focus outline. Apply it only at widths up to 767px. |

The safe-area inset contributes once to each relevant size. It must not be counted twice inside the bar or omitted from page clearance. The shared height remains in rem so that it grows with enlarged root text. A candidate value is acceptable only when measured rendered bounds support it. Do not force a height that clips labels to satisfy the token.

Use native browser focus scrolling. Keep the document as the page scroll container. Restrict the scroll-padding change to the document root so the offer dialog keeps its own scroll geometry. The existing native dialog, internal overflow, focus containment, Escape behavior, and focus return remain intact.

At 768px and wider, the desktop navigation, page spacing, and scroll behavior remain unchanged. A signed-out page has no mobile navigation and receives no navigation reserve or navigation scroll padding.

## Retained interfaces and boundaries

No public function, component signature, prop, data model, error type, or service interface changes. No new protocols or exception hierarchy are needed for this CSS contract. `Navbar()` and its existing links keep their current behavior. Route paths, query keys, native field constraints, validation focus, callbacks, API payloads, storage, and provider placement remain as documented in the research note.

This work adds no dependency, plugin, event listener, resize observer, focus interception, route change, or page-specific scrolling logic. It does not redesign navigation or change modal layout. It does not establish real keyboard or Safari behavior from a shortened Chromium viewport.

## Acceptance evidence

Verify the candidate through actual Tab and Shift+Tab input before treating it as the implementation contract. Programmatic focus or `scrollIntoView` alone does not establish native focus scrolling. Cover all six affected journeys with the same fixtures and controls as the reproduction.

At 320 and 390px widths with a 500px height, focused page controls must remain above the measured navigation top with their focus outline visible. Record control bounds and navigation bounds. Check date and time segments, native radio movement, textareas, buttons, and links. Test both forward and backward traversal. A control taller than the remaining visible area needs a separately recorded result rather than a full-visibility claim.

Repeat the 320 by 203px approximation and 200% root-text checks. Confirm wrapped labels fit the bar, the measured bar fits the reserved height, and the final page actions can scroll above it. Repeat the affected journeys after any candidate adjustment.

Recheck the shared shell across all 28 routes at the research note's six widths. Include signed-out pages and the 768px desktop boundary. Confirm no added horizontal overflow. Open the offer dialog and verify internal scrolling, final actions, focus containment, Escape, and focus return. Run the existing frontend tests, lint, and build. Do not add tests that only assert CSS declarations.

True 400% browser zoom and physical iPhone Safari remain separate checks. Record the achieved zoom and effective viewport. The device check must cover the real keyboard, safe area, orientation, native date/time pickers, and offer dialog. Keep either check explicitly outstanding until performed. This contract makes no WCAG conformance claim.
