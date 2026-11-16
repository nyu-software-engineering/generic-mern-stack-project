import express from 'express'
import authRouter from './routes/auth.js'

const app = express()

app.disable('x-powered-by')
app.use(express.json({ limit: '10kb' }))

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' })
})

app.use('/api/auth', authRouter)

app.use((_req, res) => {
  res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Route not found.' } })
})

// Keep API errors in JSON without exposing request bodies or stack traces.
app.use((error, _req, res, next) => {
  if (res.headersSent) return next(error)

  if (error.type === 'entity.parse.failed') {
    return res.status(400).json({ error: { code: 'INVALID_JSON', message: 'Request body must be valid JSON.' } })
  }

  if (error.type === 'entity.too.large') {
    return res.status(413).json({ error: { code: 'BODY_TOO_LARGE', message: 'Request body exceeds the 10 KB limit.' } })
  }

  res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred.' } })
})

export default app
