import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, PageHeader, Sheet } from '../components'

export default function ProfilePage() {
  const navigate = useNavigate()

  // placeholder user for now
  const name = 'Your name'
  const email = 'you@example.com'

  const [photo, setPhoto] = useState(null)

  const [showLogout, setShowLogout] = useState(false)
  const [showDelete, setShowDelete] = useState(false)

  function handlePhotoChange(event) {
    const file = event.target.files[0]
    if (file) {
      setPhoto(URL.createObjectURL(file))
    }
  }

  function goToWelcome() {
    navigate('/welcome')
  }

  return (
    <div className="pb-8">
      <PageHeader title="Profile" />

      <div className="flex items-center gap-4 px-4">
        {photo ? (
          <img src={photo} alt="Profile" className="h-20 w-20 rounded-full object-cover" />
        ) : (
          <div className="h-20 w-20 rounded-full bg-stone-200"></div>
        )}

        <div>
          <p className="font-semibold">{name}</p>
          <p className="text-sm text-stone-500">{email}</p>

          <label className="mt-2 block cursor-pointer text-sm font-medium">
            Edit profile picture
            <input type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
          </label>
        </div>
      </div>


      <div className="mt-8 px-4">
        <h2 className="text-xs font-semibold text-stone-500">ACCOUNT</h2>

        {/* don't have routes for these yet */}
   <button type="button" onClick={() => navigate('/profile/edit-email')} className="flex w-full justify-between border-b border-stone-200 py-3 text-sm">
     <span>Edit email</span>
     <span>&gt;</span>
   </button>
        <button type="button" className="flex w-full justify-between border-b border-stone-200 py-3 text-sm">
          <span>Change password</span>
          <span>&gt;</span>
        </button>
      </div>

      <div className="mt-8 flex flex-col gap-3 px-4">
        <Button fullWidth onClick={() => setShowLogout(true)}>
          Log out
        </Button>
        <Button variant="secondary" fullWidth onClick={() => setShowDelete(true)}>
          Delete account
        </Button>
      </div>

      <Sheet open={showLogout} onClose={() => setShowLogout(false)} title="Log out?">
        <div className="flex flex-col gap-3">
          <Button fullWidth onClick={goToWelcome}>
            Log out
          </Button>
          <Button variant="secondary" fullWidth onClick={() => setShowLogout(false)}>
            Cancel
          </Button>
        </div>
      </Sheet>

      <Sheet open={showDelete} onClose={() => setShowDelete(false)} title="Delete your account?">
        <p className="mb-4 text-sm text-stone-600">This can't be undone.</p>
        <div className="flex flex-col gap-3">
          <Button variant="danger" fullWidth onClick={goToWelcome}>
            Delete account
          </Button>
          <Button variant="secondary" fullWidth onClick={() => setShowDelete(false)}>
            Cancel
          </Button>
        </div>
      </Sheet>
    </div>
  )
}