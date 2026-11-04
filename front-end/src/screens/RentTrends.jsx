import { useEffect, useState } from 'react'
import { useParams } from 'react-router'
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import Button from '../components/ui/Button.jsx'
import Card from '../components/ui/Card.jsx'
import PercentChange from '../components/ui/PercentChange.jsx'
import ScreenTitle from '../components/ui/ScreenTitle.jsx'
import SectionTitle from '../components/ui/SectionTitle.jsx'
import { getArea, getRentTrend } from '../data/api.js'
import { isFollowingArea, setFollowingArea } from '../data/followedAreas.js'
import { formatRent } from '../data/format.js'

const BASE_YEAR = 2023

// Chart colors come from the theme in index.css (the fallbacks are the same values).
const ACCENT = 'var(--color-accent, #1f4d3a)'
const LINE = 'var(--color-line, #e3e3e0)'
const MUTED = 'var(--color-muted, #6b6b6b)'

function axisRent(value) {
  return `$${value.toLocaleString('en-US')}`
}

// Round the chart's y-axis to clean $100 steps so the labels are easy to read.
function axisScale(points) {
  const rents = points.map((point) => point.averageRent)
  const low = Math.floor(Math.min(...rents) / 100) * 100
  const high = Math.ceil(Math.max(...rents) / 100) * 100
  const step = Math.max(100, Math.ceil((high - low) / 4 / 100) * 100)
  const ticks = []
  for (let tick = low; tick <= high + step - 1; tick += step) {
    ticks.push(tick)
  }
  return { domain: [low, ticks[ticks.length - 1]], ticks }
}

export default function RentTrends() {
  const { areaId } = useParams()
  const [area, setArea] = useState(undefined)
  const [points, setPoints] = useState([])
  const [following, setFollowing] = useState(false)

  useEffect(() => {
    getArea(areaId).then((found) => setArea(found ?? null))
    getRentTrend(areaId).then((trend) => setPoints(trend ? trend.points : []))
    isFollowingArea(areaId).then(setFollowing)
  }, [areaId])

  if (area === undefined) {
    return <p className="text-sm text-muted">Loading rent trends…</p>
  }

  if (area === null) {
    return <ScreenTitle title="Area not found" subtitle="We don't have rent data for this area yet." />
  }

  const toggleFollow = async () => {
    await setFollowingArea(areaId, !following)
    setFollowing(!following)
  }

  const scale = points.length > 0 ? axisScale(points) : { domain: ['auto', 'auto'], ticks: undefined }
  const basePoint = points.find((point) => point.year === BASE_YEAR)
  const latestPoint = points[points.length - 1]
  const changeSinceBase =
    basePoint && latestPoint ? ((latestPoint.averageRent - basePoint.averageRent) / basePoint.averageRent) * 100 : null

  return (
    <div>
      <ScreenTitle title={area.name} subtitle={`${area.borough} · How rents here have changed over the past few years.`} />

      <div className="mb-6 grid grid-cols-2 gap-3">
        <Card>
          <p className="text-sm text-muted">Average rent</p>
          <p className="text-2xl font-bold tracking-tight">{formatRent(area.averageRent)}</p>
          <p className="text-xs text-muted">per month</p>
        </Card>
        <Card>
          <p className="text-sm text-muted">Since {BASE_YEAR}</p>
          <p className={`text-2xl font-bold tracking-tight ${changeSinceBase > 0 ? 'text-negative' : 'text-positive'}`}>
            {changeSinceBase === null ? '–' : `${changeSinceBase > 0 ? '+' : ''}${changeSinceBase.toFixed(1)}%`}
          </p>
          <p className="text-xs text-muted">
            <PercentChange value={area.changePastYear} /> past year
          </p>
        </Card>
      </div>

      <SectionTitle>Average rent by year</SectionTitle>
      <div className="h-56 border border-line bg-surface py-4 pr-4">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={points} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
            <CartesianGrid stroke={LINE} vertical={false} />
            <XAxis dataKey="year" tick={{ fill: MUTED, fontSize: 12 }} tickLine={false} axisLine={{ stroke: LINE }} />
            <YAxis
              tickFormatter={axisRent}
              tick={{ fill: MUTED, fontSize: 12 }}
              tickLine={false}
              axisLine={false}
              width={60}
              domain={scale.domain}
              ticks={scale.ticks}
            />
            <Tooltip formatter={(value) => [`${formatRent(value)}/mo`, 'Average rent']} labelStyle={{ fontWeight: 600 }} />
            <Line type="monotone" dataKey="averageRent" stroke={ACCENT} strokeWidth={2.5} dot={{ r: 3, fill: ACCENT }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-6">
        <Button onClick={toggleFollow} variant={following ? 'secondary' : 'primary'}>
          {following ? '✓ Following' : 'Follow this area'}
        </Button>
        <p className="mt-2 text-center text-xs text-muted">
          {following ? "We'll alert you when rents here change a lot. Tap again to unfollow." : 'Get alerted when rents here change a lot.'}
        </p>
      </div>
    </div>
  )
}