export function getJobHref(id) {
  return `#/jobs/${encodeURIComponent(id)}`
}

export function parseJobRoute(hash) {
  const path = hash.replace(/^#/, '')
  if (path === '' || path === '/' || path === '/jobs') return { kind: 'browse' }
  const match = /^\/jobs\/([^/]+)$/.exec(path)
  if (match) {
    try {
      return { kind: 'details', id: decodeURIComponent(match[1]) }
    } catch {
      return { kind: 'unknown' }
    }
  }
  return { kind: 'unknown' }
}
