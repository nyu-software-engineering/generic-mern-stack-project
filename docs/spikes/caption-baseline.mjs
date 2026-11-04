// Exploratory baseline for issue #32; not application code.
import { readFileSync, writeFileSync } from 'node:fs';
const fixtures = JSON.parse(readFileSync(new URL('./caption-fixtures.json', import.meta.url), 'utf8'));
const token = String.raw`[\p{Lu}][\p{L}\p{N}'’&-]*`;
const name = `${token}(?:\\s+${token})*`;
function extract(caption) {
  const candidates = [];
  for (const pattern of [
    new RegExp(`(?:📍|[Pp]lace:)\\s*(${name})`, 'gu'),
    new RegExp(`\\b(?:at|At)\\s+(${name})`, 'gu'),
  ]) {
    for (const match of caption.matchAll(pattern)) candidates.push(match[1]);
  }
  return [...new Set(candidates)];
}
const normalize = values => [...new Set(values.map(x => x.toLowerCase().replaceAll('’', "'").trim()))].sort();
const cases = fixtures.map(({id, caption, expected}) => {
  const actual = extract(caption);
  return {id, caption, expected, actual, exactSetMatch: JSON.stringify(normalize(actual)) === JSON.stringify(normalize(expected))};
});
const report = {
  dataset: 'Handwritten synthetic English examples, not TikTok/Instagram samples',
  limitation: 'Exploratory set designed alongside the rules; not a held-out accuracy benchmark. Extraction does not verify a real place or branch.',
  cases: cases.length,
  exactSetMatches: cases.filter(x => x.exactSetMatch).length,
  results: cases,
};
writeFileSync(new URL('./caption-baseline-results.json', import.meta.url), JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify(report, null, 2));
