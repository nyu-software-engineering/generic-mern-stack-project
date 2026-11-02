import { useEffect, useState } from 'react'
import Button from '../components/ui/Button.jsx'
import Card from '../components/ui/Card.jsx'
import ScreenTitle from '../components/ui/ScreenTitle.jsx'
import SectionTitle from '../components/ui/SectionTitle.jsx'
import { getReceivedReports } from '../data/api.js'
import { formatDate } from '../data/format.js'

const RECENT_COUNT = 3

export default function LandlordHome() {
  const [reports, setReports] = useState([])

  useEffect(() => {
    getReceivedReports().then(setReports)
  }, [])

  const newCount = reports.filter((report) => report.isNew).length

  return (
    <div>
      <ScreenTitle title="Welcome back" subtitle={`${newCount} new ${newCount === 1 ? 'report' : 'reports'} from renters`} />
      <div className="mb-8">
        <Button to="/landlord/reports">Received reports</Button>
      </div>
      <SectionTitle>Recently shared with you</SectionTitle>
      <ul className="space-y-3">
        {reports.slice(0, RECENT_COUNT).map((report) => (
          <li key={report.id}>
            <Card to={`/landlord/reports/${report.id}`}>
              <div className="flex items-center justify-between">
                <p className="font-semibold">{report.renterName}</p>
                <p className="text-sm text-muted">{formatDate(report.sharedOn)}</p>
              </div>
            </Card>
          </li>
        ))}
      </ul>
    </div>
  )
}
