import { useEffect, useState } from 'react'
import { useAppState } from '../data/useAppState.js'
import { getJobs } from '../jobs/api.js'
import { formatJobDate } from '../jobs/formatters.js'
import ApplicationDetails from './ApplicationDetails.jsx'
import './Deadlines.css'

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

function inThisWeek(deadline, today) {
    const start = today - new Date(today).getUTCDay() * DAY
    return deadline >= start && deadline <= start + 6 * DAY
}

function inThisMonth(deadline, today) {
    const due = new Date(deadline)
    const now = new Date(today)
    return due.getUTCFullYear() === now.getUTCFullYear() && due.getUTCMonth() === now.getUTCMonth()
}

function daysLeft(deadline, today) {
    const days = Math.round((deadline - today) / DAY)
    if (days === 0) return 'Today'
    if (days === 1) return '1 day left'
    if (days > 1) return days + ' days left'
    if (days === -1) return '1 day ago'
    return Math.abs(days) + ' days ago'
}

function Deadlines() {
    const appState = useAppState()
    const [jobs, setJobs] = useState([])
    const [jobsStatus, setJobsStatus] = useState('loading')
    const [tab, setTab] = useState('week')
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

    if (appState.status === 'error' || jobsStatus === 'error') return <p role="alert">Could not load deadlines.</p>
    if (appState.status === 'loading' || jobsStatus === 'loading') return <p>Loading deadlines…</p>

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
    const rows = []
    appState.applications.forEach((application) => {
        if (application.stage === 'Offer' || application.stage === 'Rejected') return
        const job = jobs.find((item) => item.id === application.jobId)
        const deadline = utcDay(job && job.deadline)
        if (deadline === null) return
        if (tab === 'week' && !inThisWeek(deadline, today)) return
        if (tab === 'month' && !inThisMonth(deadline, today)) return
        rows.push({ application, job, deadline })
    })
    rows.sort((a, b) => a.deadline - b.deadline)

    return (
        <section className="deadlines">
            <h1>Deadlines</h1>
            <div className="deadline-tabs">
                <button type="button" className={tab === 'week' ? 'ui-button' : 'ui-button ui-button-secondary'} onClick={() => setTab('week')}>This week</button>
                <button type="button" className={tab === 'month' ? 'ui-button' : 'ui-button ui-button-secondary'} onClick={() => setTab('month')}>This month</button>
                <button type="button" className={tab === 'all' ? 'ui-button' : 'ui-button ui-button-secondary'} onClick={() => setTab('all')}>All</button>
            </div>
            {rows.length === 0 ? <p>No deadlines in this range.</p> : (
                <ul className="deadline-list">
                    {rows.map((row) => (
                        <li key={row.application.id}>
                            <button type="button" className="deadline-row" onClick={() => setSelectedId(row.application.id)}>
                                <span>{formatJobDate(row.job.deadline)}</span>
                                <span>{row.job.title}</span>
                                <span>{row.application.stage}</span>
                                <span>{daysLeft(row.deadline, today)}</span>
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </section>
    )
}

export default Deadlines