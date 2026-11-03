# Caption-to-place extraction — preliminary spike #32

Owner: `ij2298-oss` (Inoo). Updated: 2026-11-03.

**Status: draft evidence for #32, not a completed spike.** The synthetic rule baseline and a real TikTok oEmbed smoke test have been executed. Real venue captions from #30/#31, a controlled LLM run, and a places API comparison are still pending. This document covers #32 only; the smoke test does not complete the owners' TikTok/Instagram spikes.

## Question

How can caption text produce useful place-search candidates for story #8? When should Later offer suggested matches (#9) or manual search (#10)?

## Input availability checked on 2026-11-03

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

## Provisional flow to investigate

1. First check that caption retrieval produced usable text. A missing caption must not become an invented venue: offer manual search (#10), optionally letting the user provide a place name/caption. If text exists, extract candidate names and explicit location hints.
2. Search candidates with the team's chosen places provider. A selected city may be supplied as separate context, not silently treated as caption evidence.
3. Offer the user actual search results with address and map context. Multiple venues, branches, or weak matches should lead to suggested matches (#9), not an arbitrary first result.
4. If the caption contains no usable name, search fails, or no result matches, offer manual search (#10).

This is a proposed experiment flow, not a team-approved architecture or a measured LLM recommendation. The baseline is useful for comparison but its demonstrated failures make it insufficient as the sole automatic pinning method.

## Remaining work and dependencies

- [ ] Obtain real captions and source URLs from the owners of #30 and #31; record collection method and missing metadata.
- [ ] Confirm the team's places provider, API access, and city/branch matching criteria. No places API requests have been run in this spike yet.
- [ ] Run the rule and LLM approaches on the same real samples.
- [ ] Search the extracted names and manually check returned places/branches against known expected locations.
- [ ] Record false positives, abstentions, ambiguous results, latency, and relevant usage cost.
- [ ] Replace this preliminary recommendation with evidence from those runs and submit for peer review.

No issue checklist item should be marked fully complete based only on these synthetic examples.
