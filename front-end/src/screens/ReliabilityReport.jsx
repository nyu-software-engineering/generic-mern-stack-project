import { useEffect, useState } from 'react'
import Button from '../components/ui/Button.jsx'
import Card from '../components/ui/Card.jsx'
import ScreenTitle from '../components/ui/ScreenTitle.jsx'
import SectionTitle from '../components/ui/SectionTitle.jsx'
import { getReport } from '../data/api.js'
import { formatDate } from '../data/format.js'

export default function ReliabilityReport() {
  // Keep the report data and any loading error here.
  const [report, setReport] = useState(null)
  const [error, setError] = useState('')

  // Load the report when this screen opens.
  useEffect(() => {
    getReport()
      .then(setReport)
      .catch(() => setError('We could not load your report. Please try again.'))
  }, [])

  // Show a message while the report is loading.
  if (!report && !error) {
    return <p className="text-sm text-muted">Loading your report...</p>
  }

  // Let the user know if the report could not load.
  if (error) {
    return <p className="text-sm text-negative">{error}</p>
  }

  // Show the report title and verification date.
  return (
    <div className="space-y-4">
      <ScreenTitle
        title="Reliability Report"
        subtitle={`Prepared for ${report.renterFirstName} · Verified ${formatDate(report.verifiedOn)}`}
      />

      {/* Show which bank account was verified. */}
      <Card>
        <SectionTitle>Verified account</SectionTitle>
        <p className="text-sm font-semibold">Verified with {report.bankName}</p>
        <p className="mt-1 text-sm text-muted">
          {report.monthsVerified} months of payment history reviewed
        </p>
      </Card>

      {/* Summarize the rent payments that were on time. */}
      <Card>
        <SectionTitle>Rent payment history</SectionTitle>
        <p className="text-2xl font-semibold">
          {report.onTimePayments} of {report.totalPayments} on time
        </p>
        <p className="mt-1 text-sm text-muted">
          Your verified rent payments are summarized here.
        </p>
      </Card>

      {/* Show the income stability from the report data. */}
      <Card>
        <SectionTitle>Income stability</SectionTitle>
        <p className="text-lg font-semibold">{report.incomeStability}</p>
        <p className="mt-1 text-sm text-muted">
          Based on the income patterns in your verified history.
        </p>
      </Card>

      {/* Show how much of the income goes toward rent. */}
      <Card>
        <SectionTitle>Rent compared with income</SectionTitle>
        <p className="text-2xl font-semibold">{report.rentToIncomePercent}%</p>
        <p className="mt-1 text-sm text-muted">
          The share of your income that goes toward rent.
        </p>
      </Card>

      {/* Open the page with the renter's shared links. */}
      <Button to="/share-links" variant="secondary">
        View shared links
      </Button>
    </div>
  )
}