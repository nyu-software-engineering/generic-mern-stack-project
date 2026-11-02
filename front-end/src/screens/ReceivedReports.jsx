import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import ScreenTitle from '../components/ui/ScreenTitle.jsx'
import SectionTitle from '../components/ui/SectionTitle.jsx'
import { getReceivedReports } from '../data/api.js'
import { formatDate } from '../data/format.js'

function ReportList({ reports }) {
  return (
    <ul className="mb-8 divide-y divide-line border-y border-line">
      {reports.map((report) => (
        <li key={report.id} className="flex items-center justify-between py-4">
          <div>
            <p className="font-semibold">{report.renterName}</p>
            <p className="text-sm text-muted">Shared {formatDate(report.sharedOn)}</p>
          </div>
          <Link to={`/landlord/reports/${report.id}`} className="border border-ink px-4 py-2 text-sm font-semibold hover:bg-canvas">
            View
          </Link>
        </li>
      ))}
    </ul>
  )
}

export default function ReceivedReports() {
  const [reports, setReports] = useState([])

  useEffect(() => {
    getReceivedReports().then(setReports)
  }, [])

  const newReports = reports.filter((report) => report.isNew)
  const earlierReports = reports.filter((report) => !report.isNew)

  return (
    <div>
      <ScreenTitle title="Received reports" subtitle="Reliability Reports renters have shared with you." />
      {newReports.length > 0 && (
        <>
          <SectionTitle>New</SectionTitle>
          <ReportList reports={newReports} />
        </>
      )}
      {earlierReports.length > 0 && (
        <>
          <SectionTitle>Earlier</SectionTitle>
          <ReportList reports={earlierReports} />
        </>
      )}
    </div>
  )
}
