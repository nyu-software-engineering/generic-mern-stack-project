import { Router } from 'express'

const router = Router()

// Route scaffolding only. Replace these handlers as each auth feature is built.
function notImplemented(feature) {
  return (_req, res) => {
    res.status(501).json({
      error: { code: 'NOT_IMPLEMENTED', message: `${feature} is not implemented yet.` },
    })
  }
}

router.post('/register', notImplemented('Account creation'))
router.post('/login', notImplemented('Login'))
router.post('/logout', notImplemented('Logout'))
router.post('/forgot-password', notImplemented('Password recovery'))
router.post('/reset-password', notImplemented('Password reset'))

export default router
