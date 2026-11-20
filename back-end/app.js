import express from 'express' 
const app = express() 
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

import dotenv from 'dotenv' // load environmental variables from a hidden file named .env
dotenv.config({ silent: true })
import morgan from 'morgan' // middleware for nice logging of incoming HTTP requests
import cors from 'cors' 

// load mock JSON data
const organizations = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'data', 'organizations.json'), 'utf8')
)
const flyers = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'data', 'flyers.json'), 'utf8')
)

app.use(cors())
app.use(morgan('dev'))

app.use(express.json()) 
app.use(express.urlencoded({ extended: true })) 

app.use('/static', express.static('public'))

app.get('/', (req, res) => {
  res.send('Flier backend is running!')
})

app.post('/api/users/saved-flyers/:id', (req, res) => {
  const flyerId = req.params.id

  const flyer = flyers.find(f => String(f.id) === String(flyerId))

  if (!flyer) {
    return res.status(404).json({
      status: 'error',
      message: `Flyer #${flyerId} not found`,
    })
  }

  const responseData = {
    status: 'success',
    message: `Flyer #${flyerId} has been saved to user's saved flyers.`,
    savedFlyerId: flyerId,
    flyer,
  }

  res.status(201).json(responseData)
})

app.get('/api/organizations', (req, res) => {
  res.status(200).json(organizations)
})

app.get('/api/organizations/:id', (req, res) => {
  const orgId = req.params.id

  const organization = organizations.find(org => String(org.id) === String(orgId))

  if (!organization) {
    return res.status(404).json({
      status: 'error',
      message: `Organization #${orgId} not found`,
    })
  }

  res.status(200).json(organization)
})

// flyer image uploads (Multer)
app.use('/api/uploads', uploadRoutes)

export default app // 