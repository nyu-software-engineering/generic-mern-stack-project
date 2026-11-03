// Research helper for #32. It does not change application behavior.
export function buildOembedUrl(value) {
  const video = new URL(value);
  if (video.protocol !== 'https:' || video.hostname !== 'www.tiktok.com' ||
      video.username || video.password || video.port ||
      !/^\/@[^/]+\/video\/\d+\/?$/.test(video.pathname)) {
    throw new Error('Use a canonical HTTPS www.tiktok.com/@creator/video/id URL.');
  }
  // Ignore tracking parameters. Fetch only TikTok's fixed oEmbed endpoint.
  video.search = '';
  video.hash = '';
  const endpoint = new URL('https://www.tiktok.com/oembed');
  endpoint.searchParams.set('url', video.href);
  return endpoint.href;
}

export function summarizeOembed(payload) {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    throw new Error('Expected an oEmbed JSON object.');
  }
  const hasText = (key) => typeof payload[key] === 'string' && payload[key].trim().length > 0;
  const caption = hasText('title') ? payload.title.trim() : null;
  return {
    returnedFields: Object.keys(payload).sort(),
    caption,
    hasCaption: caption !== null,
    hasCreatorName: hasText('author_name'),
    hasThumbnail: hasText('thumbnail_url'),
    hasEmbedMarkup: hasText('html'),
    nextStep: caption === null ? 'manual-search' : 'extract-candidates',
  };
}
