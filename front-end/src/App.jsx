import { useState } from "react"
import mockApplications from "./data/mockApplications"

const stages = [
  "Saved",
  "Preparing",
  "Applied",
  "Interview",
  "Rejected",
  "Offer",
]

function StageSection({ stage, applications, sortBy }) {
  const [expanded, setExpanded] = useState(false)

  const stageApplications = applications
    .filter((application) => application.stage === stage)
    .sort((a, b) => {
      if (sortBy === "company") {
        return a.company.localeCompare(b.company)
      }

      if (sortBy === "title") {
        return a.title.localeCompare(b.title)
      }

      return 0
    })

  if (stageApplications.length === 0) {
    return null
  }

  const visibleApplications = expanded
    ? stageApplications
    : stageApplications.slice(0, 2)

  const hiddenCount = stageApplications.length - 2

  return (
    <section>
      <h3>
        {stage} ({stageApplications.length})
      </h3>

      {visibleApplications.map((application) => (
        <div key={application.id}>
          <h4>{application.title}</h4>
          <p>{application.company}</p>
        </div>
      ))}

      {stageApplications.length > 2 && (
        <button onClick={() => setExpanded(!expanded)}>
          {expanded ? "Show less" : `Show ${hiddenCount} more`}
        </button>
      )}
    </section>
  )
}

function App() {
  const [selectedStage, setSelectedStage] = useState("All")
  const [sortBy, setSortBy] = useState("default")

  return (
    <main className="app">
      <h1>CareerHive</h1>
      <h2>My Tracker</h2>

      <div>
        <label>
          Stage:
          <select
            value={selectedStage}
            onChange={(event) => setSelectedStage(event.target.value)}
          >
            <option value="All">All stages</option>

            {stages.map((stage) => (
              <option key={stage} value={stage}>
                {stage}
              </option>
            ))}
          </select>
        </label>

        <label>
          Sort:
          <select
            value={sortBy}
            onChange={(event) => setSortBy(event.target.value)}
          >
            <option value="default">Default</option>
            <option value="company">Company A-Z</option>
            <option value="title">Job title A-Z</option>
          </select>
        </label>
      </div>

      {stages
        .filter(
          (stage) => selectedStage === "All" || stage === selectedStage
        )
        .map((stage) => (
          <StageSection
            key={stage}
            stage={stage}
            applications={mockApplications}
            sortBy={sortBy}
          />
        ))}
    </main>
  )
}

export default App