import express from 'express'
import fs from 'fs'

// load the apartment checks once, when the server starts
const apartmentChecks = JSON.parse(
  fs.readFileSync(new URL('../data/apartment-checks.json', import.meta.url)),
)
// load the areas, used to work out which area an address is in
const areas = JSON.parse(
  fs.readFileSync(new URL('../data/areas.json', import.meta.url)),
)

// finds the area an address is in, by the area's name or one of its zip codes
function findArea(address) {
  const text = address.toLowerCase()
  for (const area of areas) {
    if (text.includes(area.name.toLowerCase())) {
      return area
    }
    for (const zipCode of area.zipCodes) {
      if (text.includes(zipCode)) {
        return area
      }
    }
  }
  return null
}
const router = express.Router()

// all checks, newest first
router.get('/', (req, res) => {
  const checks = [...apartmentChecks].sort((a, b) =>
    b.checkedOn.localeCompare(a.checkedOn),
  )
  res.json(checks)
})

// one check by its id
router.get('/:checkId', (req, res) => {
  const checkId = req.params.checkId
  const check = apartmentChecks.find(savedCheck => savedCheck.id === checkId)

  if (check) {
    res.json(check)
  } else {
    res.status(404).json({ error: 'Apartment check not found.' })
  }
})

// works out the fair-price result for a new apartment, it isn't saved yet
router.post('/', (req, res) => {
  const address = req.body.address
  const askingRent = Number(req.body.askingRent)

  if (!address || !(askingRent > 0)) {
    return res
      .status(400)
      .json({ error: 'Please enter the address and the asking rent.' })
  }

  const area = findArea(address)
  if (!area) {
    return res.status(400).json({
      error:
        'We could not find that area. Add the neighborhood or ZIP code to the address.',
    })
  }

  const localAverage = area.averageRent
  // percent above (+) or below (-) the local average, to one decimal
  const percentVsAverage =
    Math.round(((askingRent - localAverage) / localAverage) * 1000) / 10

  const check = {
    id: `chk-${apartmentChecks.length + 1}`,
    address: address,
    areaId: area.id,
    askingRent: askingRent,
    bedrooms: req.body.bedrooms,
    bathrooms: req.body.bathrooms,
    rangeLow: Math.round(localAverage * 0.95),
    rangeHigh: Math.round(localAverage * 1.05),
    localAverage: localAverage,
    percentVsAverage: percentVsAverage,
    checkedOn: new Date().toISOString().slice(0, 10),
  }

  res.json(check)
})

export default router
