import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Button, EmptyState, Input, Tabs } from '../components'
import { getCategories, getItems, getWears, logWear } from '../services/closetService'
import { formatMoney, withWearStats } from '../utils/itemStats'

export default function ClosetPage() {
  const [items, setItems] = useState(null)
  const [wears, setWears] = useState([])
  const [categories, setCategories] = useState([])
  const [category, setCategory] = useState('')
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState('value')
  const [isGrid, setIsGrid] = useState(true)
  const [pendingItems, setPendingItems] = useState([])
  const [wearMessage, setWearMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false

    Promise.all([getItems(), getWears(), getCategories()])
      .then(([itemList, wearList, categoryList]) => {
        if (cancelled) return
        setItems(itemList)
        setWears(wearList)
        setCategories(categoryList)
      })
      .catch(() => {
        if (!cancelled) setError('Unable to load your closet. Please refresh to try again.')
      })

    return () => {
      cancelled = true
    }
  }, [])

  const closet = withWearStats(items ?? [], wears)
  const wornItems = closet.filter((item) => item.costPerWear !== null)
  const average = wornItems.length
    ? wornItems.reduce((sum, item) => sum + item.costPerWear, 0) / wornItems.length
    : null

  const categoryOptions = [
    { value: '', label: 'All' },
    ...categories.map((name) => ({ value: name, label: name })),
  ]
  const query = search.trim().toLowerCase()
  const visibleItems = closet
    .filter((item) => !category || item.category === category)
    .filter((item) => item.name.toLowerCase().includes(query))
    .sort((a, b) => {
      if (sort === 'most') return b.wearCount - a.wearCount
      if (sort === 'least') return a.wearCount - b.wearCount
      if (a.costPerWear === null) return b.costPerWear === null ? 0 : 1
      if (b.costPerWear === null) return -1
      return a.costPerWear - b.costPerWear
    })

  async function wearToday(item) {
    setPendingItems((current) => [...current, item.id])
    setWearMessage('')

    const now = new Date()
    const date = [
      now.getFullYear(),
      String(now.getMonth() + 1).padStart(2, '0'),
      String(now.getDate()).padStart(2, '0'),
    ].join('-')

    try {
      const wear = await logWear(item.id, date)
      setWears((current) => [...current, wear])
      setWearMessage(`Logged a wear for ${item.name}.`)
    } catch {
      setWearMessage(`Could not log a wear for ${item.name}. Please try again.`)
    } finally {
      setPendingItems((current) => current.filter((id) => id !== item.id))
    }
  }

  return (
    <main className="px-4 pt-10 pb-8">
      <header className="mb-6">
        <div className="flex items-center justify-between gap-4">
          <h1 className="text-xl font-semibold">My Closet</h1>
          <Link
            to="/closet/new"
            aria-label="Add item"
            className="flex h-10 w-10 items-center justify-center bg-stone-900 text-xl font-semibold text-white hover:bg-stone-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-900"
          >
            <span aria-hidden="true">+</span>
          </Link>
        </div>

        {items !== null && (
          <p className="mt-3 text-xs text-stone-500">
            {items.length} {items.length === 1 ? 'item' : 'items'}
            {' · '}
            {average === null ? 'No wears yet' : `avg ${formatMoney(average)} / wear`}
          </p>
        )}
      </header>

      {items?.length > 0 && (
        <div className="mb-4 space-y-3">
          <Tabs
            label="Filter closet by category"
            options={categoryOptions}
            value={category}
            onChange={setCategory}
          />
          <Input
            type="search"
            aria-label="Search closet"
            placeholder="Search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
          <div className="flex items-center justify-between gap-2">
            <label className="flex items-center gap-1 text-sm">
              Sort:
              <select
                className="min-h-9 rounded-lg bg-white px-2 text-sm"
                value={sort}
                onChange={(event) => setSort(event.target.value)}
              >
                <option value="value">Best value</option>
                <option value="most">Most worn</option>
                <option value="least">Least worn</option>
              </select>
            </label>
            <Button size="sm" variant={isGrid ? 'primary' : 'secondary'} aria-pressed={isGrid} onClick={() => setIsGrid(!isGrid)}>
              Grid
            </Button>
          </div>
          <p role="status" className={wearMessage ? 'text-sm text-stone-600' : 'sr-only'}>
            {wearMessage}
          </p>
        </div>
      )}

      {error ? (
        <p role="alert" className="text-sm text-red-600">{error}</p>
      ) : items === null ? (
        <p role="status" className="py-8 text-sm text-stone-500">Loading your closet…</p>
      ) : items.length === 0 ? (
        <EmptyState title="Your closet is empty" description="Use the + button to add your first item." />
      ) : visibleItems.length === 0 ? (
        <EmptyState title="No matching items" description="Try a different search or category." />
      ) : (
        <ul className={`grid gap-3 ${isGrid ? 'grid-cols-2' : 'grid-cols-1'}`}>
          {visibleItems.map((item) => (
            <li key={item.id} className="flex min-w-0 flex-col rounded-lg border border-stone-200 bg-white p-2">
              <Link
                to={`/closet/${item.id}`}
                className={`grow rounded-sm hover:bg-stone-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-900 ${isGrid ? 'block' : 'flex items-center gap-3'}`}
              >
                <img
                  src={item.imageUrl}
                  alt=""
                  loading="lazy"
                  className={`bg-stone-100 object-cover ${isGrid ? 'aspect-[5/4] w-full' : 'size-20 shrink-0'}`}
                />
                <div className="min-w-0">
                  <h2 className="mt-2 truncate text-sm" title={item.name}>{item.name}</h2>
                  <p className="mt-1 text-xs">
                    {item.costPerWear === null ? 'No wears yet' : `${formatMoney(item.costPerWear)} / wear`}
                  </p>
                  <p className="mt-2 text-xs text-stone-600">
                    {item.wearCount} {item.wearCount === 1 ? 'wear' : 'wears'}
                  </p>
                </div>
              </Link>
              <Button
                size="sm"
                variant="secondary"
                className="mt-2 self-end"
                aria-label={`Wear ${item.name} today`}
                disabled={pendingItems.includes(item.id)}
                onClick={() => wearToday(item)}
              >
                + Wore it
              </Button>
            </li>
          ))}
        </ul>
      )}
    </main>
  )
}
