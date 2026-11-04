import { useState } from "react"
import mockApplications from "../data/mockApplications"
import mockJobs from "../data/mockJobs"
import ApplicationDetails from "./ApplicationDetails"

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

function getJobForApplication(application) {
  return mockJobs.find(
    (job) => job.id === application.jobId
  )
}

function StageSection({
  stage,
  applications,
  sortBy,
  onViewDetails,
}) {
  const [expanded, setExpanded] = useState(false)

  const stageApplications = applications
    .filter((application) => application.stage === stage)
    .sort((a, b) => {
      if (sortBy === "deadline") {
        const aJob = getJobForApplication(a)
        const bJob = getJobForApplication(b)

        const aDeadline = aJob?.deadline
          ? new Date(aJob.deadline).getTime()
          : Infinity

        const bDeadline = bJob?.deadline
          ? new Date(bJob.deadline).getTime()
          : Infinity

        return aDeadline - bDeadline
      }

      if (sortBy === "updated") {
        return (
          new Date(b.updatedAt).getTime() -
          new Date(a.updatedAt).getTime()
        )
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

      {visibleApplications.map((application) => {
        const job = getJobForApplication(application)

        if (!job) {
          return null
        }

        const latestHistory =
          application.history[
            application.history.length - 1
          ]

        return (
          <div key={application.id}>
            <h4>{job.title}</h4>

            <p>{job.company}</p>

            <p>Stage: {application.stage}</p>

            <p>
              Deadline: {formatDate(job.deadline)}
            </p>

            <p>
              Last updated:{" "}
              {formatDate(application.updatedAt)}
            </p>

            <p>
              Stage updated:{" "}
              {latestHistory
                ? formatDate(latestHistory.at)
                : "None"}
            </p>

            <button
              onClick={() =>
                onViewDetails(application)
              }
            >
              View Details
            </button>
          </div>
        )
      })}

      {stageApplications.length > 2 && (
        <button
          onClick={() => setExpanded(!expanded)}
        >
          {expanded
            ? "Show less"
            : `Show ${hiddenCount} more`}
        </button>
      )}
    </section>
  )
}

function Tracker() {
  const [selectedStage, setSelectedStage] =
    useState("All")

  const [sortBy, setSortBy] =
    useState("default")

  const [
    selectedApplication,
    setSelectedApplication,
  ] = useState(null)

  if (selectedApplication) {
    const selectedJob =
      getJobForApplication(selectedApplication)

    return (
      <ApplicationDetails
        application={selectedApplication}
        job={selectedJob}
        onBack={() =>
          setSelectedApplication(null)
        }
      />
    )
  }

  return (
    <main className="app">
      <h1>CareerHive</h1>

      <h2>My Tracker</h2>

      <p>
        Total applications: {mockApplications.length}
      </p>

      <div>
        <label>
          Stage:
          <select
            value={selectedStage}
            onChange={(event) =>
              setSelectedStage(event.target.value)
            }
          >
            <option value="All">
              All stages
            </option>

            {stages.map((stage) => (
              <option
                key={stage}
                value={stage}
              >
                {stage}
              </option>
            ))}
          </select>
        </label>

        <label>
          Sort:
          <select
            value={sortBy}
            onChange={(event) =>
              setSortBy(event.target.value)
            }
          >
            <option value="default">
              Default
            </option>

            <option value="deadline">
              Deadline
            </option>

            <option value="updated">
              Last Updated
            </option>
          </select>
        </label>
      </div>

      {stages
        .filter(
          (stage) =>
            selectedStage === "All" ||
            stage === selectedStage
        )
        .map((stage) => (
          <StageSection
            key={stage}
            stage={stage}
            applications={mockApplications}
            sortBy={sortBy}
            onViewDetails={
              setSelectedApplication
            }
          />
        ))}
    </main>
  )
}

export default Tracker