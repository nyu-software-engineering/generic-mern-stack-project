# #146 implementation research

Source audit: November 19, 2026. Read with [DESIGN.md](../../DESIGN.md) and the [approved design](../design/2026-11-18-nyu-redesign-design.md). This is a source review. No browser checks or tests were run for these notes.

## Routes and callbacks

| Entry | Existing contract |
| --- | --- |
| `/inbox` | `Inbox()` reads `conversation`. A nonempty value mounts `Conversation({conversationId})`, keyed by ID. Empty or missing values show the list. |
| `/inbox?conversation=<id>` | Missing conversation shows recovery. Send trims draft, calls `sendMessage(id,CURRENT_USER_ID,text)`, replaces conversation, clears draft. Offer opens `OfferForm({listing,initialOffer:latestOffer,onSubmit,onCancel})`. Submit calls `sendOffer(id,CURRENT_USER_ID,offer)` and closes. Cancel closes only. Decline replaces conversation with `declineOffer(id,pendingOffer.id)`. Accept calls `acceptOffer(id,pendingOffer.id)` and opens `/bookings/<booking.id>`. |
| `/requests` | Redirects to `/requests-board` with replace. `?new` wins over `?request=<id>`, even with an empty new value. A nonempty request value mounts keyed `RequestDetail({requestId})`. |
| `/requests?new` | `CreateItemRequest()` calls `postItemRequest(form)`. Errors retain values. Success opens `/requests-board`. |
| `/requests?request=<id>` | Close replaces request with `closeItemRequest(id)`. Form submit calls `respond(true)`; Message requester calls `respond(false)`. Both call `respondToRequest(id,CURRENT_USER_ID,{listingId,message,totalPrice})`; message-only passes undefined price. Success opens conversation; null shows form error. |
| `/requests-board` | `RequestsBoard()` holds type `all/quick/item/mine`. `RequestCard({request})` links to detail, latest reply conversation, `/requests?new`, `/quick-borrow`, or `/inbox` for another user's quick request. |
| `/quick-borrow` | `QuickBorrow()` passes six named form values to `createQuickBorrowRequest`. Null retains values and shows error. Success resets form and shows saved status. Any change clears status/error. |

Other exits: `/report?conversationId=<id>`, `/listings/new`, `/inbox`, `/requests-board`. Offer dialog has no URL. Sources: [chat](../../front-end/src/pages/chat/Conversation.jsx), [route selectors](../../front-end/src/pages/requests/ItemRequests.jsx), [request detail](../../front-end/src/pages/requests/RequestDetail.jsx), [board card](../../front-end/src/pages/requestsBoard/RequestCard.jsx), [Quick Borrow](../../front-end/src/pages/quickBorrow/QuickBorrow.jsx).

## Services and invariants

[chat.js](../../front-end/src/services/chat.js) exports `getConversation(id)`, `getConversations(userId)`, `getLastMessage(conversation)`, `getOtherParticipant(conversation,userId)`, `getPendingOffer(conversation)`, `getLatestOffer(conversation)`, `formatSentAt(sentAt)`, and the mutation signatures above. `startConversation({listingId,participantIds,messages})` assigns message IDs/timestamps. Conversations sort newest first. Messages remain ordered. New offers mark pending offers countered. Preserve pending/accepted/declined/countered labels. Only a pending offer from someone else exposes accept/decline. Accept creates a local confirmed booking with the offer terms. Preserve its ID boundary.

[OfferForm](../../front-end/src/pages/chat/OfferForm.jsx) initializes from the latest offer. It requires dates, prevents past starts, requires end after a valid start, and rejects blank or negative total. It calls `countDays(startDate,endDate)` for listed-price guidance and submits `{totalPrice:Number(value),startDate,endDate}`. Preserve those exact rules and callback shape.

[itemRequests.js](../../front-end/src/services/itemRequests.js) also exports `validateItemRequest(form)`, `getItemRequest(id)`, `getOpenItemRequests()`, `getOfferableListings(userId)`, `getLatestResponse(request)`. Form fields are `itemName,neededBy,neededUntil,approximateArea,targetPrice,details`. Name/area need trimmed text; start cannot be past; end must follow start; price is blank or nonnegative. Own requests expose replies/close. Only open requests from others expose response controls. Listings must be published and owned by responder. Message-only needs text; offer needs nonnegative total. Response message IDs prevent older offers or requester counters appearing as new replies.

[requestsBoard.js](../../front-end/src/services/requestsBoard.js): `getBoardRequests(type='all',userId=CURRENT_USER_ID)` merges open item requests and quick requests, newest first. Mine includes own records; other filters exclude own records. `[quickBorrow.js](../../front-end/src/services/quickBorrow.js)` exports `getQuickBorrowRequests()`, `getQuickBorrowRequestsForUser(requesterId=CURRENT_USER_ID)`, `createQuickBorrowRequest({itemName,neededBy,neededTime='',borrowDuration,approximateArea,details,requesterId=CURRENT_USER_ID})`. UI requires all six fields; service permits empty time. Do not change this distinction.

[App.jsx](../../front-end/src/App.jsx) puts inbox, requests, board behind MockData loading/error/retry. Quick Borrow sits outside. Mutations are synchronous. Chat/item requests use memory; Quick Borrow merges bootstrap data with `dormshare.quickBorrowRequests` localStorage. Read errors recover; write errors have no UI. No delivery/persistence promises. Remove unsupported “Verified NYU” from conversation metadata. Preserve services while #104/#109/#115 remain separate.

## CSS and verification

Chat CSS belongs to chat. Request CSS leaks through `.listing-form .has-error`. Board uses global `.page`, `.page-header`, `.rental-grid`, `.rental-card`, `.rental-status`; request forms use `.listing-form`, `.form-actions`, `.primary-button`. Shared consumers include MyListings, both dashboards, MockData, reports, and CommunityRules. Scope replacements locally. Quick Borrow already has a CSS module. [index.css](../../front-end/src/index.css) owns legacy globals.

Risks: nowrap chat metadata truncates names/terms; timestamp competes with content; send input lacks `min-width:0`; long bubbles lack wrapping; board tabs do not wrap; reply rows do not stack; overlay lacks dialog semantics/focus/scroll safeguards.

Existing [tests](../../front-end/test): itemRequests covers old-offer exclusion/counter attribution; requestsBoard covers filters/order; sharedMockData covers chat cache; bookingsApi covers local accepted bookings and ID isolation. No dedicated DOM/dialog browser suite exists. After implementation run relevant tests, full frontend tests, lint, build. Browser checks need all routes/query precedence, missing/empty states, role branches, validations, message/offer/counter/decline/accept, reply links, local save/reset/refresh/write failure, bootstrap failure/retry. Check keyboard/dialog focus and long text at 320/375/390/768/1024/1366px plus enlarged text. Record route, steps, viewport, result, screenshots.
