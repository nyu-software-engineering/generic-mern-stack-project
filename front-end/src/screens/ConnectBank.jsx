// Track the connecting message and navigate to the report screen.
import { useState } from 'react'
import { useNavigate } from 'react-router'

// Reuse the app's shared UI components.
import Button from '../components/ui/Button.jsx'
import Card from '../components/ui/Card.jsx'
import ScreenTitle from '../components/ui/ScreenTitle.jsx'
import SectionTitle from '../components/ui/SectionTitle.jsx'
import { saveBankConnection } from '../data/bankConnection.js'

// These are explanatory screen labels, not data from the back end.
const weCheck = [
  'Your monthly rent payments and whether they were on time',
  'How steady your income has been',
  'How your rent compares to your income',
]

const weNeverShare = [
  'Your other transactions',
  'Your balances or account numbers',
]

// Pause briefly so the connecting state is visible in the demo.
const connectDelayMs = 1200

export default function ConnectBank() {
  const navigate = useNavigate()
  const [isConnecting, setIsConnecting] = useState(false)

  // Sprint 1 simulates the connection; a real bank connection comes later.
  const handleConnect = () => {
    setIsConnecting(true)
    setTimeout(() => {
      saveBankConnection()
      navigate('/report')
    }, connectDelayMs)
  }

  // Render the screen title, privacy details, and connect action.
  return (
    <div>
      <ScreenTitle
        title="Connect your bank"
        subtitle="Turn the rent you've already paid into a Reliability Report you can share with landlords."
      />

      <div className="mb-6 space-y-3">
        <Card>
          <SectionTitle>What we check</SectionTitle>
          <ul className="space-y-2">
            {weCheck.map((item) => (
              <li key={item} className="flex gap-2 text-sm">
                <span className="font-semibold text-positive">✓</span>
                {item}
              </li>
            ))}
          </ul>
        </Card>

        <Card>
          <SectionTitle>What landlords never see</SectionTitle>
          <ul className="space-y-2">
            {weNeverShare.map((item) => (
              <li key={item} className="flex gap-2 text-sm">
                <span className="font-semibold text-negative">✕</span>
                {item}
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <details className="mb-4 border border-line bg-surface p-4">
        <summary className="cursor-pointer text-sm font-semibold">
          Why connect my bank?
        </summary>
        <p className="mt-2 text-sm text-muted">
          We use rent payment history and income patterns to prepare your Reliability Report.
        </p>
      </details>
        
      <Button onClick={handleConnect} disabled={isConnecting}>
        {isConnecting ? 'Connecting…' : 'Connect bank account'}
      </Button>

      <p className="mt-3 text-center text-xs text-muted">
        Read-only access. You can disconnect at any time.
      </p>
    </div>
  )
}