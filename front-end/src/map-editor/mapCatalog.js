const API = 'https://commons.wikimedia.org/w/api.php'
const cache = new Map()
const MAP_TITLE = /\b(?:maps?|atlases?|plans?|cartographs?|mapas?|karten?|mappas?)\b/i
const MAP_CATEGORY = /\b(?:maps?|atlases?|cartograph\w*|topographic\w*|nautical charts?|floor plans?)\b/i
const STOP_WORDS = new Set(['a', 'an', 'and', 'by', 'for', 'from', 'in', 'map', 'maps', 'of', 'the', 'with'])

export function cleanMapQuery(text) {
  return text.trim()
    .replace(/^(?:please\s+)?(?:can you\s+)?(?:generate|create|make|find|show|give me)\s+(?:me\s+)?(?:a\s+)?(?:historical\s+)?map\s*(?:of|showing|depicting|for)?\s*/i, '')
    .replace(/^(?:map\s+of\s+|a\s+map\s+of\s+)/i, '')
    .slice(0, 140)
}

function apiUrl(params) {
  return API + '?' + new URLSearchParams({
    action: 'query', format: 'json', origin: '*',
    prop: 'imageinfo', iiprop: 'url|mime|extmetadata',
    ...params,
  })
}

async function request(params, signal) {
  const response = await fetch(apiUrl(params), {
    signal,
    headers: { 'Api-User-Agent': 'MapMakerStudent/0.1 (https://github.com/agile-students-fall2026/generic-mern-stack-project-MapMaker)' },
  })
  if (!response.ok) throw new Error(response.status === 429 ? 'Search is temporarily rate-limited. Try again shortly.' : 'Map search is temporarily unavailable.')
  const data = await response.json()
  if (data.error) throw new Error(data.error.info || 'Map search failed.')
  return data
}

function plain(value) {
  return String(value || '').replace(/<[^>]*>/g, '').replace(/&(?:nbsp|amp|quot|lt|gt);/g, ' ').trim().slice(0, 180)
}

function validUrl(url) {
  try { return new URL(url).protocol === 'https:' } catch { return false }
}

export function mapFromPage(page) {
  const info = page.imageinfo?.[0]
  if (!info?.mime?.startsWith('image/') || !validUrl(info.thumburl || info.url)) return null
  const title = page.title.replace(/^File:/, '').replace(/\.[^.]+$/, '').replace(/_/g, ' ')
  const categories = (page.categories || []).map((category) => category.title.replace(/^Category:/, ''))
  if (!MAP_TITLE.test(title) && !categories.some((category) => MAP_CATEGORY.test(category))) return null
  const meta = info.extmetadata || {}
  return {
    pageId: page.pageid,
    title,
    thumbnail: info.thumburl || info.url,
    url: info.thumburl || info.url,
    pageUrl: info.descriptionurl || `https://commons.wikimedia.org/?curid=${page.pageid}`,
    author: plain(meta.Artist?.value || meta.Credit?.value) || 'See original file page',
    license: plain(meta.LicenseShortName?.value) || 'Check file page',
    licenseUrl: validUrl(meta.LicenseUrl?.value) ? meta.LicenseUrl.value : '',
    provider: 'Wikimedia Commons',
  }
}

function relevance(page, map, query) {
  const title = map.title.toLowerCase()
  const categories = (page.categories || []).map((category) => category.title.toLowerCase()).join(' ')
  const subjectCategories = (page.categories || [])
    .map((category) => category.title.toLowerCase())
    .filter((category) => /\b(?:maps?|atlases?|plans?)\s+(?:of|in|showing|depicting)\b/.test(category))
    .join(' ')
  const terms = cleanMapQuery(query).toLowerCase().match(/[\p{L}\p{N}]+/gu)?.filter((word) => !STOP_WORDS.has(word)) || []
  const titleWords = new Set(title.match(/[\p{L}\p{N}]+/gu) || [])
  const categoryWords = new Set(categories.match(/[\p{L}\p{N}]+/gu) || [])
  const subjectWords = new Set(subjectCategories.match(/[\p{L}\p{N}]+/gu) || [])
  const titleHits = terms.filter((term) => titleWords.has(term)).length
  const categoryHits = terms.filter((term) => subjectWords.has(term)).length
  const year = terms.find((term) => /^\d{3,4}$/.test(term))
  if (terms.some((term) => term !== year && !titleWords.has(term) && !subjectWords.has(term))) return null
  if (year && !titleWords.has(year) && !categoryWords.has(year)) return null
  return (MAP_TITLE.test(title) ? 5 : 0) + (MAP_CATEGORY.test(categories) ? 6 : 0)
    + titleHits * 12 + categoryHits * 4
    + (title.includes(cleanMapQuery(query).toLowerCase()) ? 12 : 0)
    + (year && titleWords.has(year) ? 20 : 0)
}

export async function searchMaps(query, cursor, signal) {
  const keywords = cleanMapQuery(query) || 'world'
  const cacheKey = JSON.stringify([keywords, cursor])
  if (cache.has(cacheKey)) return cache.get(cacheKey)
  const searches = ['intitle:map', ''].map((filter, i) => ({
    key: i ? 'broad' : 'titles',
    offset: cursor?.[i ? 'broad' : 'titles'],
    search: `${keywords} ${filter} -filemime:pdf`.trim(),
  })).filter((item) => !cursor || item.offset)
  const batches = await Promise.allSettled(searches.map(async ({ key, offset, search }) => {
    const data = await request({
      generator: 'search', gsrnamespace: '6', gsrlimit: '24',
      gsrsearch: search, prop: 'imageinfo|categories', cllimit: 'max', clshow: '!hidden',
      iiurlwidth: '480', ...(offset || {}),
    }, signal)
    return { key, pages: Object.values(data.query?.pages || {}), next: data.continue || null }
  }))
  const successful = batches.filter((batch) => batch.status === 'fulfilled').map((batch) => batch.value)
  if (!successful.length) throw batches[0]?.reason || new Error('Map search is temporarily unavailable.')
  const matches = new Map()
  for (const batch of successful) {
    for (const page of batch.pages) {
      const map = mapFromPage(page)
      if (!map) continue
      const score = relevance(page, map, keywords)
      if (score !== null && !matches.has(map.pageId)) matches.set(map.pageId, { map, score })
    }
  }
  const next = Object.fromEntries(successful.filter((batch) => batch.next).map((batch) => [batch.key, batch.next]))
  const result = {
    results: [...matches.values()].sort((a, b) => b.score - a.score).map(({ map }) => map),
    next: Object.keys(next).length ? next : null,
  }
  if (cache.size >= 30) cache.delete(cache.keys().next().value)
  cache.set(cacheKey, result)
  return result
}

export async function getDisplayImage(map) {
  try {
    const data = await request({ pageids: String(map.pageId), iiurlwidth: '1600' }, AbortSignal.timeout(7000))
    return data.query?.pages?.[map.pageId]?.imageinfo?.[0]?.thumburl || map.thumbnail
  } catch {
    return map.thumbnail
  }
}
