# Link-to-place flow — Sprint 1 frontend recommendation (#32)

Owner: `ij2298-oss` (Inoo). Updated: 2026-11-03.

**Status: frontend recommendation ready for peer review.** Sprint 1 uses the shared mock data to demonstrate finding, choosing, and saving a place. It does not require a backend, live caption retrieval, an LLM, or a places API. This recommendation and the offline rule experiment are the completed scope of this PR; the original #32 API-evaluation checklist is not complete and the issue should remain open.

## Sprint 1 decision

Use the existing `lookupLinkByUrl()` function in `front-end/src/data/mockDataLayer.js` and the `linkLookups` / `places` fixtures in `demoData.js`. Keep the synthetic caption-extraction experiment below as research only; do not import it into the app or use its output to invent map coordinates.

The front-end can demonstrate all three outcomes now using those shared fixtures. Provider selection and real-caption samples are **not blockers for the Sprint 1 UI**. No new application dataset, server, API key, or network request is needed for this flow.

### Existing contract and proposed screen behavior

Checked against `origin/master` at `7da45e6` on 2026-11-03. The outer lookup status and the nested fixture status have different meanings:

| Lookup result | Current implementation | Recommended frontend behavior |
| --- | --- | --- |
| `{ status: 'empty' }` | `Create` shows “Paste a link first.” | Keep the user on the form with that validation message. |
| `{ status: 'ok', lookup: { status: 'found', placeId, ... } }` | `Create` sends `{ lookup }` to `/create/identifying`. | Resolve `placeId` through the shared data layer, display the fixture's place name, city and neighborhood, and let the user confirm or choose manual search. A single mock result is not permission to save automatically. |
| `{ status: 'ok', lookup: { status: 'ambiguous', candidates, ... } }` | `Create` sends `{ lookup }` to `/create/matches`. | Story #9: display the referenced candidates, let the user select one, and offer “None of these” to `/create/search`. `bestMatch` can label a suggestion; it must not choose for the user. |
| `{ status: 'ok', lookup: { status: 'not_found', ... } }` | `Create` shows a not-found message. | Story #10: retain the message and offer manual search. |
| `{ status: 'not_found' }` | The pasted URL is not in the fixtures; `Create` shows an error. | Explain that there is no demo match and offer the same manual-search action. This does not establish that the real post contains no place. |

`lookupLinkByUrl()` trims the string and performs an exact fixture-URL comparison. It does not fetch, extract, or verify a real post. Do not treat outer `status: 'ok'` as a successful place match without inspecting `lookup.status`.

`Identifying`, `SuggestedMatches`, and `SearchPlace` are still placeholders on the checked `master`. The table is a handoff for those screens, not a claim that their UI is already implemented. Page code should read UI-shaped results through `mockDataLayer.js`; any necessary place/search accessor belongs there rather than duplicating fixtures in a page. This PR does not implement or take over those pages.

### Demo cases using the team's existing fixtures

These URLs are synthetic demo inputs, not real posts collected for #30/#31. Paste them into the app; do not use them as live API evaluation samples.

| Case | Existing fixture/input | Expected data outcome |
| --- | --- | --- |
| TikTok, one place | `lk_1`: `https://www.tiktok.com/@nyceats/video/7301` | `found`, `p_9` / Katz's Delicatessen / New York. |
| Instagram, one place | `lk_2`: `https://www.instagram.com/p/septime-paris` | `found`, `p_10` / Septime / Paris. |
| Several candidates | `lk_3`: `https://www.instagram.com/reel/paris-croissant` | `ambiguous`, `p_11`, `p_12`, `p_13` / three Paris bakeries. |
| Known demo failure | `lk_4`: `https://www.tiktok.com/@random/video/0000` | Outer `ok`, nested `not_found`; offer manual search. |
| Unknown demo URL | A URL absent from `linkLookups` | Outer `not_found`; offer manual search without fabricating a result. |
| Blank input | Empty string or whitespace | `empty`; show validation without navigating. |

