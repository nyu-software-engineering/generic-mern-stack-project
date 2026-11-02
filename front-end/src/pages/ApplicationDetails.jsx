function ApplicationDetails({ application, onBack }) {
  return (
    <main>
      <button onClick={onBack}>Back to Tracker</button>

      <h1>Application Details</h1>

      <h2>{application.title}</h2>
      <p>{application.company}</p>

      <section>
        <h3>Current Stage</h3>
        <p>{application.stage}</p>
      </section>

      <section>
        <h3>Stage History</h3>

        {application.history.map((item, index) => (
          <div key={`${item.stage}-${index}`}>
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