import { useEffect, useState } from 'react'
import { useParams } from 'react-router'
import Button from '../components/ui/Button.jsx'
import ScreenTitle from '../components/ui/ScreenTitle.jsx'
import TextField from '../components/ui/TextField.jsx'
import { getApartmentCheck } from '../data/api.js'
import { formatDate } from '../data/format.js'
import { getOutcome, saveOutcome } from '../data/outcomes.js'

const OUTCOMES = [
  { value: 'rent-lowered', label: 'Rent lowered', asksForFinalRent: true },
  {
    value: 'increase-reduced',
    label: 'Increase reduced',
    asksForFinalRent: true,
  },
  {
    value: 'accepted-as-proposed',
    label: 'Accepted as proposed',
    asksForFinalRent: false,
  },
  {
    value: 'application-accepted',
    label: 'Application accepted',
    asksForFinalRent: false,
  },
  {
    value: 'application-rejected',
    label: 'Application rejected',
    asksForFinalRent: false,
  },
  { value: 'no-response', label: 'No response yet', asksForFinalRent: false },
]

export default function RecordOutcome() {
  const { checkId } = useParams()
  const [check, setCheck] = useState(undefined)
  const [savedOutcome, setSavedOutcome] = useState(() => getOutcome(checkId))
  const [outcome, setOutcome] = useState(savedOutcome?.outcome ?? '')
  const [finalRent, setFinalRent] = useState(
    savedOutcome?.finalRent ? String(savedOutcome.finalRent) : '',
  )
  const [note, setNote] = useState(savedOutcome?.note ?? '')
  const [justSaved, setJustSaved] = useState(false)

  useEffect(() => {
    getApartmentCheck(checkId).then(found => setCheck(found ?? null))
  }, [checkId])

  if (check === undefined) {
    return <p className="text-sm text-muted">Loading…</p>
  }

  if (check === null) {
    return (
      <ScreenTitle
        title="Apartment not found"
        subtitle="Go back to Negotiate and choose an apartment."
      />
    )
  }

  const selected = OUTCOMES.find(option => option.value === outcome)

  // What would be saved right now. Save is only active when this differs from what's already saved.
  const draft = {
    outcome,
    finalRent:
      selected?.asksForFinalRent && Number(finalRent) > 0
        ? Number(finalRent)
        : null,
    note: note.trim(),
  }
  const unchanged =
    savedOutcome !== null &&
    draft.outcome === savedOutcome.outcome &&
    draft.finalRent === savedOutcome.finalRent &&
    draft.note === savedOutcome.note

  const edit = setter => value => {
    setter(value)
    setJustSaved(false)
  }

  const handleSave = event => {
    event.preventDefault()
    const saved = saveOutcome(checkId, draft)
    setSavedOutcome(saved)
    setJustSaved(true)
  }

  return (
    <div>
      <ScreenTitle
        title="What happened?"
        subtitle={
          savedOutcome
            ? `${check.address} · Last updated ${formatDate(savedOutcome.updatedAt.slice(0, 10))}`
            : check.address
        }
      />

      <form onSubmit={handleSave} className="space-y-6">
        <fieldset>
          <legend className="mb-1.5 text-sm font-medium">Outcome</legend>
          <div className="divide-y divide-line border border-line bg-surface">
            {OUTCOMES.map(option => {
              const isSelected = option.value === outcome
              return (
                <button
                  key={option.value}
                  type="button"
                  role="radio"
                  aria-checked={isSelected}
                  onClick={() => edit(setOutcome)(option.value)}
                  className={`flex w-full items-center justify-between px-4 py-3.5 text-left text-sm transition ${
                    isSelected
                      ? 'bg-ink font-semibold text-white'
                      : 'hover:bg-canvas'
                  }`}
                >
                  {option.label}
                  {isSelected && <span aria-hidden="true">✓</span>}
                </button>
              )
            })}
          </div>
        </fieldset>

        {selected?.asksForFinalRent && (
          <TextField
            label="Final agreed rent ($)"
            id="finalRent"
            type="number"
            inputMode="numeric"
            min="1"
            value={finalRent}
            onChange={event => edit(setFinalRent)(event.target.value)}
            placeholder={`Asking was ${check.askingRent}`}
          />
        )}

        <div>
          <label htmlFor="note" className="mb-1.5 block text-sm font-medium">
            Note <span className="font-normal text-muted">(optional)</span>
          </label>
          <textarea
            id="note"
            rows={3}
            maxLength={280}
            value={note}
            onChange={event => edit(setNote)(event.target.value)}
            placeholder="e.g. Landlord agreed after I sent the comparables."
            className="w-full border border-line bg-surface px-3 py-3 text-sm text-ink placeholder:text-muted focus:border-ink focus:outline-none"
          />
        </div>

        {justSaved && (
          <p
            className="border border-positive px-3 py-2 text-sm font-semibold text-positive"
            role="status"
          >
            ✓ Outcome saved. You can come back and update it any time.
          </p>
        )}

        <Button type="submit" disabled={!outcome || unchanged}>
          {justSaved
            ? 'Saved'
            : savedOutcome
              ? 'Update outcome'
              : 'Save outcome'}
        </Button>
      </form>
    </div>
  )
}