### Handoff checks for the page owners

- Show missing photos with a fallback and use the shared fixture's city/neighborhood to distinguish candidates. Do not manufacture an address that the fixture does not contain.
- A missing/invalid place reference should lead to manual search rather than a crash or a fabricated place.
- A direct visit or reload without router `state.lookup` should offer a return to `/create`; it must not display a success from stale state.
- Manual search uses shared mock places for this sprint. An empty/no-result search remains recoverable, and returning to the form lets the user edit the pasted link.
- Only show the save-success screen after the frontend's mock save/selection step succeeds. This is a demo interaction, not evidence of backend persistence.

## Why not run the caption rules in the frontend?

The offline baseline below gets 8 of 12 handwritten examples exactly right and demonstrably fails on lowercase text, negation, a name without a cue, and a generic word such as “Home.” It cannot verify a business or branch. For this sprint, predictable shared fixtures let the team build and demonstrate the UI without depending on an unvalidated extractor. The recommendation is therefore **mock lookup → user confirmation / suggested matches → manual-search fallback**.

### Verification performed for this recommendation

Imported the shared data layer in Node and checked all four demo URLs, blank and whitespace-only input, an unknown URL, and a padded demo URL (eight input cases). The outer/nested statuses matched the table, all referenced candidate IDs existed in the shared `places`, and URL trimming preserved the result. Network access was disabled in that verification. This checks the existing mock contract, not completion of the placeholder screens. The five existing offline metadata-helper tests also passed, and rerunning the synthetic extraction baseline reproduced 8/12 exact-set matches.

## Question

How can caption text produce useful place-search candidates for story #8? When should Later offer suggested matches (#9) or manual search (#10)?

## Earlier API observation — background only, outside the Sprint 1 UI

The following smoke test was run before narrowing this PR to the frontend handoff. It is retained as an accurately labeled observation, not a dependency for the demo or a reason to add a backend. No further live requests are needed to review the frontend recommendation.

Issue #30 assumes oEmbed returns caption, creator, and thumbnail. That assumption did not hold for the official example tested from this environment: HTTP 200 returned embed metadata but **no `title`, `author_name`, or `thumbnail_url`**. See the timestamped machine-readable [observation](./tiktok-oembed-observation.json).

