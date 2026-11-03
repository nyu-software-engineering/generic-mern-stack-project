function ApplicationDetails({
  application,
  onBack,
  onStageChange,
}) {
  return (
    <main className="app">
      <button onClick={onBack}>Back to Tracker</button>

      <h1>Application Details</h1>

      <h2>{application.title}</h2>
      <p>{application.company}</p>

      <section>
        <h3>Current Stage</h3>

        <select
          value={application.stage}
          onChange={(event) =>
            onStageChange(application.id, event.target.value)
          }
        >
          <option value="Saved">Saved</option>
          <option value="Preparing">Preparing</option>
          <option value="Applied">Applied</option>
          <option value="Interview">Interview</option>
          <option value="Offer">Offer</option>
          <option value="Rejected">Rejected</option>
        </select>
      </section>

      <section>
        <h3>Stage History</h3>

        {application.history.map((item, index) => (
          <div key={`${item.stage}-${item.date}-${index}`}>
            <strong>{item.stage}</strong>
            <p>{item.date}</p>
          </div>
        ))}
      </section>

      <section>
        <h3>Notes</h3>
        <p>{application.note || "No notes yet."}</p>
      </section>
    </main>
  )
}

export default ApplicationDetails