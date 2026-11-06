import { useState } from "react"

function formatDate(date) {
  if (!date) {
    return "None"
  }

  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

function ApplicationDetails({
  application,
  job,
  onBack,
  onNoteSave,
  onRemove,
}) {
  const [draftNote, setDraftNote] = useState(
    application.note ?? ""
  )

  const savedNote = application.note ?? ""
  const noteChanged = draftNote !== savedNote

  function handleSaveNote() {
    onNoteSave(draftNote)
  }

  function handleClearNote() {
    setDraftNote("")
    onNoteSave("")
  }

  function handleRemove() {
    const confirmed = window.confirm(
      "Are you sure you want to remove this application from your Tracker?"
    )

    if (!confirmed) {
      return
    }

    onRemove()
  }

  return (
    <main className="app">
      <button onClick={onBack}>
        Back to Tracker
      </button>

      <h1>Application Details</h1>

      <h2>{job?.title || "Unknown job"}</h2>
      <p>{job?.company || "Unknown company"}</p>

      <section>
        <h3>Current Stage</h3>
        <p>{application.stage}</p>
      </section>

      <section>
        <h3>Deadline</h3>
        <p>{formatDate(job?.deadline)}</p>
      </section>

      <section>
        <h3>Last Updated</h3>
        <p>{formatDate(application.updatedAt)}</p>
      </section>

      <section>
        <h3>Stage History</h3>

        {application.history.map((item, index) => (
          <div
            key={`${item.stage}-${item.at}-${index}`}
          >
            <strong>{item.stage}</strong>
            <p>{formatDate(item.at)}</p>
          </div>
        ))}
      </section>

      <section>
        <h3>Notes</h3>

        <textarea
          value={draftNote}
          onChange={(event) =>
            setDraftNote(event.target.value)
          }
          rows="5"
          placeholder="Add notes about this application"
        />

        <div>
          <button
            onClick={handleSaveNote}
            disabled={!noteChanged}
          >
            Save Note
          </button>

          <button
            onClick={handleClearNote}
            disabled={
              draftNote === "" && savedNote === ""
            }
          >
            Clear Note
          </button>
        </div>
      </section>

      <section>
        <h3>Remove Application</h3>

        <p>
          Removing this application will remove it from your Tracker.
        </p>

        <button onClick={handleRemove}>
          Remove Application
        </button>
      </section>
    </main>
  )
}

export default ApplicationDetails