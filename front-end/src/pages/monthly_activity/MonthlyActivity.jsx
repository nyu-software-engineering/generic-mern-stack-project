import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import SplitLeaseLogo from '../../assets/splitlease-blank-background-logo.png'
import { getMonthlyActivity } from './mockActivity'
import './MonthlyActivity.css'

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const FULL_MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]
const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'bill', label: 'Bills' },
  { key: 'expense', label: 'Expenses' },
  { key: 'purchase', label: 'Purchases' },
  { key: 'payment', label: 'Payments' },
]
const TYPE_LABELS = { bill: 'Bill', expense: 'Expense', purchase: 'Purchase', payment: 'Payment' }

const formatMoney = amount =>
  '$' + Math.abs(amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

const MonthlyActivity = () => {
  const navigate = useNavigate()
  const today = new Date()
  const [year] = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth())
  const [filter, setFilter] = useState('all')
  const [members, setMembers] = useState([])
  const [activity, setActivity] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getMonthlyActivity().then(data => {
      setMembers(data.members)
      setActivity(data.activity)
      setLoading(false)
    })
  }, [])

  const monthEntries = activity
    .filter(a => a.year === year && a.month === month)
    .sort((a, b) => a.day - b.day)
  const shownEntries = filter === 'all' ? monthEntries : monthEntries.filter(a => a.type === filter)

  // payments settle balances between roommates, so only bills, expenses and purchases are split
  const sharedCosts = monthEntries.filter(a => a.type !== 'payment')
  const totalShared = sharedCosts.reduce((sum, a) => sum + a.amount, 0)
  const sharePerMember = members.length ? totalShared / members.length : 0
  const memberSummaries = members.map(m => {
    const paid = sharedCosts.filter(a => a.paidBy === m.id).reduce((sum, a) => sum + a.amount, 0)
    return { ...m, paid, due: sharePerMember - paid }
  })

  const activityMemberName = id => (members.find(m => m.id === id) || {}).name

  if (loading) {
    return (
      <div className="activityContainer">
        <p className="activityLoading">Loading activity...</p>
      </div>
    )
  }

  return (
    <div className="activityContainer">
      <header className="activityHeader">
        <img src={SplitLeaseLogo} alt="SplitLease logo" className="activityLogo" />
        <button type="button" className="activityBack" onClick={() => navigate(-1)}>
          Back
        </button>
      </header>

      <section className="activityCard">
        <h2 className="activitySectionTitle">Choose Month · {year}</h2>
        <div className="monthGrid">
          {MONTHS.map((label, index) => (
            <button
              key={label}
              type="button"
              className={index === month ? 'monthButton monthSelected' : 'monthButton'}
              onClick={() => setMonth(index)}
            >
              {label}
            </button>
          ))}
        </div>
      </section>

      <section className="activityCard">
        <h1 className="summaryTitle">{FULL_MONTHS[month]} Summary</h1>
        <p className="summaryTotal">
          {formatMoney(totalShared)} in shared costs · {formatMoney(sharePerMember)} per person
        </p>

        <div className="filterRow">
          {FILTERS.map(f => (
            <button
              key={f.key}
              type="button"
              className={filter === f.key ? 'filterChip filterSelected' : 'filterChip'}
              onClick={() => setFilter(f.key)}
            >
              {f.label}
            </button>
          ))}
        </div>

        {shownEntries.length === 0 ? (
          <p className="activityEmpty">No activity for {FULL_MONTHS[month]}.</p>
        ) : (
          <ul className="entryList">
            {shownEntries.map(a => (
              <li key={a.id} className="entryRow">
                <div className="entryInfo">
                  <span className="entryName">{a.name}</span>
                  <span className="entryMeta">
                    {TYPE_LABELS[a.type]} · {MONTHS[a.month]} {a.day} · paid by {activityMemberName(a.paidBy)}
                  </span>
                </div>
                <span className="entryAmount">{formatMoney(a.amount)}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="activityCard">
        <h2 className="activitySectionTitle">Who Paid What</h2>
        <div className="activityMemberGrid">
          {memberSummaries.map(m => (
            <div key={m.id} className="activityMemberCard">
              <img src={m.avatar} alt={m.name} className="activityMemberAvatar" />
              <span className="activityMemberName">{m.name}</span>
              <span className="activityMemberStat">Paid {formatMoney(m.paid)}</span>
              <span className={m.due > 0 ? 'activityMemberDue owes' : 'activityMemberDue owed'}>
                {m.due > 0 ? `Owes ${formatMoney(m.due)}` : `Is owed ${formatMoney(m.due)}`}
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

export default MonthlyActivity
