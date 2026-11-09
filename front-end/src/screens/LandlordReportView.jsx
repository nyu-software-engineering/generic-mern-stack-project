import { useEffect, useState } from 'react'
import { useParams } from 'react-router'
import Card from '../components/ui/Card.jsx'
import ScreenTitle from '../components/ui/ScreenTitle.jsx'
import { getSharedReport } from '../data/api.js'
import { formatDate } from '../data/format.js'

function buildRows(sections) {
  const rows = []
  if (sections.monthsVerified !== undefined) {
    rows.push({ label: 'Verified rent payments', value: `${sections.monthsVerified} months` })
  }
  if (sections.onTimePayments !== undefined) {
    rows.push({ label: 'Paid on time', value: `${sections.onTimePayments} of ${sections.totalPayments}` })
  }
  if (sections.incomeStability !== undefined) {
    rows.push({ label: 'Income stability', value: sections.incomeStability })
  }
  if (sections.rentToIncomePercent !== undefined) {
    rows.push({ label: 'Rent compared to income', value: `${sections.rentToIncomePercent}%` })
  }
  return rows
}

export default function LandlordReportView() {
  const { reportId, linkId } = useParams()
  const openedFromShareLink = Boolean(linkId)
  const [report, setReport] = useState(undefined)

  useEffect(() => {
    getSharedReport(reportId ?? linkId).then((found) => setReport(found ?? null))
  }, [reportId, linkId])

  const header = openedFromShareLink && (
    <p className="mb-8 border-b border-line pb-4 text-lg font-bold tracking-tight">Leverage</p>
  )

  if (report === undefined) {
    return <p className="px-5 py-6 text-sm text-muted">Loading…</p>
  }

  if (report === null) {
    return (
      <div className={openedFromShareLink ? 'px-5 py-6' : ''}>
        {header}
        <ScreenTitle title="This link isn't valid" subtitle="Check the link the renter sent you." />
      </div>
    )
  }

    if (!report.linkActive) {
    return (
      <div className={openedFromShareLink ? 'px-5 py-6' : ''}>
        {header}
        <ScreenTitle title="This report is no longer available" subtitle="The renter has turned off this share link." />
      </div>
    )
  }

  return (
    <div className={openedFromShareLink ? 'px-5 py-6' : ''}>
      {header}
      <ScreenTitle title={`${report.renterFirstName}'s Reliability Report`} subtitle="Shared privately with you. Transactions are never shown." />
      <p className="mb-6 inline-block border border-accent bg-accent-soft px-3 py-1.5 text-sm font-semibold text-accent">
        ✓ Verified by Leverage on {formatDate(report.verifiedOn)}
      </p>
      <Card>
        <dl className="divide-y divide-line">
          {buildRows(report.sharedSections).map((row) => (
            <div key={row.label} className="flex items-center justify-between py-3">
              <dt className="text-sm text-muted">{row.label}</dt>
              <dd className="font-semibold">{row.value}</dd>
            </div>
          ))}
        </dl>
      </Card>
    </div>
  )
}
