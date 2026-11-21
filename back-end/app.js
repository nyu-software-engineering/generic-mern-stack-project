import express from 'express'
import morgan from 'morgan'
import cors from 'cors'
import authRouter from './routes/auth.js'
import landlordRouter from './routes/landlord.js'
import apartmentChecksRouter from './routes/apartmentChecks.js'
import rentTrendsRouter from './routes/rentTrends.js'
import outcomesRouter from './routes/outcomes.js'
import bankConnectionRouter from './routes/bankConnection.js'
const app = express()

// log requests, but not during tests
app.use(morgan('dev', { skip: (req, res) => process.env.NODE_ENV === 'test' }))
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.get('/', (req, res) => {
  res.send('Leverage back-end is running')
})

app.use('/auth', authRouter)
app.use('/landlord', landlordRouter)
app.use('/apartment-checks', apartmentChecksRouter)
app.use('/rent-trends', rentTrendsRouter)
app.use('/outcomes', outcomesRouter)
app.use('/bank-connection', bankConnectionRouter)

export default app
