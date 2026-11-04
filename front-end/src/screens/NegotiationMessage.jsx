import { useEffect, useState } from 'react'
import { useParams } from 'react-router'
import Button from '../components/ui/Button.jsx'
import Card from '../components/ui/Card.jsx'
import ScreenTitle from '../components/ui/ScreenTitle.jsx'
import SectionTitle from '../components/ui/SectionTitle.jsx'
import TextField from '../components/ui/TextField.jsx'
import Toggle from '../components/ui/Toggle.jsx'
import { getApartmentCheck, getArea, getComparables, getProfile, getReport } from '../data/api.js'
import { formatRent } from '../data/format.js'

function roundToNearest25(amount) {
  return Math.round(amount / 25) * 25
}

// Builds the suggested message from the renter's numbers. The renter can edit it before copying.
function draftMessage({ check, areaName, comparableCount, currentRent, proposedRent, report, firstName }) {
  const isRenewal = currentRent > 0
  const percent = Math.round(((proposedRent - check.localAverage) / check.localAverage) * 100)

  let comparison = 'right at the local average'
  if (percent > 0) {
    comparison = `about ${percent}% above the local average`
  } else if (percent < 0) {
    comparison = `about ${Math.abs(percent)}% below the local average`
  }

  const opening = isRenewal
    ? `Thank you for sending the renewal terms for ${check.address}. Before I sign, I looked at what similar apartments nearby rent for.`
    : `Thank you for showing me ${check.address}. Before I apply, I looked at what similar apartments nearby rent for.`

  const market = `${comparableCount} comparable ${check.bedrooms}-bedroom apartments in ${areaName} rent for between ${formatRent(check.rangeLow)} and ${formatRent(check.rangeHigh)}, and the local average is ${formatRent(check.localAverage)}.`

  let rent = `At ${formatRent(proposedRent)}, the rent is ${comparison}.`
  if (isRenewal) {
    const increase = Math.round(((proposedRent - currentRent) / currentRent) * 100)
    rent = `The proposed rent of ${formatRent(proposedRent)} is a ${increase}% increase from my current ${formatRent(currentRent)}, and puts it ${comparison}.`
  }

  const paragraphs = ['Hi,', opening, `${market} ${rent}`]

  if (report) {
    paragraphs.push(
      `I've also paid rent on time ${report.onTimePayments} out of ${report.totalPayments} months, verified through Leverage, so you can count on me as a reliable tenant.`,
    )
  }

  if (percent > 0) {
    const target = roundToNearest25(Math.max(check.localAverage, isRenewal ? currentRent : 0))
    paragraphs.push(`Would you consider ${formatRent(target)} a month? I'd be glad to sign at that rent.`)
  } else {
    paragraphs.push("The rent looks fair for the area, and I'd be glad to move forward.")
  }

  paragraphs.push(`Thank you,\n${firstName}`)
  return paragraphs.join('\n\n')
}

