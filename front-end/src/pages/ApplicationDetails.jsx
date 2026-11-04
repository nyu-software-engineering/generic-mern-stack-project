const stages = [
  "Saved",
  "Preparing",
  "Applied",
  "Interview",
  "Rejected",
  "Offer",
]

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
  onStageChange,
}) {
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

        <select
          value={application.stage}
          onChange={(event) =>
            onStageChange(event.target.value)
          }
        >
          {stages.map((stage) => (
            <option key={stage} value={stage}>
              {stage}
            </option>
          ))}
        </select>
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

        <p>
          {application.note || "No notes yet."}
        </p>
      </section>
    </main>
  )
}

export default ApplicationDetails