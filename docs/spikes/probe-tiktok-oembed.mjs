// Run explicitly; no network request is made by the offline tests.
import { writeFileSync } from 'node:fs';
import { buildOembedUrl, summarizeOembed } from './tiktok-oembed.mjs';

const sourceUrl = process.argv[2] ?? 'https://www.tiktok.com/@scout2015/video/6718335390845095173';
const endpoint = buildOembedUrl(sourceUrl);
const output = process.argv[3] ?? new URL('./tiktok-oembed-observation.json', import.meta.url);
const record = {
  checkedAt: new Date().toISOString(),
  sourceUrl: new URL(endpoint).searchParams.get('url'),
  method: 'Unauthenticated HTTPS GET to TikTok oEmbed; metadata only, no video download.',
  limitation: 'One smoke-test URL; not a venue-caption dataset or a platform-wide guarantee.',
};
const started = performance.now();
try {
  const response = await fetch(endpoint, {
    headers: { Accept: 'application/json' },
    redirect: 'error',
    signal: AbortSignal.timeout(15000),
  });
  record.httpStatus = response.status;
  record.contentType = response.headers.get('content-type');
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  Object.assign(record, summarizeOembed(await response.json()));
} catch (error) {
  record.error = error.name === 'TimeoutError' ? 'Request timed out.' : error.message;
  record.nextStep = 'retry-or-manual-search';
  process.exitCode = 1;
}
record.elapsedMs = Math.round(performance.now() - started);
writeFileSync(output, JSON.stringify(record, null, 2) + '\n');
console.log(JSON.stringify(record, null, 2));