export default function NegotiationMessage() {
  const { checkId } = useParams()
  const [data, setData] = useState(undefined)
  const [currentRent, setCurrentRent] = useState('')
  const [proposedRent, setProposedRent] = useState('')
  const [includeReport, setIncludeReport] = useState(true)
  const [editedMessage, setEditedMessage] = useState(null)
  const [copyStatus, setCopyStatus] = useState('idle')

  useEffect(() => {
    getApartmentCheck(checkId).then(async (check) => {
      if (!check) {
        setData(null)
        return
      }
      const [area, comparables, report, profile] = await Promise.all([
        getArea(check.areaId),
        getComparables(check.id),
        getReport(),
        getProfile(),
      ])
      setProposedRent(String(check.askingRent))
      setData({ check, area, comparables, report, firstName: profile.name.split(' ')[0] })
    })
  }, [checkId])

  if (data === undefined) {
    return <p className="text-sm text-muted">Loading…</p>
  }

  if (data === null) {
    return <ScreenTitle title="Apartment not found" subtitle="Go back to Negotiate and choose an apartment." />
  }

  const { check, area, comparables, report, firstName } = data
  const proposed = Number(proposedRent)
  const current = Number(currentRent)
  const comparableAverage = Math.round(comparables.reduce((sum, item) => sum + item.rent, 0) / comparables.length)

  const suggestedMessage =
    proposed > 0
      ? draftMessage({
          check,
          areaName: area.name,
          comparableCount: comparables.length,
          currentRent: current,
          proposedRent: proposed,
          report: includeReport ? report : null,
          firstName,
        })
      : ''
  const message = editedMessage ?? suggestedMessage

  const changeInput = (setter) => (event) => {
    setter(event.target.value)
    setCopyStatus('idle')
  }

  const copyMessage = async () => {
    try {
      await navigator.clipboard.writeText(message)
      setCopyStatus('copied')
    } catch {
      setCopyStatus('failed')
    }
  }

  return (
    <div>
      <ScreenTitle title="Negotiation message" subtitle={check.address} />

      <div className="mb-6 grid grid-cols-2 gap-3">
        <TextField
          label="Current rent ($)"
          id="currentRent"
          type="number"
          inputMode="numeric"
          min="0"
          placeholder="If renewing"
          value={currentRent}
          onChange={changeInput(setCurrentRent)}
        />
        <TextField
          label="Proposed rent ($)"
          id="proposedRent"
          type="number"
          inputMode="numeric"
          min="1"
          value={proposedRent}
          onChange={changeInput(setProposedRent)}
        />
      </div>

      <SectionTitle>What the message is based on</SectionTitle>
      <Card>
        <dl className="divide-y divide-line">
          <div className="flex justify-between py-2.5">
            <dt className="text-sm text-muted">Comparable apartments</dt>
            <dd className="font-semibold">{comparables.length} nearby</dd>
          </div>
          <div className="flex justify-between py-2.5">
            <dt className="text-sm text-muted">Their average rent</dt>
            <dd className="font-semibold">{formatRent(comparableAverage)}</dd>
          </div>
          <div className="flex justify-between py-2.5">
            <dt className="text-sm text-muted">Range nearby</dt>
            <dd className="font-semibold whitespace-nowrap">
              {formatRent(check.rangeLow)} – {formatRent(check.rangeHigh)}
            </dd>
          </div>
          <div className="flex justify-between py-2.5">
            <dt className="text-sm text-muted">Local average</dt>
            <dd className="font-semibold">{formatRent(check.localAverage)}</dd>
          </div>
        </dl>
      </Card>

      <div className="mt-4 flex items-center justify-between gap-4 border border-line bg-surface p-4">
        <div>
          <p className="text-sm font-semibold">Mention my on-time payments</p>
          <p className="text-xs text-muted">From your Reliability Report</p>
        </div>
        <Toggle checked={includeReport} onChange={setIncludeReport} label="Mention my on-time payments" />
      </div>

      <div className="mt-6">
        <div className="mb-1.5 flex items-center justify-between">
          <label htmlFor="message" className="text-sm font-medium">
            Your message
          </label>
          {editedMessage !== null && (
            <button type="button" onClick={() => setEditedMessage(null)} className="text-sm font-semibold text-accent hover:underline">
              Reset to suggested
            </button>
          )}
        </div>
        <textarea
          id="message"
          rows={14}
          value={message}
          onChange={(event) => {
            setEditedMessage(event.target.value)
            setCopyStatus('idle')
          }}
          placeholder="Enter the proposed rent to get a suggested message."
          className="w-full border border-line bg-surface px-3 py-3 text-sm leading-relaxed text-ink focus:border-ink focus:outline-none"
        />
        <p className="mt-1 text-xs text-muted">Edit anything you like. Leverage never sends messages for you.</p>
      </div>

      {copyStatus === 'copied' && (
        <p className="mt-4 border border-positive px-3 py-2 text-sm font-semibold text-positive" role="status">
          ✓ Message copied. Paste it into your email or text to the landlord.
        </p>
      )}
      {copyStatus === 'failed' && (
        <p className="mt-4 text-sm text-negative" role="status">
          Couldn't copy automatically. Select the message and copy it.
        </p>
      )}

      <div className="mt-6 space-y-3">
        <Button onClick={copyMessage} disabled={message.trim() === ''}>
          {copyStatus === 'copied' ? 'Copy again' : 'Copy message'}
        </Button>
        <Button to={`/negotiate/${check.id}/outcome`} variant="secondary">
          Record what happened
        </Button>
      </div>
    </div>
  )
}