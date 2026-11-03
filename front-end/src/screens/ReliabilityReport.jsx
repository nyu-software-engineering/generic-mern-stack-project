import { useEffect, useState } from 'react'
import Button from '../components/ui/Button.jsx'
import Card from '../components/ui/Card.jsx'
import ScreenTitle from '../components/ui/ScreenTitle.jsx'
import SectionTitle from '../components/ui/SectionTitle.jsx'
import Toggle from '../components/ui/Toggle.jsx'
import { getReport } from '../data/api.js'
import { formatDate } from '../data/format.js'

// Build the shareable sections from the report data.
function buildSections(report) {
  return [
    { id: 'months', label: 'Verified rent payments', value: `${report.monthsVerified} months` },
    { id: 'onTime', label: 'Paid on time', value: `${report.onTimePayments} of ${report.totalPayments}` },
    { id: 'income', label: 'Income stability', value: report.incomeStability },
    { id: 'rentToIncome', label: 'Rent compared to income', value: `${report.rentToIncomePercent}%` },
  ]
}

export default function ReliabilityReport() {
  const [report, setReport] = useState(null)
  const [hiddenSections, setHiddenSections] = useState([])

  // Load the report when the screen opens.
  useEffect(() => {
    getReport().then(setReport)
  }, [])

  // Wait until the report data is ready.
  if (!report) {
    return <p className="text-sm text-muted">Loading your report…</p>
  }

  const sections = buildSections(report)
  const shownSections = sections.filter((section) => !hiddenSections.includes(section.id))

  // Update the preview when a switch changes.
  const setSectionShown = (sectionId, shown) => {
    setHiddenSections(
      shown
        ? hiddenSections.filter((id) => id !== sectionId)
        : [...hiddenSections, sectionId],
    )
  }

  return (
    <div>
      <ScreenTitle
        title="Your Reliability Report"
        subtitle="This is what a landlord sees when you share it."
      />

      {/* Show which bank account and date were verified. */}
      <p className="mb-4 inline-block border border-accent bg-accent-soft px-3 py-1.5 text-sm font-semibold text-accent">
        ✓ Verified with {report.bankName} on {formatDate(report.verifiedOn)}
      </p>

      {/* Preview only the sections that are switched on. */}
      <Card>
        <p className="mb-2 text-lg font-semibold">{report.renterFirstName}</p>
        {shownSections.length === 0 ? (
          <p className="py-3 text-sm text-muted">
            Turn on at least one section to share your report.
          </p>
        ) : (
          <dl className="divide-y divide-line">
            {shownSections.map((section) => (
              <div key={section.id} className="flex items-center justify-between py-3">
                <dt className="text-sm text-muted">{section.label}</dt>
                <dd className="font-semibold">{section.value}</dd>
              </div>
            ))}
          </dl>
        )}
      </Card>

      {/* Let the renter choose which sections to share. */}
      <div className="mt-8">
        <SectionTitle>Choose what to share</SectionTitle>
        <ul className="divide-y divide-line border-y border-line">
          {sections.map((section) => {
            const shown = !hiddenSections.includes(section.id)

            return (
              <li key={section.id} className="flex items-center justify-between py-3">
                <span className={`text-sm ${shown ? 'text-ink' : 'text-muted'}`}>
                  {section.label}
                </span>
                <Toggle
                  checked={shown}
                  onChange={(value) => setSectionShown(section.id, value)}
                  label={`Share ${section.label}`}
                />
              </li>
            )
          })}
        </ul>
      </div>

      {/* Keep sharing disabled when every section is hidden. */}
      <div className="mt-6 space-y-3">
        <Button disabled={shownSections.length === 0}>Share report</Button>
        <Button to="/share-links" variant="ghost">
          See active share links
        </Button>
      </div>
    </div>
  )
}