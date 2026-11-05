// Service functions for closet items and wears. They work on in-memory mock
// data for now and return promises, so the screens will not need to change
// when these switch to calling the back-end API.
import { mockItems, picsumUrl, CATEGORIES } from '../data/mockItems'
import { mockWears } from '../data/mockWears'

let items = mockItems.map((item) => ({ ...item }))
let wears = mockWears.map((wear) => ({ ...wear }))
let nextId = Date.now()

const MOCK_DELAY_MS = 150

function respond(value) {
  return new Promise((resolve) => {
    setTimeout(() => resolve(structuredClone(value)), MOCK_DELAY_MS)
  })
}

function fail(message) {
  return new Promise((_, reject) => {
    setTimeout(() => reject(new Error(message)), MOCK_DELAY_MS)
  })
}

function newId(prefix) {
  nextId += 1
  return `${prefix}-${nextId}`
}

function today() {
  return new Date().toISOString().slice(0, 10)
}

// Items

export function getCategories() {
  return respond(CATEGORIES)
}

export function getItems() {
  return respond(items)
}

export function getItem(itemId) {
  const item = items.find((i) => i.id === itemId)
  return item ? respond(item) : fail(`Item ${itemId} not found`)
}

export function createItem({ name, category, price, purchaseDate = null, imageUrl = null }) {
  const id = newId('item')
  const item = {
    id,
    name,
    category,
    price: Number(price),
    purchaseDate,
    imageUrl: imageUrl ?? picsumUrl(id),
  }
  items = [...items, item]
  return respond(item)
}

export function updateItem(itemId, changes) {
  const existing = items.find((i) => i.id === itemId)
  if (!existing) return fail(`Item ${itemId} not found`)

  const updated = { ...existing, ...changes, id: itemId }
  if (changes.price !== undefined) updated.price = Number(changes.price)
  items = items.map((i) => (i.id === itemId ? updated : i))
  return respond(updated)
}

export function deleteItem(itemId) {
  if (!items.some((i) => i.id === itemId)) return fail(`Item ${itemId} not found`)

  items = items.filter((i) => i.id !== itemId)
  wears = wears.filter((w) => w.itemId !== itemId)
  return respond({ id: itemId })
}

// Wears

// All wears, or only one item's wears when itemId is given. Newest first.
export function getWears(itemId) {
  const result = itemId ? wears.filter((w) => w.itemId === itemId) : wears
  return respond([...result].sort((a, b) => b.date.localeCompare(a.date)))
}

export function logWear(itemId, date = today()) {
  if (!items.some((i) => i.id === itemId)) return fail(`Item ${itemId} not found`)

  const wear = { id: newId('wear'), itemId, type: 'logged', date }
  wears = [...wears, wear]
  return respond(wear)
}

// period is 'this-year', 'last-year', or 'all-time'
export function addWearEstimate(itemId, { period, count }) {
  if (!items.some((i) => i.id === itemId)) return fail(`Item ${itemId} not found`)
  const amount = Number(count)
  if (!Number.isSafeInteger(amount) || amount <= 0) return fail('Estimated wears must be a positive whole number')
  if (!['this-year', 'last-year', 'all-time'].includes(period)) return fail('Invalid estimate period')
  const total = wears.filter((wear) => wear.itemId === itemId)
    .reduce((sum, wear) => sum + (wear.type === 'estimate' ? wear.count : 1), 0)
  if (!Number.isSafeInteger(total + amount)) return fail('Wear count is too large')

  const estimate = { id: newId('wear'), itemId, type: 'estimate', period, count: Number(count), date: today() }
  wears = [...wears, estimate]
  return respond(estimate)
}

// Removes a single wear record (used by undo).
export function deleteWear(wearId) {
  if (!wears.some((w) => w.id === wearId)) return fail(`Wear ${wearId} not found`)

  wears = wears.filter((w) => w.id !== wearId)
  return respond({ id: wearId })
}
