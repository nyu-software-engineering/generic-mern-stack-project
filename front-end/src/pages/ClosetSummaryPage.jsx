import { useEffect, useState } from 'react'
import { Card, PageHeader } from '../components'
import { getCategories, getItems, getWears } from '../services/closetService'
import { costPerWear, formatMoney, withWearStats } from '../utils/itemStats'
 
const Stat = ({ value, label }) => {
  return (
    <Card>
      <p className="text-2xl font-semibold text-stone-900">{value}</p>
      <p className="mt-1 text-sm text-stone-500">{label}</p>
    </Card>
  )
}
 
const ClosetSummaryPage = () => {
  const [stats, setStats] = useState(null)
 
  useEffect(() => {
    const loadStats = async () => {
      const items = await getItems()
      const wears = await getWears()
      const categories = await getCategories()
      const itemsWithWears = withWearStats(items, wears)
 
      let totalSpend = 0
      let totalWears = 0
      let itemCount = 0
      let neverWorn = 0
 
      itemsWithWears.forEach(item => {
        totalSpend = totalSpend + item.price
        totalWears = totalWears + item.wearCount
        itemCount++
        if (item.wearCount === 0) {
          neverWorn++
        }
      })
 
      let bestCategory = 'None yet'
      let bestCost = null
 
      categories.forEach(category => {
        let spend = 0
        let wearCount = 0
 
        itemsWithWears.forEach(item => {
          if (item.category === category) {
            spend = spend + item.price
            wearCount = wearCount + item.wearCount
          }
        })
 
        const cost = costPerWear(spend, wearCount)
        if (cost != null) {
          if (bestCost === null) {
            bestCost = cost
            bestCategory = category
          }
          if (cost < bestCost) {
            bestCost = cost
            bestCategory = category
          }
        }
      })
 
      setStats({
        totalSpend,
        averageCost: costPerWear(totalSpend, totalWears),
        itemCount,
        totalWears,
        neverWorn,
        bestCategory,
      })
    }
 
    loadStats()
  }, [])
 
  return (
    <div className="pb-8">
      <PageHeader title="Closet summary" backTo="/dashboard" />
 
      {stats === null ? (
        <p className="px-4 py-8 text-sm text-stone-500">Loading...</p>
      ) : (
        <div className="grid grid-cols-2 gap-3 px-4">
          <Stat value={formatMoney(stats.totalSpend)} label="Total spend" />
          <Stat
            value={stats.averageCost === null ? 'No wears yet' : formatMoney(stats.averageCost)}
            label="Avg cost / wear"
          />
          <Stat value={stats.itemCount} label="Items" />
          <Stat value={stats.totalWears} label="Total wears" />
          <Stat value={stats.neverWorn} label="Never worn" />
          <Stat value={stats.bestCategory} label="Best-value category" />
        </div>
      )}
    </div>
  )
}
 
export default ClosetSummaryPage