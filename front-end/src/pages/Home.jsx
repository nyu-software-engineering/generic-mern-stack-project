import { useEffect, useState } from 'react'
import { useAppState } from '../data/useAppState.js'
import { getJobs } from '../jobs/api.js'
import { formatJobDate } from '../jobs/formatters.js'
import ApplicationDetails from './ApplicationDetails.jsx'
import './Home.css'

const stages = ['Saved', 'Preparing', 'Applied', 'Interview', 'Rejected', 'Offer']
const DAY = 86400000

function utcDay(value) {
    const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value || '')
    if (!match) return null
    return Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3]))
}

function todayUtc() {
    const now = new Date()
    return Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
}

function Home() {
    const appState = useAppState()
    const [jobs, setJobs] = useState([])
    const [jobsStatus, setJobsStatus] = useState('loading')
    const [selectedId, setSelectedId] = useState('')

    useEffect(() => {
        let active = true
        getJobs().then((jobData) => {
            if (!active) return
            setJobs(jobData)
            setJobsStatus('ready')
        }, () => {
            if (!active) return
            setJobsStatus('error')
        })
        return () => { active = false }
    }, [])

    if (!appState || appState.status === 'error' || jobsStatus === 'error') {
        return <p role="alert">Could not load home.</p>
    }
    if (appState.status === 'loading' || jobsStatus === 'loading') return <p>Loading home…</p>

    const selected = appState.applications.find((application) => application.id === selectedId)
    if (selected) {
        const job = jobs.find((item) => item.id === selected.jobId)
        return (
            <ApplicationDetails
                application={selected}
                job={job}
                onBack={() => setSelectedId('')}
                onNoteSave={(note) => appState.updateApplication(selected.id, { note })}
                onRemove={() => {
                    appState.removeApplication(selected.id)
                    setSelectedId('')
                }}
            />
        )
    }

    const today = todayUtc()
    const upcoming = []
    appState.applications.forEach((application) => {
        if (application.stage === 'Offer' || application.stage === 'Rejected') return
        const job = jobs.find((item) => item.id === application.jobId)
        const deadline = utcDay(job && job.deadline)
        if (deadline === null || deadline < today) return
        upcoming.push({ application, job, deadline })
    })
    upcoming.sort((a, b) => a.deadline - b.deadline)

    const totals = stages
        .map((stage) => ({
            stage,
            count: appState.applications.filter((application) => application.stage === stage).length,
        }))
        .filter((item) => item.count > 0)

    return (
        <section className="home">
            <h1>Home</h1>
            <h2>Upcoming deadlines</h2>
            {upcoming.length === 0 ? <p>No upcoming deadlines.</p> : (
                <ul className="home-deadlines">
                    {upcoming.slice(0, 3).map((row) => (
                        <li key={row.application.id}>
                            <button type="button" className="home-deadline" onClick={() => setSelectedId(row.application.id)}>
                                <span>{formatJobDate(row.job.deadline)}</span>
                                <span>{row.job.title}</span>
                                <span>{row.application.stage}</span>
                            </button>
                        </li>
                    ))}
                </ul>
            )}
            <a href="#/deadlines">See all</a>
            <h2>My applications</h2>
            {totals.length === 0 ? <p>No applications yet.</p> : (
                <ul className="home-totals">
                    {totals.map((item) => (
                        <li key={item.stage}>
                            <a href={'#/tracker?stage=' + encodeURIComponent(item.stage)}>
                                {item.stage} {item.count}
                            </a>
                        </li>
                    ))}
                </ul>
            )}
            <a href="#/profile">My Profile</a>
        </section>
    )
}

export default Home