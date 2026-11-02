import { useNavigate } from 'react-router-dom'
import { Button } from '../components'

export default function WelcomePage() {
  
  const navigate = useNavigate()

  return (

    <div className="min-h-screen flex flex-col px-6 pb-12">
      <div className="flex-1 flex flex-col items-center justify-center gap-4">

        <div className="w-24 h-24 rounded-full bg-stone-200" />
        <h1 className="text-4xl font-bold">Worn</h1>
        <p className="text-stone-600 text-center">

          Track your wardrobe. Make every wear count.
        </p>
      </div>

      <div className="flex flex-col gap-3">

        <Button variant="primary" size="lg" fullWidth onClick={() => navigate('/signup')}>

          Create account
        </Button>
        <Button variant="secondary" size="lg" fullWidth onClick={() => navigate('/login')}>
          Log in
        </Button>

      </div>
    </div>
  )
}