| Source | Result | Interpretation for #32 |
| --- | --- | --- |
| [TikTok's official example video](https://www.tiktok.com/@scout2015/video/6718335390845095173) via unauthenticated oEmbed GET | HTTP 200; field inventory in the observation JSON; caption absent | No text available for extraction from this response. This is a metadata smoke test, not a venue sample. |
| Team handoff at `origin/master` commit `e9f236b` and issues #30/#31 | No published real-caption table found in `docs/spikes/link-parsing.md` or the issue comments at check time | Need the owners' source URLs and actually collected captions before real-caption evaluation. This does not imply they have not worked locally. |
| Places provider and LLM access | No selected places provider documented in the checked repository; no configured LLM/places key found in this shell environment | Provider choice/access and actual caption samples remain dependencies. Do not use the application's synthetic `linkLookups` as research evidence. |

The current [TikTok Embed Videos documentation](https://developers.tiktok.com/docs/en/embed-videos) also shows an iframe-based response without those text fields and announces migration to Embed Player. The [Embed Player documentation](https://developers.tiktok.com/docs/en/embed-player) describes displaying a description inside the player; that is not evidence of a caption field in an oEmbed JSON response.

**Scope of the finding:** one response and the current documentation. We have not established whether other posts or authorized APIs can provide captions. Do not claim that all TikTok captions are unavailable or that the new player can replace a caption-retrieval API.

Reproduce the live smoke test (Node 22+; one request, no login, no video download):

```sh
node docs/spikes/probe-tiktok-oembed.mjs
# Optional: canonical public video URL, then output path
node docs/spikes/probe-tiktok-oembed.mjs "https://www.tiktok.com/@scout2015/video/6718335390845095173" observation.json
```

The helper records status, timing, returned field names, and whether usable title text exists. It never executes returned embed HTML. Network/HTTP/invalid-JSON failures are recorded separately from a successful response with no caption. Latency is one local observation, not a benchmark.

Offline checks of URL handling and missing-caption fallback:

```sh
node --test docs/spikes/tiktok-oembed.test.mjs
```

These offline Node tests exercise the research helper; they do not evaluate extraction accuracy or call any external service.

## Completed experiment

Run from the repository root:

```sh
node docs/spikes/caption-baseline.mjs
```

This dependency-free Node script reads `caption-fixtures.json` and writes `caption-baseline-results.json`. All 12 captions are handwritten synthetic examples, **not collected social-media posts**. Expected names were manually specified before execution. Rules look for capitalized names following `at`, `Place:`, or a location-pin marker. Comparison ignores case and curly versus straight apostrophes and compares the full candidate set.

The executed baseline matched the expected set on **8 of 12 examples**. This small set was designed alongside the rules and is not a held-out benchmark or a real-world accuracy estimate. Returning an expected name does not prove that the correct business or branch was identified.

| Failure case | Observed result | Implication |
| --- | --- | --- |
| `Joe's Shanghai has my favorite dumplings.` | No candidate | A name can appear without a location cue. |
| `dinner at joe's shanghai in flushing` | No candidate | Capitalization rules miss lowercase captions. |
| `Not at Blue Bottle today; we're at Devoción.` | Both venues returned | Negation needs interpretation. |
| `Dinner at Home tonight.` | `Home` returned | Capitalized generic words can become false candidates. |

Other fixtures cover no named venue, city-only text, multiple venues, explicit labels, accented characters, a chain with an unspecified branch, and an instruction embedded in a caption. The chain fixture passes name extraction but remains unsuitable for automatic pinning.

## LLM comparison prepared, not executed

`caption-llm-prompt.txt` defines an evidence-based JSON extraction prompt. No external LLM API was called, and no LLM accuracy, latency, or cost result is claimed.

For the next comparison, use the same captions and expected sets, record provider/model/version, prompt, raw responses, latency, and errors, and evaluate the same exact-set metric. Add separate checks for unsupported names, negation, multiple venues, and branch ambiguity. Freeze a new real-caption evaluation set before adjusting rules or prompts. Caption content is input data, never a trusted instruction.

## Later integration questions, outside this PR's frontend scope

1. First check that caption retrieval produced usable text. A missing caption must not become an invented venue: offer manual search (#10), optionally letting the user provide a place name/caption. If text exists, extract candidate names and explicit location hints.
2. Search candidates with the team's chosen places provider. A selected city may be supplied as separate context, not silently treated as caption evidence.
3. Offer the user actual search results with address and map context. Multiple venues, branches, or weak matches should lead to suggested matches (#9), not an arbitrary first result.
4. If the caption contains no usable name, search fails, or no result matches, offer manual search (#10).

This is a proposed future experiment flow, not a team-approved architecture or a measured LLM recommendation. It does not change the Sprint 1 decision to use shared mock results.

## Original #32 checklist still open for later scoping

The issue currently also asks for real-caption, LLM, and places API evaluation. The following items have not been done and are outside this frontend-only PR scope. The team can decide when to schedule them; this document does not change the issue's sprint labels or mark them complete.

- [ ] Obtain real captions and source URLs from the owners of #30 and #31; record collection method and missing metadata.
- [ ] Confirm the team's places provider, API access, and city/branch matching criteria. No places API requests have been run in this spike yet.
- [ ] Run the rule and LLM approaches on the same real samples.
- [ ] Search the extracted names and manually check returned places/branches against known expected locations.
- [ ] Record false positives, abstentions, ambiguous results, latency, and relevant usage cost.
- [ ] Revisit the future extraction recommendation using those measured results.

The frontend recommendation above is ready for review independently. Do not close #32 or report the API experiments as completed based on these synthetic examples.
