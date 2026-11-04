import { useEffect, useState } from "react"
import { useAppState } from "../data/AppState.jsx"
import { getJobs } from "../jobs/api.js"
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

  if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    const [year, month, day] = date.split("-")

    return new Date(
      Number(year),
      Number(month) - 1,
      Number(day)
    ).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

function getJobForApplication(application, jobs) {
  return jobs.find(
    (job) => job.id === application.jobId
  )
}

function StageSection({
  stage,
  applications,
  jobs,
  sortBy,
  onViewDetails,
}) {
  const [expanded, setExpanded] = useState(false)

  const stageApplications = applications
    .filter((application) => application.stage === stage)
    .sort((a, b) => {
      if (sortBy === "deadline") {
        const aJob = getJobForApplication(a, jobs)
        const bJob = getJobForApplication(b, jobs)

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
        const job = getJobForApplication(application, jobs)

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
                onViewDetails(application.id)
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
  const appState = useAppState()

  const [selectedStage, setSelectedStage] =
    useState("All")

  const [sortBy, setSortBy] =
    useState("default")

  const [
    selectedApplicationId,
    setSelectedApplicationId,
  ] = useState(null)

  const [jobs, setJobs] = useState([])
  const [jobsStatus, setJobsStatus] =
    useState("loading")

  useEffect(() => {
    let active = true

    getJobs().then(
      (jobData) => {
        if (!active) {
          return
        }

        setJobs(jobData)
        setJobsStatus("ready")
      },
      () => {
        if (!active) {
          return
        }

        setJobs([])
        setJobsStatus("error")
      }
    )

    return () => {
      active = false
    }
  }, [])

  if (!appState) {
    return (
      <main className="app">
        <p>Application data is unavailable.</p>
      </main>
    )
  }

  if (
    appState.status === "loading" ||
    jobsStatus === "loading"
  ) {
    return (
      <main className="app">
        <p>Loading tracker...</p>
      </main>
    )
  }

  if (
    appState.status === "error" ||
    jobsStatus === "error"
  ) {
    return (
      <main className="app">
        <p>Could not load tracker data.</p>
      </main>
    )
  }

  const applications = appState.applications

  const selectedApplication =
    applications.find(
      (application) =>
        application.id === selectedApplicationId
    )

  if (selectedApplication) {
    const selectedJob =
      getJobForApplication(
        selectedApplication,
        jobs
      )

    return (
      <ApplicationDetails
        application={selectedApplication}
        job={selectedJob}
        onBack={() =>
            setSelectedApplicationId(null)
        }
        onRemove={() => {
            appState.removeApplication(
            selectedApplication.id
            )

            setSelectedApplicationId(null)
        }}
     />
    )
  }

  return (
    <main className="app">
      <h1>CareerHive</h1>

      <h2>My Tracker</h2>

      <p>
        Total applications: {applications.length}
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
            applications={applications}
            jobs={jobs}
            sortBy={sortBy}
            onViewDetails={
              setSelectedApplicationId
            }
          />
        ))}
    </main>
  )
}

export default Tracker