import { readFileSync } from 'node:fs'

const profile = JSON.parse(readFileSync(new URL('./profile.json', import.meta.url), 'utf8'))
const applications = JSON.parse(readFileSync(new URL('./applications.json', import.meta.url), 'utf8'))
const discussions = JSON.parse(readFileSync(new URL('./discussions.json', import.meta.url), 'utf8'))
const matches = JSON.parse(readFileSync(new URL('./matches.json', import.meta.url), 'utf8'))

function send(response, status, body) {
  response.statusCode = status
  response.setHeader('Content-Type', 'application/json; charset=utf-8')
  response.setHeader('Cache-Control', 'no-store')
  response.end(JSON.stringify(body))
}

function appMiddleware(request, response, next) {
  const path = new URL(request.url, 'http://localhost').pathname
  const known = ['/api/profile', '/api/applications', '/api/discussions', '/api/matches']
  if (!known.some((item) => path === item || path.startsWith(item + '/'))) return next()
  if (request.method !== 'GET') return send(response, 405, { error: 'Method not allowed' })

  if (path === '/api/profile') return send(response, 200, profile)
  if (path === '/api/applications') return send(response, 200, applications)
  if (path.startsWith('/api/applications/')) {
    const id = decodeURIComponent(path.slice('/api/applications/'.length))
    const application = applications.find((item) => item.id === id)
    return send(response, application ? 200 : 404, application ?? { error: 'Application not found' })
  }
  if (path.startsWith('/api/discussions/')) {
    const jobId = decodeURIComponent(path.slice('/api/discussions/'.length))
    return send(response, 200, discussions.filter((item) => item.jobId === jobId))
  }
  if (path.startsWith('/api/matches/')) {
    const jobId = decodeURIComponent(path.slice('/api/matches/'.length))
    const match = matches.find((item) => item.jobId === jobId)
    return send(response, match ? 200 : 404, match ?? { error: 'Match not found' })
  }
  return send(response, 404, { error: 'Not found' })
}

export default function appMockApi() {
  return {
    name: 'careerhive-app-mock-api',
    configureServer(server) { server.middlewares.use(appMiddleware) },
    configurePreviewServer(server) { server.middlewares.use(appMiddleware) },
  }
}