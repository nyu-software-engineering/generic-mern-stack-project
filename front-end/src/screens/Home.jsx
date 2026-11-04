import { useEffect, useState } from 'react'
import Button from '../components/ui/Button.jsx'
import Card from '../components/ui/Card.jsx'
import ScreenTitle from '../components/ui/ScreenTitle.jsx'
import SectionTitle from '../components/ui/SectionTitle.jsx'
import { getProfile } from '../data/api.js'

const TOOLS = [
  { label: 'Reliability Report', to: '/report' },
  { label: 'Followed areas', to: '/followed-areas' },
  { label: 'Negotiate', to: '/negotiate' },
  { label: 'Explore Areas', to: '/explore' },
]

export default function Home() {
  const [firstName, setFirstName] = useState('')

  useEffect(() => {
    getProfile().then((profile) => setFirstName(profile.name.split(' ')[0]))
  }, [])

  return (
    <div>
      <ScreenTitle title={firstName ? `Hi ${firstName}` : 'Hi'} subtitle="What would you like to do today?" />

      <div className="mb-6">
        <Card to="/check">
          <div className="text-center">
            <p className="text-lg font-semibold">Check an apartment</p>
            <p className="text-sm text-muted">See if a rent is fair before you sign</p>
          </div>
        </Card>
      </div>

      <SectionTitle>Your tools</SectionTitle>
      <ul className="space-y-3">
        {TOOLS.map((tool) => (
          <li key={tool.to}>
            <Button to={tool.to} variant="secondary">
              {tool.label}
            </Button>
          </li>
        ))}
      </ul>
    </div>
  )
}
