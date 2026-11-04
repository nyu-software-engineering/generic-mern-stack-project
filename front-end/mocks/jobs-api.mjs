import { readFileSync } from 'node:fs'

const jobs = JSON.parse(readFileSync(new URL('./jobs.json', import.meta.url), 'utf8'))

function jobsMiddleware(request, response, next) {
  const path = new URL(request.url, 'http://localhost').pathname
  if (path !== '/api/jobs' && !path.startsWith('/api/jobs/')) return next()

  response.setHeader('Content-Type', 'application/json; charset=utf-8')
  response.setHeader('Cache-Control', 'no-store')
  if (request.method !== 'GET') {
    response.statusCode = 405
    response.setHeader('Allow', 'GET')
    return response.end(JSON.stringify({ error: 'Method not allowed' }))
  }
  if (path === '/api/jobs') return response.end(JSON.stringify(jobs))

  let id
  try {
    id = decodeURIComponent(path.slice('/api/jobs/'.length))
  } catch {
    response.statusCode = 400
    return response.end(JSON.stringify({ error: 'Invalid job identifier' }))
  }
  const job = jobs.find((item) => item.id === id)
  response.statusCode = job ? 200 : 404
  response.end(JSON.stringify(job ?? { error: 'Job not found' }))
}

export default function jobsMockApi() {
  return {
    name: 'careerhive-jobs-mock-api',
    configureServer(server) { server.middlewares.use(jobsMiddleware) },
    configurePreviewServer(server) { server.middlewares.use(jobsMiddleware) },
  }
}
