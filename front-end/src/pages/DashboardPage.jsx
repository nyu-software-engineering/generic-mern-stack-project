import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Card, PageHeader } from '../components'
import { getItems, getWears } from '../services/closetService'
import { costPerWear, formatMoney, withWearStats } from '../utils/itemStats'
 
const VIEWS = [
  { title: 'Closet Summary', description: 'total spend, avg cost-per-wear, items', path: '/dashboard/summary' },
  { title: 'Item Rankings', description: 'best / worst value, sortable', path: '/dashboard/rankings' },
  { title: 'Spend by Category', description: 'where the money goes', path: '/dashboard/categories' },
]
 
const DashboardPage = () => {
  const [totalSpend, setTotalSpend] = useState(0)
  const [averageCostPerWear, setAverageCostPerWear] = useState(null)
 
  useEffect(() => {
    const loadTotals = async () => {
      const items = await getItems()
      const wears = await getWears()
 
      let spend = 0
      let wearCount = 0
      withWearStats(items, wears).forEach(item => {
        spend += item.price
        wearCount += item.wearCount
      })
 
      setTotalSpend(spend)
      setAverageCostPerWear(costPerWear(spend, wearCount))
    }
 
    loadTotals()
  }, [])
 
  return (
    <div className="pb-8">
      <PageHeader title="Dashboard" />
 
      <p className="px-4 pb-4 text-sm text-stone-500">
        {formatMoney(totalSpend)} spent ·{' '}
        {averageCostPerWear === null ? 'No wears yet' : `${formatMoney(averageCostPerWear)} avg / wear`}
      </p>
 
      <div className="flex flex-col gap-3 px-4">
        {VIEWS.map(view => (
          <Link key={view.path} to={view.path} className="block">
            <Card className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-stone-900">{view.title}</p>
                <p className="text-sm text-stone-500">{view.description}</p>
              </div>
              <span className="text-stone-700">→</span>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
 
export default DashboardPage