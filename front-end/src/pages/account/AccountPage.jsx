import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import PageIntro from '../../components/layout/PageIntro.jsx'
import Modal from '../../components/ui/Modal.jsx'
import { user } from '../../services/mockData.js'

const menuButtonClass =
  'inline-flex min-h-12 w-full items-center justify-center rounded-[2rem] border border-border px-6 py-3.5 font-[650] text-ink no-underline hover:bg-hover'

function AccountPage() {
  const [confirmingLogout, setConfirmingLogout] = useState(false)
  const navigate = useNavigate()

  return (
    <>
      <PageIntro eyebrow="Practice account" title="Account" description="Your profile and practice settings." />

      <section aria-label="Account summary" className="rounded-2xl border border-border p-6">
        <p className="text-xl font-semibold tracking-[-0.03em]">{user.displayName}</p>
        <p className="mt-1 text-muted">{user.email}</p>
      </section>

      <nav aria-label="Account options" className="mt-6 flex flex-col gap-3">
        <Link to="/account/profile" className={menuButtonClass}>
          Profile
        </Link>
        <Link to="/learn" className={menuButtonClass}>
          Learning progress
        </Link>
        <Link to="/account/achievements" className={menuButtonClass}>
          Achievements
        </Link>
        <Link to="/learn" className={menuButtonClass}>
          Replay tutorial
        </Link>
        <Link to="/leaderboard" className={menuButtonClass}>
          Leaderboard privacy
        </Link>
        <button type="button" onClick={() => setConfirmingLogout(true)} className={`${menuButtonClass} cursor-pointer bg-surface`}>
          Log out
        </button>
      </nav>

      {confirmingLogout && (
        <Modal title="Log out?" onClose={() => setConfirmingLogout(false)}>
          <p>Your practice portfolio and learning progress will be saved.</p>
          <div className="mt-5 flex flex-col gap-3">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="min-h-12 w-full cursor-pointer rounded-[2rem] bg-accent px-6 py-3.5 font-[650] text-ink hover:bg-accent-hover"
            >
              Log out
            </button>
            <button
              type="button"
              onClick={() => setConfirmingLogout(false)}
              className="min-h-12 w-full cursor-pointer rounded-[2rem] border border-border px-6 py-3.5 font-[650] text-ink hover:bg-hover"
            >
              Stay logged in
            </button>
          </div>
        </Modal>
      )}
    </>
  )
}

export default AccountPage
