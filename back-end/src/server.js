import app from './app.js'

const port = Number(process.env.PORT || 3001)

const server = app.listen(port, () => {
  console.log(`StockSim API listening on http://localhost:${port}`)
})

server.on('error', (error) => {
  console.error(`Could not start StockSim API: ${error.message}`)
  process.exitCode = 1
})
