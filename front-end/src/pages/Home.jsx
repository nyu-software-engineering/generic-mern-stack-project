import { useEffect, useState } from 'react'
import { useAppState } from '../data/useAppState.js'
import { getJobs } from '../jobs/api.js'
import { formatJobDate } from '../jobs/formatters.js'
import ApplicationDetails from './ApplicationDetails.jsx'
import './Home.css'
import { getJobHref } from '../jobs/routes.js'

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
    const [recommendations, setRecommendations] = useState([])
    const [matchStatus, setMatchStatus] = useState('loading')

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

    useEffect(() => {
        if (jobsStatus !== 'ready' || appState?.status !== 'ready') return
        const controller = new AbortController()
        let active = true
        setMatchStatus('loading')
        Promise.all(jobs.map((job) => appState.matchFor(job.id, { signal: controller.signal }).then(
            (resource) => ({ job, resource }),
            () => ({ job, resource: { status: 'error' } }),
        ))).then((results) => {
            if (!active) return
            if (results.some((item) => item.resource.status === 'incomplete-profile')) {
                setRecommendations([])
                setMatchStatus('incomplete')
                return
            }
            const ready = results.filter((item) => item.resource.status === 'ready' && item.resource.data.jobId === item.job.id)
            ready.sort((a, b) => (b.resource.data.score ?? -1) - (a.resource.data.score ?? -1))
            setRecommendations(ready.slice(0, 2))
            setMatchStatus('ready')
        })
        return () => { active = false; controller.abort() }
    }, [jobs, jobsStatus, appState?.status, appState?.profile, appState?.matchFor])

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
            <h2>Recommended for you</h2>
            {matchStatus === 'loading' ? <p>Loading recommendations…</p> : null}
            {matchStatus === 'incomplete' ? (
                <p>
                    We need your profile information to show recommendations.
                    <a href="#/profile/edit"> Complete profile</a>
                </p>
            ) : null}
            {matchStatus === 'ready' && recommendations.length === 0 ? <p>No recommendations yet.</p> : null}
            {matchStatus === 'ready' && recommendations.length > 0 ? (
                <ul className="home-recommendations">
                    {recommendations.map((item) => (
                        <li key={item.job.id}>
                            <a className="home-recommendation" href={getJobHref(item.job.id)}>
                                {item.job.logoUrl ? <img src={item.job.logoUrl} alt="" width="44" height="44" /> : null}
                                <span>{item.job.title}</span>
                                <span>{item.job.company}</span>
                                <span>{item.resource.data.score == null ? 'Match not available' : item.resource.data.score + '% match'}</span>
                                <span>{item.resource.data.summary}</span>
                            </a>
                        </li>
                    ))}
                </ul>
            ) : null}
            <a href="#/profile">My Profile</a>
        </section>
    )
}

export default Home